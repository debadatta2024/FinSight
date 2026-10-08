const request = require('supertest');
const express = require('express');

// In-memory fake of the SavingsGoal model, so these tests need no database.
jest.mock('../models/SavingsGoal', () => {
  let stored = null;
  return {
    findOne: jest.fn(async () => stored),
    findOneAndUpdate: jest.fn(async (filter, update) => (stored = { ...filter, ...update })),
    findOneAndDelete: jest.fn(async () => { stored = null; }),
  };
});

const goalRoutes = require('../routes/goal');

// Pretend a user is logged in (the real auth middleware is tested separately).
const app = express();
app.use(express.json());
app.use((req, res, next) => { req.userId = 'user1'; next(); });
app.use('/api/goal', goalRoutes);

describe('savings goal routes', () => {
  test('no goal at first', async () => {
    const res = await request(app).get('/api/goal');
    expect(res.status).toBe(200);
    expect(res.body.goal).toBeNull();
  });

  test('rejects a missing, zero or negative target', async () => {
    for (const target of [undefined, 0, -50, 'abc']) {
      const res = await request(app).put('/api/goal').send({ name: 'x', target });
      expect(res.status).toBe(400);
    }
  });

  test('saves a goal and falls back to a default name', async () => {
    const res = await request(app).put('/api/goal').send({ name: '   ', target: '80000' });
    expect(res.status).toBe(200);
    expect(res.body.goal.target).toBe(80000);
    expect(res.body.goal.name).toBe('Savings goal');
  });

  test('deletes the goal', async () => {
    expect((await request(app).delete('/api/goal')).status).toBe(204);
    expect((await request(app).get('/api/goal')).body.goal).toBeNull();
  });
});
