import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// DEBUG LOG: This will print to your terminal when the server starts
if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is missing from .env file!");
  console.error("   Falling back to localhost (This will fail if you don't have local MongoDB)");
} else {
  console.log("✅ Loaded MONGODB_URI from .env (Attempting to connect...)");
}

const finalURI = MONGODB_URI || 'mongodb://localhost:27017/feedback_hub';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(finalURI).then((mongoose) => {
      console.log("🚀 MongoDB Connected Successfully");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise so we can try again
    console.error("❌ MongoDB Connection Failed:", error);
    throw error;
  }
}

export default connectDB;