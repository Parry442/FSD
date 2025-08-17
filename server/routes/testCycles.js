const express = require('express');
const router = express.Router();
const { JsonDatabase } = require('../database/json-db');

const db = new JsonDatabase();

// Get all test cycles
router.get('/', async (req, res) => {
  try {
    const testCycles = await db.getCollection('testCycles');
    const allCycles = await testCycles.find();
    res.json(allCycles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test cycles' });
  }
});

// Get test cycle by ID
router.get('/:id', async (req, res) => {
  try {
    const testCycles = await db.getCollection('testCycles');
    const cycle = await testCycles.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ error: 'Test cycle not found' });
    }
    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test cycle' });
  }
});

// Create new test cycle
router.post('/', async (req, res) => {
  try {
    const testCycles = await db.getCollection('testCycles');
    const newCycle = await testCycles.insert(req.body);
    res.status(201).json(newCycle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create test cycle' });
  }
});

// Update test cycle
router.put('/:id', async (req, res) => {
  try {
    const testCycles = await db.getCollection('testCycles');
    const updatedCycle = await testCycles.updateById(req.params.id, req.body);
    if (!updatedCycle) {
      return res.status(404).json({ error: 'Test cycle not found' });
    }
    res.json(updatedCycle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update test cycle' });
  }
});

// Delete test cycle
router.delete('/:id', async (req, res) => {
  try {
    const testCycles = await db.getCollection('testCycles');
    const deletedCycle = await testCycles.deleteById(req.params.id);
    if (!deletedCycle) {
      return res.status(404).json({ error: 'Test cycle not found' });
    }
    res.json({ message: 'Test cycle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete test cycle' });
  }
});

module.exports = router;