const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('[VCET Canteen DB] Notice: MONGO_URI is not defined in process.env. Please provide MONGO_URI in server/.env file.');
      return null;
    }
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[VCET Canteen DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[VCET Canteen DB] MongoDB Connection Error: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
