const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nida';

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected to ${mongoUri}`);

    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await mongoose.connection.createCollection('users');
      console.log('Users collection created');
    } else {
      console.log('Users collection already exists');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
