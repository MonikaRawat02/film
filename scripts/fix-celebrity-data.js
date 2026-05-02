/**
 * Fix Celebrity Data Script
 * Re-scrapes all celebrities to fix films count, awards count, and net worth
 * 
 * Usage: node scripts/fix-celebrity-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Celebrity = require('../model/celebrity').default;
const { scrapeWikipediaCelebrity, getCelebrityUrlsByIndustry } = require('../lib/scrapers/wikipedia');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function fixCelebrityData() {
  console.log('🚀 Starting celebrity data fix...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const celebrities = await Celebrity.find({});
    console.log(`📊 Found ${celebrities.length} celebrities to fix\n`);

    let updated = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < celebrities.length; i++) {
      const celeb = celebrities[i];
      const name = celeb.heroSection?.name || 'Unknown';
      const industry = celeb.heroSection?.industry || 'Hollywood';
      const currentFilms = celeb.heroSection?.filmsCount || 0;
      const currentAwards = celeb.heroSection?.awardsCount || 0;

      console.log(`[${i + 1}/${celebrities.length}] Processing: ${name}`);
      console.log(`   Current: Films=${currentFilms}, Awards=${currentAwards}`);

      // Skip if data looks reasonable (films > 5 and awards >= 0)
      if (currentFilms > 5) {
        console.log(`   ⏭️  Skipping - data looks good\n`);
        skipped++;
        continue;
      }

      try {
        // Find Wikipedia URL for this celebrity
        const celebUrls = await getCelebrityUrlsByIndustry(industry);
        const celebUrl = celebUrls.find(c => 
          c.name.toLowerCase().includes(name.toLowerCase().split(' ')[0])
        );

        if (!celebUrl) {
          console.log(`   ⚠️  Could not find Wikipedia URL\n`);
          failed++;
          continue;
        }

        console.log(`   🔍 Scraping: ${celebUrl.url}`);
        
        // Re-scrape with fixed logic
        const scrapedData = await scrapeWikipediaCelebrity(celebUrl.url, industry);
        
        if (!scrapedData) {
          console.log(`   ❌ Failed to scrape data\n`);
          failed++;
          continue;
        }

        // Update only the fields that need fixing
        const updateData = {
          'heroSection.filmsCount': scrapedData.heroSection.filmsCount,
          'heroSection.awardsCount': scrapedData.heroSection.awardsCount,
        };

        // Update net worth if current one is invalid (less than 1M USD)
        if (!celeb.netWorth?.netWorthUSD?.min || celeb.netWorth.netWorthUSD.min < 1) {
          updateData['netWorth.netWorthUSD'] = scrapedData.netWorth.netWorthUSD;
          updateData['netWorth.netWorthINR'] = scrapedData.netWorth.netWorthINR;
          updateData['netWorth.description'] = scrapedData.netWorth.description;
        }

        await Celebrity.updateOne(
          { _id: celeb._id },
          { $set: updateData }
        );

        console.log(`   ✅ Updated: Films=${scrapedData.heroSection.filmsCount}, Awards=${scrapedData.heroSection.awardsCount}\n`);
        updated++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        failed++;
      }

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 FIX SUMMARY:');
    console.log('='.repeat(50));
    console.log(`   Total Celebrities: ${celebrities.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('='.repeat(50));
    console.log('\n✅ Celebrity data fix complete!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
fixCelebrityData();
