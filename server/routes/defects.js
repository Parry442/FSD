const express = require('express');
const router = express.Router();
const { JsonDatabase } = require('../database/json-db');

const db = new JsonDatabase();

// Get all defects
router.get('/', async (req, res) => {
  try {
    const defects = await db.getCollection('defects');
    const allDefects = await defects.find();
    res.json(allDefects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch defects' });
  }
});

// Get defect by ID
router.get('/:id', async (req, res) => {
  try {
    const defects = await db.getCollection('defects');
    const defect = await defects.findById(req.params.id);
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }
    res.json(defect);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch defect' });
  }
});

// Create new defect
router.post('/', async (req, res) => {
  try {
    const defects = await db.getCollection('defects');
    const newDefect = await defects.insert(req.body);
    res.status(201).json(newDefect);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create defect' });
  }
});

// Update defect
router.put('/:id', async (req, res) => {
  try {
    const defects = await db.getCollection('defects');
    const updatedDefect = await defects.updateById(req.params.id, req.body);
    if (!updatedDefect) {
      return res.status(404).json({ error: 'Defect not found' });
    }
    res.json(updatedDefect);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update defect' });
  }
});

// Delete defect
router.delete('/:id', async (req, res) => {
  try {
    const defects = await db.getCollection('defects');
    const deletedDefect = await defects.deleteById(req.params.id);
    if (!deletedDefect) {
      return res.status(404).json({ error: 'Defect not found' });
    }
    res.json({ message: 'Defect deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete defect' });
  }
});

module.exports = router;