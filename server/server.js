// Entry point: sets up Express, connects to MongoDB, mounts the routes.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const goalRoutes = require('./routes/goal');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const SavingsGoal = require('./models/SavingsGoal');

// Without a secret, anyone could forge login tokens, so refuse to start.
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to server/.env (see .env.example).');
  process.exit(1);
}

const app = express();

app.use(cors());          // allow the React dev server to call this API
app.use(express.json());  // parse JSON request bodies into req.body

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);                    // public: register, login
app.use('/api/transactions', auth, transactionRoutes); // protected
app.use('/api/budgets', auth, budgetRoutes);           // protected
app.use('/api/goal', auth, goalRoutes);                // protected

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finsight';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Make the database indexes match the schemas. This also removes the old
    // single-user "category" unique index that version 1 created.
    await Promise.all([
      User.syncIndexes(),
      Transaction.syncIndexes(),
      Budget.syncIndexes(),
      SavingsGoal.syncIndexes(),
    ]);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

start();
