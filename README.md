# FinSight - Personal Finance Tracker

Full-stack app with login. Track income, expenses, savings and monthly budgets.
Stack: React (Vite), Node.js, Express.js, MongoDB (Mongoose), Chart.js, JWT auth.

## Features

- Register / log in (JWT, bcrypt-hashed passwords). Each user sees only their own data.
- Add, edit, delete transactions; monthly summary (income, expenses, savings, savings rate).
- Savings goal with a progress bar (progress = all-time income minus expenses).
- Search, filter by type and category, paginated list.
- Spending analytics with Chart.js: category doughnut (click a slice to filter the list),
  income vs expenses bar, and a 6-month income/expense trend.
- Monthly budgets per category with progress bars and over-budget warnings.
- Export a month's transactions to CSV.
- Sample-data script for a ready-made demo account.
- 31 backend tests (Jest + Supertest).

## Run it

You need Node 18+ and a MongoDB Atlas (free) connection string.

```bash
# Terminal 1 - backend
cd server
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET
npm install
npm run dev                 # http://localhost:5000

# Terminal 2 - frontend
cd client
npm install
npm run dev                 # http://localhost:5173
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run the tests: `cd server && npm test`

Load sample data (optional, great for a demo):

```bash
cd server
npm run seed          # creates demo@finsight.test / demo1234 with 3 months of sample data
```

You can run it again at any time: it only resets the demo account's data.

## API

Public:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/register | Create account, returns token |
| POST | /api/auth/login | Log in, returns token |

Protected (header `Authorization: Bearer <token>`):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/auth/me | Current user |
| GET | /api/transactions | List: `month, search, type, category, page, limit` |
| GET | /api/transactions/summary?month=YYYY-MM | Income, expense, savings, spend per category |
| GET | /api/transactions/trend?months=6 | Income and expense per month, last N months |
| GET | /api/transactions/export?month=YYYY-MM | Download CSV |
| POST | /api/transactions | Create |
| PUT | /api/transactions/:id | Update (own data only) |
| DELETE | /api/transactions/:id | Delete (own data only) |
| GET | /api/goal | Get the savings goal (or null) |
| PUT | /api/goal | Create or update the savings goal |
| DELETE | /api/goal | Remove the savings goal |
| GET | /api/budgets | List budgets |
| PUT | /api/budgets/:category | Create or update a budget |
| DELETE | /api/budgets/:category | Remove a budget |
