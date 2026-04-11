
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function cleanupDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Define the query to find movies with NO generated content
    // We check if all pSEO content fields are empty or missing
    const query = {
      contentType: "movie",
      pSEO_Content_overview: { $size: 0 },
      pSEO_Content_budget: { $size: 0 },
      pSEO_Content_box_office: { $size: 0 },
      pSEO_Content_ott_release: { $size: 0 },
      pSEO_Content_cast: { $size: 0 },
      pSEO_Content_review_analysis: { $size: 0 },
      pSEO_Content_hit_or_flop: { $size: 0 }
    };

    const count = await mongoose.connection.collection('articles').countDocuments(query);
    console.log(`🔍 Found ${count} movies with no generated content.`);

    if (count > 0) {
      const result = await mongoose.connection.collection('articles').deleteMany(query);
      console.log(`🗑️ Successfully deleted ${result.deletedCount} movies with no content.`);
    } else {
      console.log("✨ Database is already clean. No movies to delete.");
    }

  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

cleanupDatabase();
