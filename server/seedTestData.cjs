#!/usr/bin/env node

/**
 * Test Data Seeding Script
 * Run from root: node backend/seedTestData.cjs
 * 
 * This script creates sample users, contacts, and attendance records for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Contact = require('./models/Contact');
const Attendance = require('./models/Attendance');

const seedTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nida', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Create Admin if not exists
    const existingAdmin = await Admin.findOne({ email: 'admin@nida.com' });
    let adminId;
    
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      adminId = existingAdmin._id;
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

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
      adminId = admin._id;
      console.log('✓ Admin user created successfully');
      console.log('  Email: admin@nida.com');
      console.log('  Password: admin123');
    }

    // Create sample users
    console.log('\n📝 Creating sample users...');
    const sampleUsers = [
      {
        fullName: 'Ahmed Mohammed',
        email: 'ahmed@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+251911234567',
        age: 25,
        gender: 'male',
        course: 'quran-recitation',
        level: 'beginner',
        schedule: 'morning',
        registrationStatus: 'pending',
      },
      {
        fullName: 'Fatima Hassan',
        email: 'fatima@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+251922345678',
        age: 22,
        gender: 'female',
        course: 'quran-memorization',
        level: 'intermediate',
        schedule: 'afternoon',
        registrationStatus: 'pending',
      },
      {
        fullName: 'Ibrahim Ali',
        email: 'ibrahim@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+251933456789',
        age: 30,
        gender: 'male',
        course: 'islamic-studies',
        level: 'advanced',
        schedule: 'evening',
        registrationStatus: 'approved',
      },
      {
        fullName: 'Aisha Abdullah',
        email: 'aisha@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+251944567890',
        age: 28,
        gender: 'female',
        course: 'arabic-language',
        level: 'beginner',
        schedule: 'weekend',
        registrationStatus: 'approved',
      },
      {
        fullName: 'Omar Yusuf',
        email: 'omar@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+251955678901',
        age: 15,
        gender: 'male',
        course: 'quran-recitation',
        level: 'beginner',
        schedule: 'morning',
        guardian: 'Yusuf Ahmed',
        guardianPhone: '+251966789012',
        registrationStatus: 'pending',
      },
      {
        fullName: 'Khadija Mohamed',
        email: 'khadija@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+251977890123',
        age: 35,
        gender: 'female',
        course: 'quran-memorization',
        level: 'advanced',
        schedule: 'flexible',
        registrationStatus: 'approved',
      },
      {
        fullName: 'Hassan Ibrahim',
        email: 'hassan@example.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+251988901234',
        age: 20,
        gender: 'male',
        course: 'islamic-studies',
        level: 'intermediate',
        schedule: 'evening',
        registrationStatus: 'rejected',
        message: 'I want to learn about Islamic history',
      },
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`  ✓ Created user: ${userData.fullName} (${userData.registrationStatus})`);
      } else {
        console.log(`  - User already exists: ${userData.fullName}`);
      }
    }

    // Create sample contact messages
    console.log('\n📧 Creating sample contact messages...');
    const sampleContacts = [
      {
        fullName: 'Ali Hassan',
        email: 'ali@example.com',
        phone: '+251911111111',
        subject: 'Inquiry about Quran classes',
        message: 'Assalamu alaikum, I would like to know more about your Quran recitation classes. What are the timings and fees?',
        type: 'inquiry',
        status: 'new',
      },
      {
        fullName: 'Maryam Ahmed',
        email: 'maryam@example.com',
        phone: '+251922222222',
        subject: 'Registration issue',
        message: 'I tried to register but did not receive a confirmation email. Please help.',
        type: 'complaint',
        status: 'new',
      },
      {
        fullName: 'Yusuf Omar',
        email: 'yusuf@example.com',
        phone: '+251933333333',
        subject: 'Course suggestion',
        message: 'It would be great if you could offer advanced Arabic grammar courses. Many students are interested.',
        type: 'suggestion',
        status: 'read',
      },
      {
        fullName: 'Zainab Ali',
        email: 'zainab@example.com',
        phone: '+251944444444',
        subject: 'Thank you',
        message: 'I really appreciate the quality of teaching at Nida Al-Quran. My child has improved significantly. Jazakallah khair!',
        type: 'inquiry',
        status: 'replied',
        reply: 'Wa iyyakum! We are glad to hear about your child\'s progress. May Allah bless your family.',
        repliedBy: adminId,
        repliedAt: new Date(),
      },
      {
        fullName: 'Abdullah Hussein',
        email: 'abdullah@example.com',
        phone: '+251955555555',
        subject: 'Question about online classes',
        message: 'Do you offer online classes? I am currently living abroad but would like to continue my studies.',
        type: 'inquiry',
        status: 'new',
      },
    ];

    for (const contactData of sampleContacts) {
      const existingContact = await Contact.findOne({ email: contactData.email, subject: contactData.subject });
      if (!existingContact) {
        const contact = new Contact(contactData);
        await contact.save();
        console.log(`  ✓ Created contact: ${contactData.subject} (${contactData.status})`);
      } else {
        console.log(`  - Contact already exists: ${contactData.subject}`);
      }
    }

    // Create sample attendance records
    console.log('\n📅 Creating sample attendance records...');
    const approvedUsers = await User.find({ registrationStatus: 'approved' });
    
    if (approvedUsers.length > 0) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (const user of approvedUsers) {
        // Create attendance for today
        const todayAttendance = new Attendance({
          student: user._id,
          course: user.course,
          date: today,
          status: 'present',
          recordedBy: adminId,
        });
        
        try {
          await todayAttendance.save();
          console.log(`  ✓ Marked attendance for ${user.fullName} (today)`);
        } catch (err) {
          if (err.code === 11000) {
            console.log(`  - Attendance already exists for ${user.fullName} (today)`);
          }
        }

        // Create attendance for yesterday
        const yesterdayAttendance = new Attendance({
          student: user._id,
          course: user.course,
          date: yesterday,
          status: Math.random() > 0.5 ? 'present' : 'absent',
          recordedBy: adminId,
        });
        
        try {
          await yesterdayAttendance.save();
          console.log(`  ✓ Marked attendance for ${user.fullName} (yesterday)`);
        } catch (err) {
          if (err.code === 11000) {
            console.log(`  - Attendance already exists for ${user.fullName} (yesterday)`);
          }
        }
      }
    } else {
      console.log('  - No approved users found to create attendance records');
    }

    console.log('\n✅ Test data seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   Total Users: ${await User.countDocuments()}`);
    console.log(`   Pending: ${await User.countDocuments({ registrationStatus: 'pending' })}`);
    console.log(`   Approved: ${await User.countDocuments({ registrationStatus: 'approved' })}`);
    console.log(`   Rejected: ${await User.countDocuments({ registrationStatus: 'rejected' })}`);
    console.log(`   Total Contacts: ${await Contact.countDocuments()}`);
    console.log(`   New Messages: ${await Contact.countDocuments({ status: 'new' })}`);
    console.log(`   Total Attendance Records: ${await Attendance.countDocuments()}`);
    
    console.log('\n🚀 You can now login to admin panel:');
    console.log('   URL: http://localhost:5173/admin/login');
    console.log('   Email: admin@nida.com');
    console.log('   Password: admin123');

    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding error:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seedTestData();
