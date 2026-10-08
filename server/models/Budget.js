const mongoose = require('mongoose');

// A monthly spending limit for one expense category, per user.
const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

// A user can have only one budget per category (but different users can share names).
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
