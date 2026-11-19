import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    };

    const conn = await mongoose.connect(env.mongodbUri, opts);
    isConnected = true;
    console.log(`[RentGuard DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[RentGuard DB Warning] Unable to connect to MongoDB at ${env.mongodbUri}: ${err.message}`);
    console.warn(`[RentGuard DB Warning] Verify MONGODB_URI or check if MongoDB / MongoDB Atlas is running.`);
    // Do not crash immediately in dev, allows app to startup and surface DB connection errors clearly to client
    return null;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[RentGuard DB] Disconnected from MongoDB');
  }
}

