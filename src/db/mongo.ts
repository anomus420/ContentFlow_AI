import mongoose from 'mongoose';
import { config } from '../config';

export async function connectDB(): Promise<typeof mongoose> {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected to: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB at ${config.mongoUri}. Make sure MongoDB is running.`);
    console.warn(`[Database Warning] Error detail: ${(error as Error).message}`);
    // Re-throw so server entry point can handle connection status
    throw error;
  }
}
