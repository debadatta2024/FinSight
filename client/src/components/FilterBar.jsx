import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

// Every category name once (some, like "Other", appear in both lists).
const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

export default function FilterBar({ search, onSearch, type, onType, category, onCategory, onExport }) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        placeholder="Search description"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search description"
      />
      <select value={type} onChange={(e) => onType(e.target.value)} aria-label="Filter by type">
        <option value="">All types</option>
        <option value="expense">Expenses</option>
        <option value="income">Income</option>
      </select>
      <select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {ALL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button type="button" className="btn" onClick={onExport}>
        Export CSV
      </button>
    </div>
  );
}
