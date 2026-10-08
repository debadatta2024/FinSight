// Wraps one value for CSV: always quoted, inner quotes doubled.
// Values starting with = + - @ get a leading ' so Excel will not run them as
// formulas ("CSV injection").
function cell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

// columns: [{ header: 'Date', key: 'date' }, ...]
function toCsv(rows, columns) {
  const head = columns.map((c) => cell(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => cell(row[c.key])).join(','));
  return [head, ...lines].join('\n');
}

module.exports = { toCsv, cell };
