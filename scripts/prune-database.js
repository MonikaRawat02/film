
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function pruneDatabase() {
  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, 
    };
    await mongoose.connect(process.env.MONGODB_URI, opts);
    console.log("✅ Connected to MongoDB");

    // The user's screenshot shows DB: film, Collection: articles
    const db = mongoose.connection.useDb('film');
    console.log("🎯 Using database: film");

    const collection = db.collection('articles');
    
    // Test count directly
    const totalCount = await collection.countDocuments({});
    console.log(`📊 Total documents in 'articles' collection: ${totalCount}`);

    const categories = ["Bollywood", "Hollywood", "WebSeries", "BoxOffice"];
    const LIMIT = 8; 

    for (const category of categories) {
      console.log(`\n📂 Processing category: ${category}`);
      const categoryQuery = { 
        category: { $regex: new RegExp(`^${category}$`, 'i') } 
      };

      const allArticles = await collection
        .find(categoryQuery)
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`   Found ${allArticles.length} total articles.`);

      // Identify AI articles: isAIContent is true OR has many sections
      const aiArticles = allArticles.filter(a => a.isAIContent === true || (a.sections && a.sections.length > 5));
      
      if (aiArticles.length > 0) {
        // Keep the 8 newest AI-generated articles
        const toKeep = aiArticles.slice(0, LIMIT).map(a => a._id);
        const deleteResult = await collection.deleteMany({
          category: { $regex: new RegExp(`^${category}$`, 'i') },
          _id: { $nin: toKeep }
        });
        console.log(`   🗑️ Kept ${toKeep.length} newest AI articles. Deleted ${deleteResult.deletedCount} other articles.`);
      } else if (allArticles.length > 0) {
        // If no AI content, keep the 8 newest standard ones
        const toKeep = allArticles.slice(0, LIMIT).map(a => a._id);
        const deleteResult = await collection.deleteMany({
          category: { $regex: new RegExp(`^${category}$`, 'i') },
          _id: { $nin: toKeep }
        });
        console.log(`   ⚠️ No AI content found. Keeping ${toKeep.length} newest standard articles. Deleted ${deleteResult.deletedCount} older articles.`);
      }
    }

    const finalTotal = await collection.countDocuments({});
    console.log(`\n✨ Done! Total movies remaining in database: ${finalTotal}`);

  } catch (err) {
    console.error("❌ Pruning failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

pruneDatabase();
