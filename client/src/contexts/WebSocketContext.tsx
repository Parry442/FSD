import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to WebSocket server
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling']
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
        setIsConnected(false);
      });

      // Authentication events
      newSocket.on('authenticated', () => {
        console.log('WebSocket authenticated');
      });

      newSocket.on('unauthorized', () => {
        console.error('WebSocket unauthorized');
        setIsConnected(false);
      });

      // Test cycle notifications
      newSocket.on('test_cycle_started', (data) => {
        console.log('Test cycle started:', data);
        // Handle test cycle start notification
      });

      newSocket.on('test_cycle_completed', (data) => {
        console.log('Test cycle completed:', data);
        // Handle test cycle completion notification
      });

      // Defect notifications
      newSocket.on('defect_assigned', (data) => {
        console.log('Defect assigned:', data);
        // Handle defect assignment notification
      });

      newSocket.on('defect_resolved', (data) => {
        console.log('Defect resolved:', data);
        // Handle defect resolution notification
      });

      // Test execution notifications
      newSocket.on('test_execution_started', (data) => {
        console.log('Test execution started:', data);
        // Handle test execution start notification
      });

      newSocket.on('test_execution_completed', (data) => {
        console.log('Test execution completed:', data);
        // Handle test execution completion notification
      });

      // General notifications
      newSocket.on('notification', (data) => {
        console.log('General notification:', data);
        // Handle general notifications
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const unsubscribe = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    sendMessage,
    subscribe,
    unsubscribe
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};