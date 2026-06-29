# Nida Backend (MERN)

Minimal Express + MongoDB backend for the Nida app.

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:

```bash
cd backend
npm install
```

Run

```bash
npm run dev
```

APIs

- `POST /api/users/register` — body: `{ name, email, password }` returns `{ token }`
- `POST /api/users/login` — body: `{ email, password }` returns `{ token }`
