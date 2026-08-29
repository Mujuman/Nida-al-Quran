const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createDefaultMainAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('Database not connected; skipping default admin creation.');
    return;
  }

  const email = process.env.MAIN_ADMIN_EMAIL;
  const username = process.env.MAIN_ADMIN_USERNAME ;
  const password = process.env.MAIN_ADMIN_PASSWORD ;
  const fullName = process.env.MAIN_ADMIN_FULLNAME;
  const phone = process.env.MAIN_ADMIN_PHONE;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.role !== 'main_admin') {
        existingAdmin.role = 'main_admin';
        existingAdmin.permissions = {
          ...existingAdmin.permissions,
          manageAdmins: true,
        };
        await existingAdmin.save();
        console.log('Existing admin promoted to main_admin');
      } else {
        console.log('Main admin already exists');
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Admin.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'main_admin',
      phone,
      isActive: true,
      permissions: {
        manageUsers: true,
        manageAttendance: true,
        manageCourses: true,
        viewReports: true,
        manageAdmins: true,
      },
    });

    console.log(`Created default main admin (${email})`);
  } catch (err) {
    console.error('Failed to ensure default admin:', err.message);
  }
};

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = connectToMongo();
  try {
    await connectionPromise;
    connectionPromise = undefined;
  } catch (err) {
    connectionPromise = undefined;
    throw err;
  }
};

const connectToMongo = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL;

  if (!mongoUri) {
    throw new Error('MongoDB connection string is not configured');
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  });

  console.log('MongoDB connected');

  const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
  if (collections.length === 0) {
    await mongoose.connection.createCollection('users');
    console.log('Users collection created');
  }

  await createDefaultMainAdmin();
};

module.exports = connectDB;
