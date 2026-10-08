// Fills the database with SAMPLE data for a demo account.   Run:  npm run seed
// Safe to run again: it replaces only the demo account's data.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const { buildTransactions, DEMO_BUDGETS, DEMO_GOAL } = require('./seedData');

const DEMO_EMAIL = 'demo@finsight.test';
const DEMO_PASSWORD = 'demo1234';

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finsight';
  await mongoose.connect(uri);

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (user) {
    await Promise.all([
      Transaction.deleteMany({ user: user._id }),
      Budget.deleteMany({ user: user._id }),
      SavingsGoal.deleteMany({ user: user._id }),
    ]);
  } else {
    user = await User.create({
      name: 'Demo User',
      email: DEMO_EMAIL,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    });
  }

  const transactions = buildTransactions(user._id);
  await Transaction.insertMany(transactions);
  await Budget.insertMany(DEMO_BUDGETS.map((b) => ({ ...b, user: user._id })));
  await SavingsGoal.create({ ...DEMO_GOAL, user: user._id });

  console.log(`Added ${transactions.length} sample transactions, ${DEMO_BUDGETS.length} budgets and a savings goal.`);
  console.log(`Log in with  ${DEMO_EMAIL}  /  ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
