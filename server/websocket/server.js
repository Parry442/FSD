const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../database');

let io;

// Store user connections
const userConnections = new Map();

// Setup WebSocket server
const setupWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.user.role})`);
    
    // Store user connection
    userConnections.set(socket.user.id, socket.id);
    
    // Join role-based rooms
    socket.join(socket.user.role);
    if (socket.user.department) {
      socket.join(`dept_${socket.user.department}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
      userConnections.delete(socket.user.id);
    });

    // Handle custom events
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`👥 User ${socket.user.username} joined room: ${room}`);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`👥 User ${socket.user.username} left room: ${room}`);
    });

    // Handle test execution updates
    socket.on('test-execution-update', (data) => {
      const { testCycleId, testScenarioId, status, testerId } = data;
      
      // Notify test cycle participants
      socket.to(`cycle_${testCycleId}`).emit('test-execution-updated', {
        testCycleId,
        testScenarioId,
        status,
        testerId,
        timestamp: new Date()
      });
    });

    // Handle defect updates
    socket.on('defect-update', (data) => {
      const { defectId, status, assigneeId, category } = data;
      
      // Notify relevant troubleshooters
      if (category) {
        socket.to(`category_${category}`).emit('defect-updated', {
          defectId,
          status,
          assigneeId,
          category,
          timestamp: new Date()
        });
      }
    });
  });

  console.log('🚀 WebSocket server initialized');
};

// Notification functions
const sendNotification = (userId, event, data) => {
  const socketId = userConnections.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

const sendNotificationToRole = (role, event, data) => {
  io.to(role).emit(event, data);
};

const sendNotificationToDepartment = (department, event, data) => {
  io.to(`dept_${department}`).emit(event, data);
};

const sendNotificationToRoom = (room, event, data) => {
  io.to(room).emit(event, data);
};

// Specific notification functions for the application
const notifyTestCycleOpened = (testCycleId, testers, testScenarios) => {
  testers.forEach(testerId => {
    sendNotification(testerId, 'test-cycle-opened', {
      testCycleId,
      testScenarios,
      message: 'A new test cycle has been opened with assigned test scenarios',
      timestamp: new Date()
    });
  });
};

const notifyTestCycleStarted = (testCycleId, testers) => {
  testers.forEach(testerId => {
    sendNotification(testerId, 'test-cycle-started', {
      testCycleId,
      message: 'Test cycle has started. Please begin executing assigned test scenarios.',
      timestamp: new Date()
    });
  });
};

const notifyDefectAssigned = (defectId, assigneeId, category, defectData) => {
  // Notify the assigned troubleshooter
  sendNotification(assigneeId, 'defect-assigned', {
    defectId,
    category,
    defectData,
    message: 'A new defect has been assigned to you for investigation',
    timestamp: new Date()
  });

  // Notify other troubleshooters in the same category
  sendNotificationToRoom(`category_${category}`, 'defect-assigned-to-category', {
    defectId,
    category,
    defectData,
    message: `A new ${category} defect has been assigned`,
    timestamp: new Date()
  });
};

const notifyDefectClosed = (defectId, testerId, defectData) => {
  // Notify the tester to retest
  sendNotification(testerId, 'defect-closed', {
    defectId,
    defectData,
    message: 'A defect has been resolved and requires retesting',
    timestamp: new Date()
  });
};

const notifyTestExecutionCompleted = (testExecutionId, testCycleId, status, testerId) => {
  // Notify test cycle participants
  sendNotificationToRoom(`cycle_${testCycleId}`, 'test-execution-completed', {
    testExecutionId,
    testCycleId,
    status,
    testerId,
    message: `Test execution completed with status: ${status}`,
    timestamp: new Date()
  });
};

const notifyTestPlanApproved = (testPlanId, testPlanData, approverId) => {
  // Notify test plan creator
  sendNotification(testPlanData.createdBy, 'test-plan-approved', {
    testPlanId,
    testPlanData,
    approverId,
    message: 'Your test plan has been approved',
    timestamp: new Date()
  });

  // Notify test managers about the approval
  sendNotificationToRole('Test Manager', 'test-plan-approved-notification', {
    testPlanId,
    testPlanData,
    approverId,
    message: 'A test plan has been approved',
    timestamp: new Date()
  });
};

const notifyTestPlanRejected = (testPlanId, testPlanData, rejectorId, reason) => {
  // Notify test plan creator
  sendNotification(testPlanData.createdBy, 'test-plan-rejected', {
    testPlanId,
    testPlanData,
    rejectorId,
    reason,
    message: 'Your test plan has been rejected',
    timestamp: new Date()
  });
};

const notifyTestCycleCompleted = (testCycleId, testCycleData, completionStats) => {
  // Notify all participants
  sendNotificationToRoom(`cycle_${testCycleId}`, 'test-cycle-completed', {
    testCycleId,
    testCycleData,
    completionStats,
    message: 'Test cycle has been completed',
    timestamp: new Date()
  });

  // Notify test managers
  sendNotificationToRole('Test Manager', 'test-cycle-completed-notification', {
    testCycleId,
    testCycleData,
    completionStats,
    message: 'A test cycle has been completed',
    timestamp: new Date()
  });
};

const notifyScenarioUpdated = (scenarioId, scenarioData, updaterId) => {
  // Notify scenario owner
  if (scenarioData.owner && scenarioData.owner !== updaterId) {
    sendNotification(scenarioData.owner, 'scenario-updated', {
      scenarioId,
      scenarioData,
      updaterId,
      message: 'A test scenario you own has been updated',
      timestamp: new Date()
    });
  }

  // Notify test managers
  sendNotificationToRole('Test Manager', 'scenario-updated-notification', {
    scenarioId,
    scenarioData,
    updaterId,
    message: 'A test scenario has been updated',
    timestamp: new Date()
  });
};

const notifyBulkUpdate = (updateType, affectedItems, updaterId) => {
  // Notify relevant users based on update type
  switch (updateType) {
    case 'scenarios':
      sendNotificationToRole('Test Manager', 'bulk-scenario-update', {
        updateType,
        affectedItems,
        updaterId,
        message: 'Multiple test scenarios have been updated',
        timestamp: new Date()
      });
      break;
    case 'test-plans':
      sendNotificationToRole('Test Manager', 'bulk-test-plan-update', {
        updateType,
        affectedItems,
        updaterId,
        message: 'Multiple test plans have been updated',
        timestamp: new Date()
      });
      break;
    case 'defects':
      sendNotificationToRole('Troubleshooter', 'bulk-defect-update', {
        updateType,
        affectedItems,
        updaterId,
        message: 'Multiple defects have been updated',
        timestamp: new Date()
      });
      break;
  }
};

const notifySystemAlert = (alertType, message, severity = 'info', targetRoles = []) => {
  const alertData = {
    type: alertType,
    message,
    severity,
    timestamp: new Date()
  };

  if (targetRoles.length > 0) {
    targetRoles.forEach(role => {
      sendNotificationToRole(role, 'system-alert', alertData);
    });
  } else {
    // Send to all connected users
    io.emit('system-alert', alertData);
  }
};

// Get connection status
const getConnectionStatus = (userId) => {
  return userConnections.has(userId);
};

const getOnlineUsers = () => {
  return Array.from(userConnections.keys());
};

const getOnlineUsersByRole = (role) => {
  // This would require additional tracking of user roles in connections
  // For now, return all online users
  return getOnlineUsers();
};

// Broadcast functions
const broadcastToAll = (event, data) => {
  io.emit(event, data);
};

const broadcastToRole = (role, event, data) => {
  io.to(role).emit(event, data);
};

const broadcastToRoom = (room, event, data) => {
  io.to(room).emit(event, data);
};

module.exports = {
  setupWebSocket,
  sendNotification,
  sendNotificationToRole,
  sendNotificationToDepartment,
  sendNotificationToRoom,
  notifyTestCycleOpened,
  notifyTestCycleStarted,
  notifyDefectAssigned,
  notifyDefectClosed,
  notifyTestExecutionCompleted,
  notifyTestPlanApproved,
  notifyTestPlanRejected,
  notifyTestCycleCompleted,
  notifyScenarioUpdated,
  notifyBulkUpdate,
  notifySystemAlert,
  getConnectionStatus,
  getOnlineUsers,
  getOnlineUsersByRole,
  broadcastToAll,
  broadcastToRole,
  broadcastToRoom
};