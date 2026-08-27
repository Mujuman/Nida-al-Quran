const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contacts');
const attendanceRoutes = require('./routes/attendance');

const app = express();

// CORS configuration - Updated to fix CORS preflight issues
const corsOptions = {
  origin: [
    'https://nida-al-quran.vercel.app',
    'https://nida-al-quran-admin.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

connectDB().catch((err) => {
  console.error('Database connection failed during startup:', err.message);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running',
    dbState: mongoose.connection.readyState,
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/attendance', attendanceRoutes);

// Support both prefixed and unprefixed paths for serverless deployments
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/contacts', contactRoutes);
app.use('/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
