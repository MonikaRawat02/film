
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function scanDatabases() {
  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, 
    };
    await mongoose.connect(process.env.MONGODB_URI, opts);
    console.log("✅ Connected to MongoDB Atlas");

    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    console.log("\n📁 Listing all Databases and Collections:");
    for (const dbInfo of dbs.databases) {
      const db = mongoose.connection.useDb(dbInfo.name);
      const collections = await db.db.listCollections().toArray();
      
      console.log(`\n📦 DB: ${dbInfo.name}`);
      for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments({});
        if (count > 0) {
          console.log(`   - ${coll.name}: ${count} docs`);
          // If it looks like our articles collection, show a sample
          if (coll.name.toLowerCase().includes('article') || coll.name.toLowerCase().includes('movie')) {
            const sample = await db.collection(coll.name).findOne({});
            console.log(`     Sample Title: ${sample.title || sample.movieTitle || 'N/A'}`);
            console.log(`     Sample Category: ${sample.category || 'N/A'}`);
          }
        }
      }
    }

  } catch (err) {
    console.error("❌ Scan failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

scanDatabases();
