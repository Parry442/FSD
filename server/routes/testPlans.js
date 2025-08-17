const express = require('express');
const router = express.Router();
const { JsonDatabase } = require('../database/json-db');

const db = new JsonDatabase();

// Get all test plans
router.get('/', async (req, res) => {
  try {
    const testPlans = await db.getCollection('testPlans');
    const allPlans = await testPlans.find();
    res.json(allPlans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test plans' });
  }
});

// Get test plan by ID
router.get('/:id', async (req, res) => {
  try {
    const testPlans = await db.getCollection('testPlans');
    const plan = await testPlans.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Test plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test plan' });
  }
});

// Create new test plan
router.post('/', async (req, res) => {
  try {
    const testPlans = await db.getCollection('testPlans');
    const newPlan = await testPlans.insert(req.body);
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test plan' });
  }
});

// Update test plan
router.put('/:id', async (req, res) => {
  try {
    const testPlans = await db.getCollection('testPlans');
    const updatedPlan = await testPlans.updateById(req.params.id, req.body);
    if (!updatedPlan) {
      return res.status(404).json({ error: 'Test plan not found' });
    }
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update test plan' });
  }
});

// Delete test plan
router.delete('/:id', async (req, res) => {
  try {
    const testPlans = await db.getCollection('testPlans');
    const deletedPlan = await testPlans.deleteById(req.params.id);
    if (!deletedPlan) {
      return res.status(404).json({ error: 'Test plan not found' });
    }
    res.json({ message: 'Test plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete test plan' });
  }
});

module.exports = router;