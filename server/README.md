# Nida Backend

Express + MongoDB backend for the Nida project.

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

API groups

- User routes for registration, login, and profile access
- Contact routes for public messages and replies
- Attendance routes for attendance management
- Admin routes for management and protected staff operations

Environment variables

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `PORT` — Optional API port override
- `NODE_ENV` — Runtime environment
