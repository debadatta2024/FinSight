import { useState } from 'react';
import { formatMoney } from '../format';

// A savings goal with a progress bar.
// "saved" = all-time income minus all-time expenses (so it carries over month to month).
export default function SavingsPanel({ goal, saved, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onSave(name.trim() || (goal ? goal.name : 'Savings goal'), Number(target));
    setName('');
    setTarget('');
  };

  const progress = goal ? Math.min(100, Math.max(0, Math.round((saved / goal.target) * 100))) : 0;
  const reached = goal && saved >= goal.target;

  return (
    <div>
      <h2>Savings goal</h2>

      {goal ? (
        <div className="goal">
          <div className="budget-head">
            <strong>{goal.name}</strong>
            <span className="muted">
              {formatMoney(Math.max(saved, 0))} of {formatMoney(goal.target)}
            </span>
            <button className="link danger" onClick={onDelete}>
              Remove
            </button>
          </div>
          <div className="bar">
            <div className={`bar-fill ${reached ? 'done' : ''}`} style={{ width: `${progress}%` }} />
          </div>
          <small className={reached ? 'income' : 'muted'}>
            {reached
              ? 'Goal reached!'
              : `${progress}% there. ${formatMoney(goal.target - Math.max(saved, 0))} to go.`}
          </small>
        </div>
      ) : (
        <p className="muted">No goal yet. Set a target to track your progress.</p>
      )}

      <form onSubmit={submit} className="budget-form" style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder={goal ? 'Rename goal (optional)' : 'Goal name, e.g. Laptop'}
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          min="1"
          required
          placeholder="Target (₹)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button type="submit" className="btn primary">
          {goal ? 'Update' : 'Set goal'}
        </button>
      </form>
    </div>
  );
}
