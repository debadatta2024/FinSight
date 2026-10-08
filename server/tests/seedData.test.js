const { buildTransactions, DEMO_BUDGETS } = require('../scripts/seedData');

const EXPENSE = ['Food', 'Rent', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Other'];
const INCOME = ['Salary', 'Freelance', 'Gift', 'Other'];

describe('sample data', () => {
  const now = new Date(Date.UTC(2026, 9, 6)); // 6 Oct 2026
  const rows = buildTransactions('user1', now);

  test('has both income and expenses, spread across 3 months', () => {
    expect(rows.some((r) => r.type === 'income')).toBe(true);
    expect(rows.some((r) => r.type === 'expense')).toBe(true);
    const months = new Set(rows.map((r) => r.date.toISOString().slice(0, 7)));
    expect([...months].sort()).toEqual(['2026-08', '2026-09', '2026-10']);
  });

  test('never contains a future date', () => {
    expect(rows.every((r) => r.date <= now)).toBe(true);
  });

  test('uses only categories the app knows, with positive amounts', () => {
    for (const r of rows) {
      expect(r.type === 'expense' ? EXPENSE : INCOME).toContain(r.category);
      expect(r.amount).toBeGreaterThan(0);
    }
    for (const b of DEMO_BUDGETS) expect(EXPENSE).toContain(b.category);
  });

  test('is repeatable (same data every run)', () => {
    expect(buildTransactions('user1', now)).toEqual(rows);
  });
});
