const express = require('express');
const router = express.Router();
const { JsonDatabase } = require('../database/json-db');

const db = new JsonDatabase();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const users = await db.getCollection('users');
    const testScenarios = await db.getCollection('testScenarios');
    const testPlans = await db.getCollection('testPlans');
    const testCycles = await db.getCollection('testCycles');
    const testExecutions = await db.getCollection('testExecutions');
    const defects = await db.getCollection('defects');

    const stats = {
      totalUsers: await users.count(),
      totalTestScenarios: await testScenarios.count(),
      totalTestPlans: await testPlans.count(),
      totalTestCycles: await testCycles.count(),
      totalTestExecutions: await testExecutions.count(),
      totalDefects: await defects.count(),
      timestamp: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent activities
router.get('/recent', async (req, res) => {
  try {
    const testExecutions = await db.getCollection('testExecutions');
    const defects = await db.getCollection('defects');

    const recentExecutions = await testExecutions.find();
    const recentDefects = await defects.find();

    // Sort by creation date and get recent items
    const recentActivities = [
      ...recentExecutions.map(exec => ({ ...exec, type: 'execution' })),
      ...recentDefects.map(defect => ({ ...defect, type: 'defect' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(0, 10);

    res.json(recentActivities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

module.exports = router;