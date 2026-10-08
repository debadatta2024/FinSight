const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { monthRange } = require('../utils/dateRange');
const escapeRegex = require('../utils/escapeRegex');
const { toCsv } = require('../utils/csv');
const { fillMonths } = require('../utils/trend');

const router = express.Router();

// Every query starts from this filter: ONLY the logged-in user's data, optionally
// limited to one month (?month=YYYY-MM). This is what keeps users' data separate.
function baseFilter(req) {
  const filter = { user: new mongoose.Types.ObjectId(req.userId) };
  const range = monthRange(req.query.month);
  if (range) filter.date = { $gte: range.start, $lt: range.end };
  return filter;
}

// Only these fields may be written by the client (never `user`, `_id`, etc.).
function pickFields(body) {
  const { type, amount, category, description, date } = body;
  return { type, amount, category, description, date };
}

// Validation and bad-id errors are the client's fault (400); anything else is 500.
function handleError(res, err) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: err.message });
}

// GET /api/transactions?month=2026-10&search=food&type=expense&category=Food&page=1&limit=10
// -> { items, total, page, pages }
router.get('/', async (req, res) => {
  try {
    const filter = baseFilter(req);
    const { type, category, search } = req.query;

    if (type === 'income' || type === 'expense') filter.type = type;
    if (typeof category === 'string' && category) filter.category = category;
    if (typeof search === 'string' && search.trim()) {
      filter.description = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    // Pagination: default 10 per page, never more than 50.
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const total = await Transaction.countDocuments(filter);
    const pages = Math.max(Math.ceil(total / limit), 1);
    const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), pages);

    const items = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ items, total, page, pages });
  } catch (err) {
    handleError(res, err);
  }
});

// GET /api/transactions/summary?month=2026-10
// -> { income, expense, savings, byCategory: [{ category, total }] }
router.get('/summary', async (req, res) => {
  try {
    const match = baseFilter(req);

    // Total income and total expense in one pass.
    const totals = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    // Expense total per category, biggest first.
    const byCategory = await Transaction.aggregate([
      { $match: { ...match, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    const income = totals.find((t) => t._id === 'income')?.total || 0;
    const expense = totals.find((t) => t._id === 'expense')?.total || 0;

    res.json({
      income,
      expense,
      savings: Math.round((income - expense) * 100) / 100,
      byCategory: byCategory.map((c) => ({ category: c._id, total: c.total })),
    });
  } catch (err) {
    handleError(res, err);
  }
});

// GET /api/transactions/trend?months=6
// -> [{ month: '2026-05', income, expense }, ...] for the last N months, oldest first
router.get('/trend', async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 12);
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

    // Group by calendar month AND type, then sum the amounts.
    const rows = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId), date: { $gte: start } } },
      {
        $group: {
          _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.json(fillMonths(rows, months, now));
  } catch (err) {
    handleError(res, err);
  }
});

// GET /api/transactions/export?month=2026-10 -> downloads a .csv file
router.get('/export', async (req, res) => {
  try {
    const items = await Transaction.find(baseFilter(req)).sort({ date: 1, createdAt: 1 });

    const rows = items.map((t) => ({
      date: t.date.toISOString().slice(0, 10),
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount,
    }));

    const csv = toCsv(rows, [
      { header: 'Date', key: 'date' },
      { header: 'Type', key: 'type' },
      { header: 'Category', key: 'category' },
      { header: 'Description', key: 'description' },
      { header: 'Amount', key: 'amount' },
    ]);

    const label = monthRange(req.query.month) ? req.query.month : 'all';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="finsight-${label}.csv"`);
    res.send(csv);
  } catch (err) {
    handleError(res, err);
  }
});

// POST /api/transactions  -> create (the user comes from the token, not the body)
router.post('/', async (req, res) => {
  try {
    const created = await Transaction.create({ ...pickFields(req.body), user: req.userId });
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err);
  }
});

// PUT /api/transactions/:id  -> update (only if it belongs to this user)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      pickFields(req.body),
      { new: true, runValidators: true } // return the new doc, re-run schema rules
    );
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json(updated);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /api/transactions/:id  (only if it belongs to this user)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.status(204).end();
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
