const request = require('supertest');
const express = require('express');

const thisMonth = new Date().toISOString().slice(0, 7);

// Fake the database aggregation so we test only our route logic.
jest.mock('../models/Transaction', () => ({
  aggregate: jest.fn(async () => [
    { _id: { month: new Date().toISOString().slice(0, 7), type: 'expense' }, total: 750 },
    { _id: { month: new Date().toISOString().slice(0, 7), type: 'income' }, total: 3000 },
  ]),
}));

const transactionRoutes = require('../routes/transactions');
const app = express();
app.use(express.json());
app.use((req, res, next) => { req.userId = '64b7f0f2f2f2f2f2f2f2f2f2'; next(); }); // a valid ObjectId
app.use('/api/transactions', transactionRoutes);

describe('GET /api/transactions/trend', () => {
  test('returns the last 6 months by default, ending this month', async () => {
    const res = await request(app).get('/api/transactions/trend');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body[5]).toEqual({ month: thisMonth, income: 3000, expense: 750 });
    expect(res.body[0].income).toBe(0); // empty months are filled with zeros
  });

  test('limits how many months can be requested', async () => {
    const res = await request(app).get('/api/transactions/trend?months=99');
    expect(res.body).toHaveLength(12);
  });
});
