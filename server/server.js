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
const courseRoutes = require('./routes/courses');

const app = express();

// List of allowed origins
const allowedOrigins = [
  'https://nida-al-quran.vercel.app',
  'https://nida-al-quran-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, same-site requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'X-Requested-With',
    'Accept',
    'Accept-Language',
  ],
  maxAge: 86400, // 24 hours
};

// IMPORTANT: Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Parse JSON body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Manual CORS headers middleware (backup, should not be needed with cors middleware)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept, Accept-Language');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    res.status(503).json({ msg: 'Database unavailable', error: err.message });
  }
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    message: 'Backend API is running',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState,
    dbConnected: mongoose.connection.readyState === 1,
  };
  console.log('✅ Health check:', health);
  res.json(health);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Nida Al-Quran API',
    version: '1.0.0',
    status: 'running',
  });
});

// API Routes - with /api prefix
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', courseRoutes);

// Support both prefixed and unprefixed paths for serverless deployments
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/contacts', contactRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/courses', courseRoutes);

// 404 handler
app.use((req, res) => {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    msg: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.message);
  res.status(err.status || 500).json({
    msg: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
