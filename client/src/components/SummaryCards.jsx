import { formatMoney } from '../format';

// Three numbers at the top: income, expenses, savings (income - expenses).
export default function SummaryCards({ summary }) {
  // Savings rate = the share of income you kept. Only meaningful when there is income.
  const rate = summary.income > 0 ? Math.round((summary.savings / summary.income) * 100) : null;

  return (
    <div className="summary">
      <div className="stat">
        <span className="stat-label">Income</span>
        <span className="stat-value income">{formatMoney(summary.income)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Expenses</span>
        <span className="stat-value expense">{formatMoney(summary.expense)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Savings this month</span>
        <span className={`stat-value ${summary.savings < 0 ? 'expense' : 'income'}`}>
          {formatMoney(summary.savings)}
        </span>
        {rate !== null && <span className="stat-note">Savings rate: {rate}% of income</span>}
      </div>
    </div>
  );
}
