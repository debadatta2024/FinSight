// Formats a number as Indian rupees, e.g. 12500 -> "₹12,500".
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatMoney = (value) => inr.format(value);

// Dates are stored as UTC midnight, so format them in UTC to avoid off-by-one days.
export const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
