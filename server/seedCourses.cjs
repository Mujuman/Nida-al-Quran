#!/usr/bin/env node

/**
 * Courses Seeding Script
 * Run from backend directory: node seedCourses.cjs
 *
 * Creates the 4 main courses:
 * 1. ቃኢዳ በተጅዊድ (Qaidah with Tajweed)
 * 2. ቁርአን ነዘር (Quran Reading)
 * 3. ሂፍዝ ከሙራጀአ ጋር (Memorization with Review)
 * 4. መሰረታዊ የዲን ትምህርቶች (Basic Islamic Studies)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const seedCourses = async () => {
  try {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
      });
      console.log('✓ Connected to Remote MongoDB Atlas');
    } catch (err) {
      console.log('Remote MongoDB failed, connecting to local MongoDB...');
      await mongoose.connect('mongodb://127.0.0.1:27017/nida', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✓ Connected to Local MongoDB');
    }

    // Clear existing courses
    await Course.deleteMany({});
    console.log('✓ Cleared existing courses');

    const courses = [
      {
        slug: 'qaidah-tajweed',
        title: {
          en: 'Qaidah with Tajweed',
          am: 'ቃኢዳ በተጅዊድ',
        },
        description: {
          en: 'Learn the basics of Quranic reading with proper pronunciation and rules',
          am: 'የቁርአን ንባብ መሰረታዊ ነገሮችን በትክክለኛ አነጋገር እና ህጎች ይማሩ',
        },
        features: {
          en: [
            'Introduction to Arabic letters',
            'Basic pronunciation rules',
            'Tajweed fundamentals',
            'Practice with short surahs',
          ],
          am: [
            'የአረብ ፊደሎች መግቢያ',
            'መሰረታዊ አነጋገር ህጎች',
            'የታጅዊድ መሰረት',
            'በአጭር ሱራዎች ልምምድ',
          ],
        },
        sortOrder: 1,
        image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
        isActive: true,
      },
      {
        slug: 'quran-nazr',
        title: {
          en: 'Quran Reading (Nazr)',
          am: 'ቁርአን ነዘር',
        },
        description: {
          en: 'Develop fluency in reading the entire Quran with proper tajweed rules',
          am: 'ሙሉ ቁርአንን በትክክለኛ ታጅዊድ ህጎች ንባብ ቅልጥፍና ዓቅደ',
        },
        features: {
          en: [
            'Complete Quran reading',
            'Advanced tajweed rules',
            'Pronunciation perfection',
            'Regular assessments',
          ],
          am: [
            'ሙሉ ቁርአን ንባብ',
            'የተራቀቀ ታጅዊድ ህጎች',
            'አነጋገር ፍጹምነት',
            'መደበኛ ግምገማ',
          ],
        },
        sortOrder: 2,
        image: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80',
        isActive: true,
      },
      {
        slug: 'hifz-murajaah',
        title: {
          en: 'Memorization with Review',
          am: 'ሂፍዝ ከሙራጀአ ጋር',
        },
        description: {
          en: 'Complete memorization of the Quran with continuous review to maintain progress',
          am: 'ቁርአንን ሙሉ በሙሉ ማስታወስ ከምናሲበት ገፅ ሰብሳቢ ጋር',
        },
        features: {
          en: [
            'Systematic memorization',
            'Daily revision schedule',
            'Progress tracking',
            'Certification upon completion',
          ],
          am: [
            'ሥርዓተ ቅደም ታዛዥ ማስታወስ',
            'ዕለታዊ ድገም ሰዓት ሠሪ',
            'ዓቅደ ዳሰሳ',
            'ሥራ ሞቅሮ ማስረጃ',
          ],
        },
        sortOrder: 3,
        image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
        isActive: true,
      },
      {
        slug: 'islamic-studies',
        title: {
          en: 'Basic Islamic Studies',
          am: 'መሰረታዊ የዲን ትምህርቶች',
        },
        description: {
          en: 'Comprehensive Islamic education covering Aqeedah, Fiqh, and Islamic history',
          am: 'ሙሉ ለሙሉ የ ዲን ትምህርት ዓንደበቲ፤ ፍቅር፤ እና ታሪክ ሊሞልክ',
        },
        features: {
          en: [
            'Islamic beliefs and principles',
            'Islamic jurisprudence basics',
            'Prophet biography',
            'Islamic history overview',
          ],
          am: [
            'የኢስላም እምነት እና መርሆ',
            'የኢስላም ሕግ መሰረት',
            'ተወዳደርወ ታሪክ',
            'የኢስላም ታሪክ ሁኔታ',
          ],
        },
        sortOrder: 4,
        image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
        isActive: true,
      },
    ];

    await Course.insertMany(courses);
    console.log('✓ 4 courses seeded successfully');

    console.log('\n✓ Courses seeding completed!');
    console.log('\nSeeded courses:');
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.title.am} (${course.title.en})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding error:', err.message);
    process.exit(1);
  }
};

seedCourses();
