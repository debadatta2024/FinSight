import { useEffect, useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  type: 'expense',
  amount: '',
  category: EXPENSE_CATEGORIES[0],
  description: '',
  date: today(),
});

// A "controlled" form: React state is the single source of truth for every input.
export default function TransactionForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm());

  // When the user clicks Edit on a row, copy that transaction into the form.
  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type,
        amount: String(editing.amount),
        category: editing.category,
        description: editing.description || '',
        date: editing.date.slice(0, 10),
      });
    } else {
      setForm(emptyForm());
    }
  }, [editing]);

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Switching type changes the category list, so reset the category too.
  const changeType = (e) => {
    const type = e.target.value;
    setForm({
      ...form,
      type,
      category: type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
    });
  };

  const submit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    onSave({ ...form, amount: Number(form.amount) });
    if (!editing) setForm(emptyForm());
  };

  return (
    <form onSubmit={submit} className="form">
      <h2>{editing ? 'Edit transaction' : 'Add transaction'}</h2>

      <div className="row">
        <label>
          Type
          <select value={form.type} onChange={changeType}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>
          Amount (₹)
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={update('amount')}
          />
        </label>
      </div>

      <div className="row">
        <label>
          Category
          <select value={form.category} onChange={update('category')}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" required value={form.date} onChange={update('date')} />
        </label>
      </div>

      <label>
        Description
        <input
          type="text"
          placeholder="Optional, e.g. Groceries"
          value={form.description}
          onChange={update('description')}
        />
      </label>

      <div className="actions">
        <button type="submit" className="btn primary">
          {editing ? 'Save changes' : 'Add transaction'}
        </button>
        {editing && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
