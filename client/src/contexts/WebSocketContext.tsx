import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useSnackbar } from 'notistack';

// Types
interface Notification {
  id: string;
  type: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

interface WebSocketContextType {
  isConnected: boolean;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

// Create context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// WebSocket provider component
export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5001', {
          auth: {
            token: token
          }
        });

        // Connection events
        newSocket.on('connect', () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          enqueueSnackbar('Connection error. Some real-time features may not work.', { 
            variant: 'warning' 
          });
        });

        // Join role-based room
        newSocket.emit('join-room', user.role);
        if (user.department) {
          newSocket.emit('join-room', `dept_${user.department}`);
        }

        // Notification events
        newSocket.on('test-cycle-opened', (data) => {
          addNotification('test-cycle-opened', data.message, data);
        });

        newSocket.on('test-cycle-started', (data) => {
          addNotification('test-cycle-started', data.message, data);
        });

        newSocket.on('defect-assigned', (data) => {
          addNotification('defect-assigned', data.message, data);
        });

        newSocket.on('defect-assigned-to-category', (data) => {
          addNotification('defect-category', data.message, data);
        });

        newSocket.on('defect-closed', (data) => {
          addNotification('defect-closed', data.message, data);
        });

        newSocket.on('test-execution-completed', (data) => {
          addNotification('test-execution', data.message, data);
        });

        newSocket.on('test-plan-approved', (data) => {
          addNotification('test-plan-approved', data.message, data);
        });

        newSocket.on('test-plan-rejected', (data) => {
          addNotification('test-plan-rejected', data.message, data);
        });

        newSocket.on('test-cycle-completed', (data) => {
          addNotification('test-cycle-completed', data.message, data);
        });

        newSocket.on('scenario-updated', (data) => {
          addNotification('scenario-updated', data.message, data);
        });

        newSocket.on('bulk-scenario-update', (data) => {
          addNotification('bulk-update', data.message, data);
        });

        newSocket.on('bulk-test-plan-update', (data) => {
          addNotification('bulk-update', data.message, data);
        });

        newSocket.on('bulk-defect-update', (data) => {
          addNotification('bulk-update', data.message, data);
        });

        newSocket.on('system-alert', (data) => {
          addNotification('system-alert', data.message, data);
          // Show toast for system alerts
          enqueueSnackbar(data.message, { 
            variant: data.severity === 'error' ? 'error' : 
                     data.severity === 'warning' ? 'warning' : 'info' 
          });
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    }
  }, [isAuthenticated, user]);

  // Add notification
  const addNotification = (type: string, message: string, data?: any) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Show toast for important notifications
    if (['defect-assigned', 'test-cycle-opened', 'test-plan-approved'].includes(type)) {
      enqueueSnackbar(message, { variant: 'info' });
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Join room
  const joinRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('join-room', room);
    }
  };

  // Leave room
  const leaveRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('leave-room', room);
    }
  };

  // Context value
  const value: WebSocketContextType = {
    isConnected,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    joinRoom,
    leaveRoom
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Export default
export default WebSocketContext;