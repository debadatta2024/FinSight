// Builds realistic SAMPLE transactions for the demo account (pure function: no database).

// Small deterministic random generator, so the same data is produced every time.
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// [type, category, min amount, max amount, how many per month, descriptions]
const TEMPLATES = [
  ['expense', 'Food', 150, 900, 9, ['Groceries', 'Lunch', 'Dinner out', 'Coffee', 'Snacks']],
  ['expense', 'Transport', 60, 450, 5, ['Metro card', 'Auto ride', 'Cab', 'Fuel']],
  ['expense', 'Shopping', 400, 3500, 2, ['Clothes', 'Headphones', 'Books', 'Home items']],
  ['expense', 'Entertainment', 200, 1200, 3, ['Movie', 'Streaming', 'Games', 'Concert']],
  ['expense', 'Bills', 300, 1800, 2, ['Electricity', 'Mobile recharge', 'Internet']],
  ['expense', 'Health', 200, 1500, 1, ['Pharmacy', 'Doctor visit']],
];

function utcDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

// Returns transactions for the current month and the previous two. Never in the future.
function buildTransactions(userId, now = new Date(), monthsBack = 3) {
  const rand = makeRandom(42);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const out = [];

  for (let back = monthsBack - 1; back >= 0; back--) {
    const first = utcDate(now.getUTCFullYear(), now.getUTCMonth() - back, 1);
    const year = first.getUTCFullYear();
    const month = first.getUTCMonth();
    const isCurrent = back === 0;
    const lastDay = isCurrent ? now.getUTCDate() : new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const dayAt = (wanted) => Math.min(wanted, lastDay);

    const add = (type, category, amount, description, day) =>
      out.push({ user: userId, type, category, amount, description, date: utcDate(year, month, day) });

    add('income', 'Salary', 60000, 'Monthly salary', dayAt(1));
    add('expense', 'Rent', 18000, 'House rent', dayAt(3));
    if (back !== 1) add('income', 'Freelance', 4000 + Math.round(rand() * 6000), 'Freelance project', dayAt(12));

    for (const [type, category, min, max, count, descriptions] of TEMPLATES) {
      for (let i = 0; i < count; i++) {
        const amount = Math.round(min + rand() * (max - min));
        const day = 1 + Math.floor(rand() * lastDay);
        add(type, category, amount, pick(descriptions), day);
      }
    }
  }
  return out;
}

const DEMO_BUDGETS = [
  { category: 'Food', limit: 9000 },
  { category: 'Transport', limit: 2500 },
  { category: 'Shopping', limit: 5000 },
  { category: 'Entertainment', limit: 2500 },
];

const DEMO_GOAL = { name: 'Laptop fund', target: 80000 };

module.exports = { buildTransactions, DEMO_BUDGETS, DEMO_GOAL };
