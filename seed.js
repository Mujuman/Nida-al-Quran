#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run: node seed.js
 * 
 * This script creates initial admin user and other seed data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./backend/models/Admin');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nida', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@nida.com' });
    
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      // Create admin user
      const admin = new Admin({
        username: 'admin',
        email: 'admin@nida.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'admin',
        phone: '+251911000000',
        isActive: true,
        permissions: {
          manageUsers: true,
          manageAttendance: true,
          manageCourses: true,
          viewReports: true,
          manageAdmins: true,
        }
      });

      await admin.save();
      console.log('✓ Admin user created successfully');
      console.log('  Email: admin@nida.com');
      console.log('  Password: admin123');
    }

    // Create teacher user
    const existingTeacher = await Admin.findOne({ email: 'teacher@nida.com' });
    
    if (existingTeacher) {
      console.log('✓ Teacher user already exists');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('teacher123', salt);

      const teacher = new Admin({
        username: 'teacher1',
        email: 'teacher@nida.com',
        password: hashedPassword,
        fullName: 'Senior Teacher',
        role: 'teacher',
        phone: '+251922000000',
        isActive: true,
        permissions: {
          manageUsers: false,
          manageAttendance: true,
          manageCourses: false,
          viewReports: true,
          manageAdmins: false,
        }
      });

      await teacher.save();
      console.log('✓ Teacher user created successfully');
      console.log('  Email: teacher@nida.com');
      console.log('  Password: teacher123');
    }

    console.log('\n✓ Database seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
