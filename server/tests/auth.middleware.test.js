const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';
const auth = require('../middleware/auth');

// A tiny app with one protected route, to test the middleware through real HTTP.
const app = express();
app.get('/private', auth, (req, res) => res.json({ userId: req.userId }));

describe('auth middleware', () => {
  test('rejects requests without a token', async () => {
    const res = await request(app).get('/private');
    expect(res.status).toBe(401);
  });

  test('rejects a token signed with the wrong secret', async () => {
    const bad = jwt.sign({ id: '1' }, 'another-secret');
    const res = await request(app).get('/private').set('Authorization', `Bearer ${bad}`);
    expect(res.status).toBe(401);
  });

  test('rejects an expired token', async () => {
    const expired = jwt.sign({ id: '1' }, 'test-secret', { expiresIn: -10 });
    const res = await request(app).get('/private').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  test('accepts a valid token and exposes the user id', async () => {
    const good = jwt.sign({ id: 'abc123' }, 'test-secret');
    const res = await request(app).get('/private').set('Authorization', `Bearer ${good}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('abc123');
  });
});
