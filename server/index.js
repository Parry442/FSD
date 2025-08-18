const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataAccess = require('./data');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../client/build')));

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = dataAccess.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For demo purposes, accept any password (in production, verify with bcrypt)
    // const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        permissions: user.permissions 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = dataAccess.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test Scenarios routes
app.get('/api/test-scenarios', authenticateToken, (req, res) => {
  try {
    const scenarios = dataAccess.getTestScenarios();
    res.json(scenarios);
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/test-scenarios/:id', authenticateToken, (req, res) => {
  try {
    const scenario = dataAccess.getTestScenarioById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ message: 'Test scenario not found' });
    }
    res.json(scenario);
  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/test-scenarios', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const newScenario = dataAccess.createTestScenario(req.body);
    res.status(201).json(newScenario);
  } catch (error) {
    console.error('Create scenario error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/test-scenarios/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const updatedScenario = dataAccess.updateTestScenario(req.params.id, req.body);
    if (!updatedScenario) {
      return res.status(404).json({ message: 'Test scenario not found' });
    }
    res.json(updatedScenario);
  } catch (error) {
    console.error('Update scenario error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/test-scenarios/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const success = dataAccess.deleteTestScenario(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Test scenario not found' });
    }
    res.json({ message: 'Test scenario deleted successfully' });
  } catch (error) {
    console.error('Delete scenario error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test Plans routes
app.get('/api/test-plans', authenticateToken, (req, res) => {
  try {
    const plans = dataAccess.getTestPlans();
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/test-plans/:id', authenticateToken, (req, res) => {
  try {
    const plan = dataAccess.getTestPlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Test plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/test-plans', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const newPlan = dataAccess.createTestPlan(req.body);
    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/test-plans/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const updatedPlan = dataAccess.updateTestPlan(req.params.id, req.body);
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Test plan not found' });
    }
    res.json(updatedPlan);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/test-plans/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const success = dataAccess.deleteTestPlan(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Test plan not found' });
    }
    res.json({ message: 'Test plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test Cycles routes
app.get('/api/test-cycles', authenticateToken, (req, res) => {
  try {
    const cycles = dataAccess.getTestCycles();
    res.json(cycles);
  } catch (error) {
    console.error('Get cycles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/test-cycles/:id', authenticateToken, (req, res) => {
  try {
    const cycle = dataAccess.getTestCycleById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ message: 'Test cycle not found' });
    }
    res.json(cycle);
  } catch (error) {
    console.error('Get cycle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/test-cycles', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const newCycle = dataAccess.createTestCycle(req.body);
    res.status(201).json(newCycle);
  } catch (error) {
    console.error('Create cycle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/test-cycles/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const updatedCycle = dataAccess.updateTestCycle(req.params.id, req.body);
    if (!updatedCycle) {
      return res.status(404).json({ message: 'Test cycle not found' });
    }
    res.json(updatedCycle);
  } catch (error) {
    console.error('Update cycle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/test-cycles/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const success = dataAccess.deleteTestCycle(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Test cycle not found' });
    }
    res.json({ message: 'Test cycle deleted successfully' });
  } catch (error) {
    console.error('Delete cycle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Defects routes
app.get('/api/defects', authenticateToken, (req, res) => {
  try {
    const defects = dataAccess.getDefects();
    res.json(defects);
  } catch (error) {
    console.error('Get defects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/defects/:id', authenticateToken, (req, res) => {
  try {
    const defect = dataAccess.getDefectById(req.params.id);
    if (!defect) {
      return res.status(404).json({ message: 'Defect not found' });
    }
    res.json(defect);
  } catch (error) {
    console.error('Get defect error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/defects', authenticateToken, requireRole(['Tester', 'Test Manager']), (req, res) => {
  try {
    const newDefect = dataAccess.createDefect(req.body);
    res.status(201).json(newDefect);
  } catch (error) {
    console.error('Create defect error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/defects/:id', authenticateToken, (req, res) => {
  try {
    const updatedDefect = dataAccess.updateDefect(req.params.id, req.body);
    if (!updatedDefect) {
      return res.status(404).json({ message: 'Defect not found' });
    }
    res.json(updatedDefect);
  } catch (error) {
    console.error('Update defect error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/defects/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const success = dataAccess.deleteDefect(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Defect not found' });
    }
    res.json({ message: 'Defect deleted successfully' });
  } catch (error) {
    console.error('Delete defect error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Users routes
app.get('/api/users', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const users = dataAccess.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
  try {
    const user = dataAccess.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/users', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const newUser = dataAccess.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const updatedUser = dataAccess.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    const success = dataAccess.deleteUser(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard routes
app.get('/api/dashboard', authenticateToken, (req, res) => {
  try {
    const dashboardData = dataAccess.getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// AI routes (placeholder for now)
app.post('/api/ai/generate-test-plan', authenticateToken, requireRole(['Test Manager']), (req, res) => {
  try {
    // Placeholder for AI test plan generation
    const generatedPlan = {
      id: 'ai-generated',
      name: 'AI Generated Test Plan',
      description: 'This is a placeholder for AI-generated test plans',
      testType: req.body.testType || 'Functional',
      status: 'Draft',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      message: 'AI feature coming soon!'
    };
    res.json(generatedPlan);
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Join room for real-time updates
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Leave room
  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });
});

// Broadcast updates to connected clients
const broadcastUpdate = (event, data, room = null) => {
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

// Make broadcast function available globally
global.broadcastUpdate = broadcastUpdate;

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Application Testing Suite server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`🔑 Default login: admin / password123`);
});

module.exports = { app, server, io };