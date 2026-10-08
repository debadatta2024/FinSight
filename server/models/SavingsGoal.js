const mongoose = require('mongoose');

// One savings goal per user (for example "Laptop fund", target 80000).
const savingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, trim: true, default: 'Savings goal', maxlength: 60 },
    target: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
