const mongoose = require('mongoose');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Article = require('./model/article').default || require('./model/article');

const CRON_SECRET = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
const BASE_URL = 'http://localhost:3000';

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find movies missing sub-pages, excluding ones already processed in previous turns
    const movies = await Article.find({ 
      contentType: 'movie',
      $or: [
        { 'subPages.endingExplained': false },
        { 'subPages.boxOffice': false },
        { 'subPages.budget': false },
        { 'subPages.ottRelease': false },
        { 'subPages.cast': false },
        { 'subPages.reviewAnalysis': false },
        { 'subPages.hitOrFlop': false }
      ]
    }).limit(20); // Process 20 movies in this batch

    console.log(`🚀 Found ${movies.length} movies to process with PAID Gemini Flash...`);

    for (const movie of movies) {
      console.log(`🎬 Processing: ${movie.movieTitle} (${movie.slug})...`);
      
      const subPages = [
        "overview",
        "ending-explained",
        "box-office",
        "budget",
        "ott-release",
        "cast",
        "review-analysis",
        "hit-or-flop"
      ];

      for (const pageType of subPages) {
        console.log(`   ⏳ Generating ${pageType}...`);
        try {
          const res = await fetch(`${BASE_URL}/api/admin/automation/generate-ai-content`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-cron-secret": CRON_SECRET
            },
            body: JSON.stringify({ slug: movie.slug, pageType })
          });
          const data = await res.json();
          if (data.success) {
            console.log(`   ✅ ${pageType} success!`);
          } else {
            console.error(`   ❌ ${pageType} failed: ${data.message}`);
          }
        } catch (err) {
          console.error(`   ❌ Error calling API for ${pageType}:`, err.message);
        }
        // Small 1 second delay between sub-pages for stability
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log(`✨ Finished all pages for ${movie.movieTitle}\n`);
    }

    console.log('🏁 Batch completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during backfill:', err);
    process.exit(1);
  }
}

backfill();
