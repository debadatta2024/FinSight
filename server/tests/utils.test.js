const { monthRange } = require('../utils/dateRange');
const escapeRegex = require('../utils/escapeRegex');
const { toCsv, cell } = require('../utils/csv');

describe('monthRange', () => {
  test('returns UTC start and end of the month', () => {
    const r = monthRange('2026-10');
    expect(r.start.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });

  test('December rolls over to January of the next year', () => {
    expect(monthRange('2026-12').end.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  test('rejects invalid input', () => {
    expect(monthRange('2026-13')).toBeNull();
    expect(monthRange('hello')).toBeNull();
    expect(monthRange(undefined)).toBeNull();
  });
});

describe('escapeRegex', () => {
  test('escapes special characters so they match literally', () => {
    const re = new RegExp(escapeRegex('a.b(c)'));
    expect(re.test('a.b(c)')).toBe(true);
    expect(re.test('axb(c)')).toBe(false);
  });
});

describe('csv', () => {
  test('quotes values and doubles inner quotes', () => {
    expect(cell('say "hi"')).toBe('"say ""hi"""');
  });

  test('neutralises spreadsheet formulas', () => {
    expect(cell('=SUM(A1:A9)')).toBe('"\'=SUM(A1:A9)"');
  });

  test('builds a header and one line per row', () => {
    const csv = toCsv([{ a: 1, b: 'x' }], [
      { header: 'A', key: 'a' },
      { header: 'B', key: 'b' },
    ]);
    expect(csv).toBe('"A","B"\n"1","x"');
  });
});
