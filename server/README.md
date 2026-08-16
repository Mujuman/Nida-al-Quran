# Nida Backend (MERN)

Minimal Express + MongoDB backend for the Nida app.

Setup

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:

```bash
cd server
npm install
```

Run

```bash
npm run dev
```

APIs

- `POST /api/users/register` — body: `{ name, email, password }` returns `{ token }`
- `POST /api/users/login` — body: `{ email, password }` returns `{ token }`
