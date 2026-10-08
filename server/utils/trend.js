// Helpers for the "last N months" chart.

// ["2026-08", "2026-09", "2026-10"] for count = 3 (oldest first, ending this month).
function monthKeys(count, now = new Date()) {
  const keys = [];
  for (let i = count - 1; i >= 0; i--) {
    // Date.UTC handles negative months by rolling back into the previous year.
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(d.toISOString().slice(0, 7));
  }
  return keys;
}

const round2 = (n) => Math.round(n * 100) / 100;

// MongoDB only returns months that HAVE data. This fills the gaps with zeros so
// the chart always shows a continuous run of months.
// rows look like: [{ _id: { month: '2026-10', type: 'expense' }, total: 500 }, ...]
function fillMonths(rows, count, now = new Date()) {
  const byMonth = {};
  for (const row of rows) {
    const { month, type } = row._id;
    byMonth[month] = byMonth[month] || { income: 0, expense: 0 };
    byMonth[month][type] = row.total;
  }
  return monthKeys(count, now).map((month) => ({
    month,
    income: round2(byMonth[month]?.income || 0),
    expense: round2(byMonth[month]?.expense || 0),
  }));
}

module.exports = { monthKeys, fillMonths };
