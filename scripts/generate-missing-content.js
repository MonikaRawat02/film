
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function generateMissingContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.useDb('film');
    const collection = db.collection('articles');

    // Find movies where isAIContent is not true or pSEO_Content_overview is empty
    const movies = await collection.find({
      $or: [
        { isAIContent: { $ne: true } },
        { pSEO_Content_overview: { $exists: false } },
        { pSEO_Content_overview: { $size: 0 } }
      ],
      contentType: "movie"
    }).toArray();

    console.log(`📊 Found ${movies.length} movies missing AI content.`);

    const CRON_SECRET = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    for (const movie of movies) {
      console.log(`\n🤖 Processing: ${movie.movieTitle || movie.title} (${movie.slug})`);
      
      try {
        // Trigger sub-pages generation API
        const response = await axios.post(`${BASE_URL}/api/admin/automation/generate-sub-pages`, {
          slug: movie.slug
        }, {
          headers: {
            'x-cron-secret': CRON_SECRET,
            'Content-Type': 'application/json'
          },
          timeout: 300000 // 5 minute timeout per movie
        });

        if (response.data.success) {
          console.log(`   ✅ Successfully generated content for ${movie.movieTitle || movie.title}`);
        } else {
          console.log(`   ⚠️ Failed to generate: ${response.data.message}`);
        }
      } catch (err) {
        console.error(`   ❌ Error for ${movie.slug}:`, err.response?.data?.message || err.message);
        if (err.message.includes('timeout')) {
          console.log("   ⏳ Timeout occurred, but generation might still be running in background.");
        }
      }
      
      // Small delay between movies to avoid overwhelming the AI API
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("\n✨ Bulk generation complete!");

  } catch (err) {
    console.error("❌ Generation script failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

generateMissingContent();
