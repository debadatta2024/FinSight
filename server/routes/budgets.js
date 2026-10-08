const express = require('express');
const Budget = require('../models/Budget');

const router = express.Router();

function handleError(res, err) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: err.message });
}

// GET /api/budgets -> this user's budgets
router.get('/', async (req, res) => {
  try {
    res.json(await Budget.find({ user: req.userId }).sort({ category: 1 }));
  } catch (err) {
    handleError(res, err);
  }
});

// PUT /api/budgets/:category  body: { limit }
// "Upsert": updates the budget if it exists, creates it if it does not.
// Fields in the filter (user, category) are copied onto a newly created document.
router.put('/:category', async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, category: req.params.category },
      { limit: req.body.limit },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(budget);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /api/budgets/:category
router.delete('/:category', async (req, res) => {
  try {
    const deleted = await Budget.findOneAndDelete({
      user: req.userId,
      category: req.params.category,
    });
    if (!deleted) return res.status(404).json({ error: 'Budget not found' });
    res.status(204).end();
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
