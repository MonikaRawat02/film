const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { scrapeWikipediaCelebrity } = require('../lib/scrapers/wikipedia');

// Define Schema for Script
const CelebritySchema = new mongoose.Schema({}, { strict: false });
const Celebrity = mongoose.models.Celebrity || mongoose.model('Celebrity', CelebritySchema);

async function backfillCelebrityData() {
  try {
    console.log("🚀 Starting Celebrity Wikipedia Scraping Backfill (FULL UPDATE)...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch ALL celebrities to update them with full Wikipedia data
    const celebrities = await Celebrity.find({});

    console.log(`🔍 Found ${celebrities.length} celebrities to refresh from Wikipedia.`);

    for (let i = 0; i < celebrities.length; i++) {
      const celeb = celebrities[i];
      const name = celeb.heroSection?.name;
      const industry = celeb.heroSection?.industry || "Bollywood";
      
      // Try multiple Wikipedia URL variations
      const nameUnderscore = name.replace(/\s+/g, '_');
      const wikiUrls = [
        `https://en.wikipedia.org/wiki/${nameUnderscore}`,
        `https://en.wikipedia.org/wiki/${nameUnderscore}_(actor)`,
        `https://en.wikipedia.org/wiki/${nameUnderscore}_(actress)`,
        `https://en.wikipedia.org/wiki/${nameUnderscore}_(Indian_actor)`,
        `https://en.wikipedia.org/wiki/${nameUnderscore}_(Indian_actress)`
      ];
      
      let scrapedData = null;
      let usedUrl = "";

      for (const urlVariation of wikiUrls) {
        console.log(`[${i + 1}/${celebrities.length}] Trying Wikipedia for: ${name} at ${urlVariation}...`);
        try {
          scrapedData = await scrapeWikipediaCelebrity(urlVariation, industry);
          if (scrapedData) {
            usedUrl = urlVariation;
            break;
          }
        } catch (err) {
          // Continue to next URL variation
        }
      }

      try {
        if (scrapedData) {
          // Merge scraped data into the existing document, prioritizing Wikipedia
          const updateData = {
            ...celeb.toObject(), // Base on existing data
            ...scrapedData, // Wikipedia overwrites
            heroSection: {
              ...(celeb.heroSection || {}),
              ...scrapedData.heroSection,
              // ALWAYS PRESERVE EXISTING SLUG TO AVOID DUPLICATE KEY ERRORS
              slug: celeb.heroSection?.slug || scrapedData.heroSection?.slug,
              // Preserve original industry if Wikipedia doesn't provide a better one
              industry: celeb.heroSection?.industry || scrapedData.heroSection?.industry,
              // Preserve TMDB ID if it exists
              tmdbId: celeb.heroSection?.tmdbId || scrapedData.heroSection?.tmdbId
            },
            quickFacts: {
              ...(celeb.quickFacts || {}),
              ...scrapedData.quickFacts
            }
          };

          // Use more comprehensive biography from Wikipedia if available
          if (scrapedData.biographyTimeline?.length > 0) {
            updateData.biographyTimeline = scrapedData.biographyTimeline;
          }

          await Celebrity.findByIdAndUpdate(celeb._id, { $set: updateData });
          console.log(`✅ Updated: ${name} using ${usedUrl}`);
        } else {
          console.warn(`⚠️ No Wikipedia data found for: ${name} after trying variations.`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000)); 

      } catch (err) {
        console.error(`❌ Error updating ${name}:`, err.message);
      }
    }

    console.log("🏁 Backfill complete.");
    process.exit(0);
  } catch (error) {
    console.error("FATAL ERROR:", error);
    process.exit(1);
  }
}

backfillCelebrityData();

