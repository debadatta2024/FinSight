const { monthKeys, fillMonths } = require('../utils/trend');

describe('monthKeys', () => {
  test('lists months oldest first, ending with the current month', () => {
    const now = new Date(Date.UTC(2026, 9, 15)); // 15 Oct 2026
    expect(monthKeys(3, now)).toEqual(['2026-08', '2026-09', '2026-10']);
  });

  test('rolls back across a year boundary', () => {
    const now = new Date(Date.UTC(2026, 1, 10)); // Feb 2026
    expect(monthKeys(4, now)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });
});

describe('fillMonths', () => {
  const now = new Date(Date.UTC(2026, 9, 15));

  test('fills months with no data with zeros', () => {
    const rows = [
      { _id: { month: '2026-10', type: 'expense' }, total: 500 },
      { _id: { month: '2026-10', type: 'income' }, total: 2000 },
      { _id: { month: '2026-08', type: 'expense' }, total: 120.456 },
    ];
    expect(fillMonths(rows, 3, now)).toEqual([
      { month: '2026-08', income: 0, expense: 120.46 },
      { month: '2026-09', income: 0, expense: 0 },
      { month: '2026-10', income: 2000, expense: 500 },
    ]);
  });
});
