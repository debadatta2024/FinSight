import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../constants';
import { formatMoney } from '../format';

// byCategory = how much was spent per category this month (from the summary API).
export default function BudgetPanel({ budgets, byCategory, onSave, onDelete }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState('');

  // Quick lookup: spentOf('Food') -> 3200
  const spentOf = (cat) => byCategory.find((c) => c.category === cat)?.total || 0;

  const submit = (e) => {
    e.preventDefault();
    onSave(category, Number(limit));
    setLimit('');
  };

  return (
    <div>
      <h2>Monthly budgets</h2>

      <form onSubmit={submit} className="budget-form">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          required
          placeholder="Limit (₹)"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <button type="submit" className="btn primary">
          Set budget
        </button>
      </form>

      {budgets.length === 0 ? (
        <p className="muted">No budgets yet. Set a limit to track a category.</p>
      ) : (
        <ul className="budget-list">
          {budgets.map((b) => {
            const spent = spentOf(b.category);
            const percent = Math.round((spent / b.limit) * 100);
            const over = spent > b.limit;
            return (
              <li key={b.category}>
                <div className="budget-head">
                  <strong>{b.category}</strong>
                  <span className={over ? 'expense' : 'muted'}>
                    {formatMoney(spent)} of {formatMoney(b.limit)}
                  </span>
                  <button className="link danger" onClick={() => onDelete(b.category)}>
                    Remove
                  </button>
                </div>
                <div className="bar">
                  <div
                    className={`bar-fill ${over ? 'over' : ''}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                {over && <small className="expense">Over budget by {formatMoney(spent - b.limit)}</small>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
