const express = require('express');
const SavingsGoal = require('../models/SavingsGoal');

const router = express.Router();

// GET /api/goal -> { goal: {...} } or { goal: null } if none is set
router.get('/', async (req, res) => {
  try {
    res.json({ goal: await SavingsGoal.findOne({ user: req.userId }) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goal  body: { name, target }  -> create or update the user's goal
router.put('/', async (req, res) => {
  try {
    const target = Number(req.body.target);
    if (!Number.isFinite(target) || target < 1) {
      return res.status(400).json({ error: 'Target must be a number of at least 1' });
    }
    const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 60) : '';

    const goal = await SavingsGoal.findOneAndUpdate(
      { user: req.userId },
      { name: name || 'Savings goal', target },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goal
router.delete('/', async (req, res) => {
  try {
    await SavingsGoal.findOneAndDelete({ user: req.userId });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
