import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FilterBar from './components/FilterBar';
import Charts from './components/Charts';
import BudgetPanel from './components/BudgetPanel';
import SavingsPanel from './components/SavingsPanel';

const PAGE_SIZE = 8;

// "2026-10" for the current month (used by <input type="month">).
const currentMonth = () => new Date().toISOString().slice(0, 7);

export default function Dashboard({ user, onLogout }) {
  // ---- State: everything the screen shows comes from these ----
  const [month, setMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(''); // what is typed right now
  const [filters, setFilters] = useState({ search: '', type: '', category: '' }); // what is applied
  const [summary, setSummary] = useState({ income: 0, expense: 0, savings: 0, byCategory: [] });
  const [budgets, setBudgets] = useState([]);
  const [trend, setTrend] = useState([]);           // last 6 months, for the trend chart
  const [goal, setGoal] = useState(null);           // the user's savings goal, or null
  const [allTimeSavings, setAllTimeSavings] = useState(0); // income - expenses, all months
  const [editing, setEditing] = useState(null); // the transaction being edited, or null
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Debounce: wait 300 ms after the last keystroke before searching, so we
  // don't call the server on every single letter.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.search === searchInput.trim() ? f : { ...f, search: searchInput.trim() }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch everything for the selected month/filters/page in parallel.
  const loadData = useCallback(async () => {
    try {
      setError('');
      const params = { month, page, limit: PAGE_SIZE };
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;

      const [list, s, b, tr, g, all] = await Promise.all([
        api.getTransactions(params),
        api.getSummary(month),
        api.getBudgets(),
        api.getTrend(6),
        api.getGoal(),
        api.getAllTimeSummary(),
      ]);
      setTransactions(list.items);
      setMeta({ total: list.total, pages: list.pages });
      if (list.page !== page) setPage(list.page); // server clamps pages that no longer exist
      setSummary(s);
      setBudgets(b);
      setTrend(tr);
      setGoal(g.goal);
      setAllTimeSavings(all.savings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, page, filters]);

  // Run loadData on first render and again whenever month, page or filters change.
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Wraps an action: run it, then refresh the data. Shows any error in the banner.
  const run = async (action) => {
    try {
      setError('');
      await action();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = (data) =>
    run(async () => {
      if (editing) {
        await api.updateTransaction(editing._id, data);
        setEditing(null);
      } else {
        await api.addTransaction(data);
      }
    });

  const handleDelete = (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    run(() => api.deleteTransaction(id));
  };

  const handleSaveBudget = (category, limit) => run(() => api.saveBudget(category, limit));
  const handleDeleteBudget = (category) => run(() => api.deleteBudget(category));

  const handleSaveGoal = (name, target) => run(() => api.saveGoal(name, target));
  const handleDeleteGoal = () => run(() => api.deleteGoal());

  // Clicking a doughnut slice: show only that expense category in the list below.
  const handleCategoryClick = (category) => {
    setSearchInput('');
    setFilters({ search: '', type: 'expense', category });
    setPage(1);
    document.getElementById('transactions')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExport = () => run(() => api.downloadCsv(month));

  const changeMonth = (value) => {
    if (!value) return;
    setMonth(value);
    setPage(1);
  };
  const changeFilter = (field) => (value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  const hasFilters = Boolean(filters.search || filters.type || filters.category);

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>FinSight</h1>
          <p className="muted">Track income, spending and budgets in one place.</p>
        </div>
        <div className="topbar-right">
          <label className="month-picker">
            Month
            <input type="month" value={month} onChange={(e) => changeMonth(e.target.value)} />
          </label>
          <div className="user-box">
            <span>{user.name}</span>
            <button className="link" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="banner" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="muted">Loading your data...</p>
      ) : (
        <main className="layout">
          <div className="area-summary">
            <SummaryCards summary={summary} />
          </div>

          <section className="panel area-charts">
            <Charts summary={summary} trend={trend} onCategoryClick={handleCategoryClick} />
          </section>

          <section className="panel area-form">
            <TransactionForm
              editing={editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </section>

          <div className="area-side">
            <section className="panel">
              <BudgetPanel
                budgets={budgets}
                byCategory={summary.byCategory}
                onSave={handleSaveBudget}
                onDelete={handleDeleteBudget}
              />
            </section>
            <section className="panel">
              <SavingsPanel
                goal={goal}
                saved={allTimeSavings}
                onSave={handleSaveGoal}
                onDelete={handleDeleteGoal}
              />
            </section>
          </div>

          <section className="panel area-list" id="transactions">
            <h2>Transactions</h2>
            <FilterBar
              search={searchInput}
              onSearch={setSearchInput}
              type={filters.type}
              onType={changeFilter('type')}
              category={filters.category}
              onCategory={changeFilter('category')}
              onExport={handleExport}
            />
            <TransactionList
              items={transactions}
              total={meta.total}
              page={page}
              pages={meta.pages}
              onPage={setPage}
              filtered={hasFilters}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          </section>
        </main>
      )}
    </div>
  );
}
