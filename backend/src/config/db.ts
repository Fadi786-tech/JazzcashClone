import mongoose from 'mongoose';
import { initializeBanks } from '../utils/initializeBanks';

let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);

    isConnected = true;

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await initializeBanks();

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectDB;