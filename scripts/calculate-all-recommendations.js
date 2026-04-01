/**
 * Script: Calculate All Movie Recommendations
 * Usage: node scripts/calculate-all-recommendations.js
 * 
 * This script calculates similar movies for ALL movies in the database
 * and stores them for fast retrieval.
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/admin/batch-calculate-recommendations';
const CRON_SECRET = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';

async function getAllMovieSlugs() {
  try {
    const response = await fetch('http://localhost:3000/api/articles/list?limit=10000&includeDrafts=true');
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.map(article => article.slug);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching movie slugs:', error);
    return [];
  }
}

async function calculateAllRecommendations() {
  console.log('🚀 Starting recommendation calculation for all movies...\n');

  // Get all movie slugs
  const allSlugs = await getAllMovieSlugs();
  
  if (allSlugs.length === 0) {
    console.log('❌ No movies found in database');
    return;
  }

  console.log(`📊 Found ${allSlugs.length} movies to process\n`);

  // Split into batches of 50 for processing
  const BATCH_SIZE = 50;
  const batches = [];
  
  for (let i = 0; i < allSlugs.length; i += BATCH_SIZE) {
    batches.push(allSlugs.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Created ${batches.length} batches\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`⚙️ Processing batch ${i + 1}/${batches.length} (${batch.length} movies)...`);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': CRON_SECRET
        },
        body: JSON.stringify({
          slugs: batch,
          limitPerMovie: 8
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Batch ${i + 1} complete: ${result.count} movies updated\n`);
        successCount += result.count;
      } else {
        console.error(`❌ Batch ${i + 1} failed:`, result.message, '\n');
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Batch ${i + 1} error:`, error.message, '\n');
      errorCount++;
    }

    // Add delay between batches to avoid overwhelming the server
    if (i < batches.length - 1) {
      console.log('⏳ Waiting 2 seconds before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n===========================================');
  console.log('📊 FINAL RESULTS:');
  console.log(`   Total Movies: ${allSlugs.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed Batches: ${errorCount}`);
  console.log('===========================================\n');
}

// Run the script
calculateAllRecommendations()
  .then(() => {
    console.log('✅ Recommendation calculation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
