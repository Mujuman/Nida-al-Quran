const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Course = require('../models/Course');

const ensureDefaultCourses = async () => {
  if (await Course.exists()) return;

  await Course.insertMany([
    {
      slug: 'qaida',
      title: { en: 'Qaida with Tajweed', am: 'ቃኢዳ በተጅዊድ' },
      description: {
        en: 'Build a strong foundation in Arabic letters, pronunciation, and the essential rules of Tajweed.',
        am: 'በአረብኛ ፊደላት፣ አጠራር እና በመሠረታዊ የተጅዊድ ሕጎች ጠንካራ መሠረት ይገንቡ።',
      },
      features: {
        en: ['Arabic letters and sounds', 'Basic Tajweed rules', 'Guided reading practice', 'Individual correction'],
        am: ['የአረብኛ ፊደላት እና ድምጾች', 'የመሠረታዊ ተጅዊድ ሕጎች', 'የንባብ ልምምድ', 'የግል እርማት'],
      },
      sortOrder: 1,
    },
    {
      slug: 'nazira',
      title: { en: 'Quran Recitation (Nazira)', am: 'ቁርአን ነዘር' },
      description: {
        en: 'Improve your Quran reading with accurate pronunciation, fluency, and regular guided practice.',
        am: 'በትክክለኛ አጠራር፣ በአቀላጥፎ ንባብ እና በመደበኛ ልምምድ የቁርኣን ንባብዎን ያሻሽሉ።',
      },
      features: {
        en: ['Correct Quran recitation', 'One-to-one and group lessons', 'Reading fluency goals', 'Regular progress review'],
        am: ['ትክክለኛ የቁርኣን ንባብ', 'የግል እና የቡድን ትምህርት', 'የንባብ አቀላጥፎ ግቦች', 'መደበኛ የእድገት ግምገማ'],
      },
      sortOrder: 2,
    },
    {
      slug: 'hifz',
      title: { en: "Quran Hifz with Muraja'a (Revision)", am: 'ሂፍዝ ከሙራጀአ ጋር' },
      description: {
        en: 'Memorize the Quran with a structured Hifz plan and consistent Muraja’a to strengthen retention.',
        am: 'በተደራጀ የሂፍዝ እቅድ እና በቋሚ ሙራጀአ ቁርኣንን ይሸምዱ።',
      },
      features: {
        en: ['Structured Hifz goals', 'Daily memorization practice', 'Regular Muraja’a sessions', 'Teacher progress guidance'],
        am: ['የተደራጁ የሂፍዝ ግቦች', 'ዕለታዊ የማስታወስ ልምምድ', 'መደበኛ የሙራጀአ ጊዜዎች', 'የመምህር የእድገት መመሪያ'],
      },
      sortOrder: 3,
    },
    {
      slug: 'islamic-studies',
      title: { en: 'Basic Islamic Knowledge', am: 'መሰረታዊ የዲን ትምህርቶች' },
      description: {
        en: 'Learn the essential knowledge needed to understand and practice Islam with confidence.',
        am: 'እስልምናን በእምነት ለመረዳት እና ለመተግበር አስፈላጊውን እውቀት ይማሩ።',
      },
      features: {
        en: ['Aqeedah and Islamic belief', 'Essential Fiqh', 'Prophetic biography', 'Islamic manners and character'],
        am: ['አቂዳህ እና የእስልምና እምነት', 'መሠረታዊ ፊቅህ', 'የነቢዩ ሕይወት ታሪክ', 'የእስልምና ሥነ ምግባር'],
      },
      sortOrder: 4,
    },
  ]);
};

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

  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
      });
      console.log('MongoDB connected (Remote Atlas)');
    } else {
      throw new Error('No remote MONGO_URI');
    }
  } catch (remoteErr) {
    console.log('Remote MongoDB unavailable, connecting to local MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/nida', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected (Local Fallback)');
  }

  const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
  if (collections.length === 0) {
    await mongoose.connection.createCollection('users');
    console.log('Users collection created');
  }

  await createDefaultMainAdmin();
  await ensureDefaultCourses();
};

module.exports = connectDB;
