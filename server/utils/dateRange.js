// Turns "2026-10" into { start: 1 Oct 2026, end: 1 Nov 2026 } (UTC).
// Returns null if the text is not a valid YYYY-MM month.
function monthRange(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) return null;
  const [year, mon] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, mon - 1, 1)),
    end: new Date(Date.UTC(year, mon, 1)),
  };
}

module.exports = { monthRange };
