#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run from backend directory: node seed.cjs
 *
 * Creates initial main_admin and a sample sub_admin
 * Also migrates old role values (admin/teacher/moderator) to new system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nida', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // ── Migrate old roles ──────────────────────────────────────
    const migrated = await Admin.updateMany(
      { role: { $in: ['admin', 'teacher', 'moderator'] } },
      [
        {
          $set: {
            role: {
              $switch: {
                branches: [
                  { case: { $eq: ['$role', 'admin'] }, then: 'main_admin' },
                  { case: { $eq: ['$role', 'teacher'] }, then: 'sub_admin' },
                  { case: { $eq: ['$role', 'moderator'] }, then: 'sub_admin' },
                ],
                default: 'sub_admin',
              },
            },
          },
        },
      ]
    );
    if (migrated.modifiedCount > 0) {
      console.log(`✓ Migrated ${migrated.modifiedCount} existing admin(s) to new roles`);
    }

    // ── Main Admin ─────────────────────────────────────────────
    const existingMainAdmin = await Admin.findOne({ email: 'admin@nida.com' });

    if (existingMainAdmin) {
      // Ensure it's promoted to main_admin
      if (existingMainAdmin.role !== 'main_admin') {
        existingMainAdmin.role = 'main_admin';
        existingMainAdmin.permissions.manageAdmins = true;
        await existingMainAdmin.save();
        console.log('✓ Existing admin promoted to main_admin');
      } else {
        console.log('✓ Main admin already exists');
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('admin123', salt);

      await new Admin({
        username: 'admin',
        email: 'admin@nida.com',
        password: hashed,
        fullName: 'System Administrator',
        role: 'main_admin',
        phone: '+251911000000',
        isActive: true,
        permissions: {
          manageUsers: true,
          manageAttendance: true,
          manageCourses: true,
          viewReports: true,
          manageAdmins: true,
        },
      }).save();

      console.log('✓ Main admin created');
      console.log('  Email:    admin@nida.com');
      console.log('  Password: admin123');
    }

    // ── Sample Sub-Admin ───────────────────────────────────────
    const existingSubAdmin = await Admin.findOne({ email: 'teacher@nida.com' });

    if (existingSubAdmin) {
      if (existingSubAdmin.role !== 'sub_admin') {
        existingSubAdmin.role = 'sub_admin';
        await existingSubAdmin.save();
        console.log('✓ Existing teacher set to sub_admin');
      } else {
        console.log('✓ Sample sub-admin already exists');
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('teacher123', salt);

      const mainAdmin = await Admin.findOne({ role: 'main_admin' });

      await new Admin({
        username: 'teacher1',
        email: 'teacher@nida.com',
        password: hashed,
        fullName: 'Senior Teacher',
        role: 'sub_admin',
        phone: '+251922000000',
        isActive: true,
        createdBy: mainAdmin?._id || null,
        permissions: {
          manageUsers: false,
          manageAttendance: true,
          manageCourses: false,
          viewReports: true,
          manageAdmins: false,
        },
      }).save();

      console.log('✓ Sample sub-admin created');
      console.log('  Email:    teacher@nida.com');
      console.log('  Password: teacher123');
    }

    console.log('\n✓ Database seeding completed!');
    console.log('\nLogin credentials:');
    console.log('  Main Admin → admin@nida.com / admin123');
    console.log('  Sub Admin  → teacher@nida.com / teacher123');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
