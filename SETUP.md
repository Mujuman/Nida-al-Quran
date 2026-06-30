# Nida Al-Quran - Frontend & Backend Connection Setup

## Project Structure

This project is a full-stack MERN (MongoDB, Express, React, Node.js) application for registering students in Quran learning courses.

```
Nida/
├── backend/              # Node.js Express server
│   ├── config/
│   │   └── db.js        # MongoDB connection
│   ├── controllers/
│   │   └── userController.js  # User registration & login logic
│   ├── middleware/
│   │   └── auth.js      # JWT authentication
│   ├── models/
│   │   └── User.js      # MongoDB User schema
│   ├── routes/
│   │   └── users.js     # API routes
│   ├── .env             # Backend environment variables
│   ├── package.json
│   └── server.js
├── src/                  # React frontend
│   ├── services/
│   │   └── apiService.js    # Frontend API client
│   ├── components/
│   │   └── Register.jsx     # Registration component (connected to API)
│   ├── styles/
│   └── main.jsx
├── .env                  # Frontend environment variables
├── vite.config.js        # Vite config with API proxy
└── package.json
```

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - MongoDB Community Server (local installation)
  - MongoDB Atlas (cloud database) - [Sign up](https://www.mongodb.com/cloud/atlas)

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ..
npm install
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Server**
   - Windows: [Download MSI](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [official guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB Service**
   - Windows: MongoDB should auto-start, or run `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # You should see a MongoDB shell prompt
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
4. Update the `MONGO_URI` in `backend/.env` with your connection string

### 4. Configure Environment Variables

#### Backend (`backend/.env`)
```
MONGO_URI=mongodb://127.0.0.1:27017/nida
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

#### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected to mongodb://127.0.0.1:27017/nida
Users collection created
```

### Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

Expected output:
```
VITE v8.0.12  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Open in Browser

Navigate to `http://localhost:5173/` and the frontend will automatically proxy API requests to the backend on port 5000.

## How the Frontend & Backend Connect

### 1. **API Service** (`src/services/apiService.js`)
   - Centralized API client for all backend communication
   - Handles authentication token management
   - Methods: `registerUser()`, `loginUser()`, `getUsers()`, etc.

### 2. **Vite Proxy** (`vite.config.js`)
   - Automatically routes `/api/*` requests from the frontend to the backend
   - In development, you can use relative URLs like `/api/users/register`
   - In production, update the proxy target or use absolute URLs

### 3. **CORS Configuration** (`backend/server.js`)
   - Enabled to allow frontend requests from different origins
   - In production, configure to only allow your domain

### 4. **JWT Authentication** (`backend/middleware/auth.js`)
   - Token-based authentication for protected routes
   - Token is stored in localStorage on successful login
   - Included in API requests via `Authorization: Bearer <token>` header

## API Endpoints

### User Registration
- **POST** `/api/users/register`
- **Body:**
  ```json
  {
    "fullName": "محمد علي",
    "email": "user@example.com",
    "password": "password123",
    "phone": "+251911234567",
    "age": 25,
    "gender": "male",
    "course": "quran-recitation",
    "level": "beginner",
    "schedule": "morning",
    "guardian": "محمد",
    "guardianPhone": "+251922345678",
    "message": "interested in learning Quran"
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "fullName": "محمد علي",
      "registrationStatus": "pending"
    }
  }
  ```

### User Login
- **POST** `/api/users/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Get All Users (Requires Authentication)
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer <token>`

### Get User by ID
- **GET** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`

### Update User
- **PUT** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  fullName: String,          // Student's full name
  email: String,             // Unique email
  password: String,          // Hashed password
  phone: String,             // Contact phone
  age: Number,               // Student's age
  gender: String,            // 'male', 'female', 'other'
  course: String,            // Selected course
  level: String,             // 'beginner', 'intermediate', 'advanced'
  schedule: String,          // Class schedule preference
  guardian: String,          // Guardian's name (for under 18)
  guardianPhone: String,     // Guardian's contact
  message: String,           // Additional notes
  isVerified: Boolean,       // Email verification status
  registrationStatus: String,// 'pending', 'approved', 'rejected'
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB service is running
- Windows: `net start MongoDB`
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Ensure CORS is enabled in `backend/server.js`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** 
- Change PORT in `.env` file, or
- Kill the process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

### Token Expired/Invalid
**Solution:** Log in again to get a new token. Tokens are valid for 7 days.

## Development Workflow

1. **Make backend changes** → Server auto-reloads (nodemon)
2. **Make frontend changes** → Browser auto-refreshes (Vite)
3. **Test registration** → Fill form and submit to test the connection
4. **Check browser console** → View API responses and errors
5. **Check MongoDB** → Use MongoDB Compass to verify data is saved

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use environment variables for sensitive data
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend
1. Build: `npm run build`
2. Output in `/dist` folder
3. Deploy to platforms like Vercel, Netlify, or GitHub Pages
4. Update `VITE_API_URL` to point to your production backend

## Next Steps

- Add email verification
- Add payment integration
- Create admin dashboard
- Add more courses/models
- Implement file uploads (for certificates, documents)
- Add role-based access control (Admin, Teacher, Student)

## Support

For issues or questions, check the MongoDB and Express documentation:
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Vite Guide](https://vitejs.dev/)
