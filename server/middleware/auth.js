const jwt = require('jsonwebtoken');
const { User } = require('../database');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Specific role authorization functions
const requireTestManager = authorizeRole(['Test Manager']);
const requireTester = authorizeRole(['Test Manager', 'Tester']);
const requireTroubleshooter = authorizeRole(['Test Manager', 'Troubleshooter']);
const requireViewer = authorizeRole(['Test Manager', 'Tester', 'Troubleshooter', 'Viewer']);

// Resource ownership middleware
const requireOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID required' });
      }

      const resource = await resourceModel.findByPk(resourceId);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Test Managers can access all resources
      if (req.user.role === 'Test Manager') {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource or is assigned to it
      const isOwner = resource.owner === req.user.id || 
                     resource.createdBy === req.user.id ||
                     resource.assignedTo === req.user.id ||
                     resource.assignedTester === req.user.id;

      if (!isOwner) {
        return res.status(403).json({ error: 'Access denied to this resource' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Ownership verification failed' });
    }
  };
};

// Optional authentication middleware (for public endpoints)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting middleware
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(ip)) {
      requests.set(ip, requests.get(ip).filter(timestamp => timestamp > windowStart));
    }

    const currentRequests = requests.get(ip) || [];
    
    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    currentRequests.push(now);
    requests.set(ip, currentRequests);

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  requireTestManager,
  requireTester,
  requireTroubleshooter,
  requireViewer,
  requireOwnership,
  optionalAuth,
  rateLimit
};