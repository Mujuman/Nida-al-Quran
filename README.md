# Nida Al-Quran

This project is organized into a clear frontend/backend split:

- Frontend: `client/`
- Backend: `server/`

## Quick start

### 1) Install frontend dependencies
```bash
cd client
npm install
```

### 2) Install backend dependencies
```bash
cd ../server
npm install
```

### 3) Start backend
```bash
cd server
npm run dev
```

### 4) Start frontend
```bash
cd client
npm run dev
```

The frontend uses Vite and calls the backend on `http://localhost:5000`.

## Project overview

- `client/` contains the React application and all UI code.
- `server/` contains the Express API, database models, routes, middleware, and config.
- `vercel.json` handles deployment routing for both the frontend and API.

## Environment files

- Root `.env.example` is the frontend environment template.
- `server/.env.example` is the backend environment template.
