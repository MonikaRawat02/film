// scripts/fix-trending-data.js
// Run with: node scripts/fix-trending-data.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixTrendingData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection;
    
    // Get all trending collections
    const collections = ['trendings', 'trending_movies', 'trending_actors', 'viral_topics'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      
      // Update all documents to set isValidated to true
      const result = await collection.updateMany(
        { isValidated: { $ne: true } },
        { $set: { isValidated: true, status: 'active' } }
      );
      
      console.log(`Updated ${result.modifiedCount} documents in ${collectionName}`);
    }
    
    console.log('✅ Fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTrendingData();