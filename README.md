# Nida Al-Quran

This project now follows a clean multi-app structure:

- Public site: `client/`
- Admin app: `admin/`
- Backend API: `server/`

## Quick start

### 1) Install public app dependencies
```bash
cd client
npm install
```

### 2) Install admin app dependencies
```bash
cd ../admin
npm install
```

### 3) Install backend dependencies
```bash
cd ../server
npm install
```

### 4) Start backend
```bash
cd server
npm run dev
```

### 5) Start public frontend
```bash
cd ../client
npm run dev
```

### 6) Start admin frontend
```bash
cd ../admin
npm run dev
```

The public site runs on the Vite default port, the admin app uses its own Vite port, and the backend listens on `http://localhost:5000`.

## Project overview

- `client/` contains the public-facing React website and all user pages.
- `admin/` contains the separate React admin dashboard and admin login flow.
- `server/` contains the Express API, database models, routes, middleware, and config.
- `vercel.json` is the deployment config for the public site and API routing.

## Environment files

### Public frontend (.env in client/)
Copy `client/.env.example` to `client/.env` and set the API base URL if needed.

The public frontend .env may include:
- `VITE_API_URL` — Backend API endpoint

### Admin frontend (.env in admin/)
Copy `admin/.env.example` to `admin/.env` if you add admin-only runtime settings.

### Backend (.env in server/)
Copy `server/.env.example` to `server/.env` and configure your database and JWT settings.

The backend .env contains:
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT tokens
- `PORT` — Server port (default: `5000`)
- `NODE_ENV` — Environment mode
- Any admin bootstrap or service credentials required by the backend
