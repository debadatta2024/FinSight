import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Chart.js only includes the pieces you register (keeps the bundle small).
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = ['#2f5d8a', '#b8433a', '#1f7a5a', '#c58b1b', '#6b4e9b', '#3a8f9b', '#8a5a44', '#7d8590'];

// "2026-10" -> "Oct 26"
const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
};

export default function Charts({ summary, trend, onCategoryClick }) {
  const hasExpenses = summary.byCategory.length > 0;

  // 1. Doughnut: how this month's spending splits across categories.
  const doughnutData = {
    labels: summary.byCategory.map((c) => c.category),
    datasets: [
      {
        data: summary.byCategory.map((c) => c.total),
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    plugins: { legend: { position: 'bottom' } },
    // Interactive: clicking a slice filters the transaction list to that category.
    onClick: (event, elements) => {
      if (elements.length) onCategoryClick(summary.byCategory[elements[0].index].category);
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    },
  };

  // 2. Bar: income vs expenses vs savings for this month.
  const barData = {
    labels: ['Income', 'Expenses', 'Savings'],
    datasets: [
      {
        data: [summary.income, summary.expense, summary.savings],
        backgroundColor: ['#1f7a5a', '#b8433a', '#2f5d8a'],
      },
    ],
  };

  // 3. Grouped bars: income and expenses for each of the last 6 months.
  const trendData = {
    labels: trend.map((t) => monthLabel(t.month)),
    datasets: [
      { label: 'Income', data: trend.map((t) => t.income), backgroundColor: '#1f7a5a' },
      { label: 'Expenses', data: trend.map((t) => t.expense), backgroundColor: '#b8433a' },
    ],
  };

  return (
    <div>
      <h2>Spending analytics</h2>
      <div className="charts">
        <div className="chart-box">
          <h3>Expenses by category (click a slice to filter)</h3>
          {hasExpenses ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <p className="muted">Add an expense this month to see the breakdown.</p>
          )}
        </div>
        <div className="chart-box">
          <h3>This month: income vs expenses</h3>
          <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
        </div>
        <div className="chart-box">
          <h3>Last 6 months</h3>
          <Bar data={trendData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
    </div>
  );
}
