import mongoose from "mongoose";
import dns from "node:dns";

// Attempt to set global DNS servers to bypass local ETIMEOUT issues
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  console.log("🌐 Global DNS resolvers set to Google/Cloudflare");
} catch (e) {
  console.warn("⚠️ DNS override not supported in this environment:", e.message);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    };

    console.log("📡 Attempting MongoDB connection...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connection Successful");
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB Connection Failed:", err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on failure to allow retry
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
