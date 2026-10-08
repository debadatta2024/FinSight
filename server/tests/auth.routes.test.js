const request = require('supertest');
const express = require('express');

process.env.JWT_SECRET = 'test-secret';

// Replace the real User model with a small in-memory fake, so these tests
// check our route logic (validation, hashing, tokens) without needing MongoDB.
jest.mock('../models/User', () => {
  const users = [];
  return {
    findOne: jest.fn(async ({ email }) => users.find((u) => u.email === email) || null),
    create: jest.fn(async (data) => {
      const user = { _id: String(users.length + 1), ...data };
      users.push(user);
      return user;
    }),
    findById: jest.fn(async (id) => users.find((u) => u._id === id) || null),
  };
});

const authRoutes = require('../routes/auth');
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const newUser = { name: 'Asha', email: 'Asha@Example.com', password: 'secret123' };

describe('auth routes', () => {
  test('register succeeds and returns a token without the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('asha@example.com'); // lower-cased
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  test('register rejects a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(409);
  });

  test('register rejects a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'B', email: 'b@example.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('register rejects non-string input (query injection attempt)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'C', email: { $gt: '' }, password: 'secret123' });
    expect(res.status).toBe(400);
  });

  test('login fails with a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'asha@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('login succeeds, and the token works on /me', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ASHA@example.com', password: 'secret123' });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.name).toBe('Asha');
  });

  test('/me without a token is rejected', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
