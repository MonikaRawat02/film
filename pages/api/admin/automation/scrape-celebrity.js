import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import { getCelebrityUrlsByIndustry, scrapeWikipediaCelebrity } from "../../../../lib/scrapers/wikipedia";
import { slugify } from "@/lib/slugify";

export default async function handler(req, res) {
  // Security check for production
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { industry = "Bollywood", limit = 20 } = req.body;

  try {
    await dbConnect();

    const celebUrls = await getCelebrityUrlsByIndustry(industry);
    console.log(`Found ${celebUrls.length} celebrity URLs for ${industry}`);
    
    const results = {
      totalFound: celebUrls.length,
      synced: 0,
      failed: 0,
      skipped: 0,
      celebrities: []
    };

    // Use the limit from request body, default to 20
    const MAX_TO_SYNC = parseInt(limit) || 20;
    let syncedInIndustry = 0;

    for (const celebInfo of celebUrls) {
      if (syncedInIndustry >= MAX_TO_SYNC) break;

      try {
        const celebSlug = slugify(celebInfo.name);
        
        // Quick check if exists to avoid unnecessary scraping
        const existing = await Celebrity.findOne({ 
          $or: [
            { "heroSection.slug": celebSlug },
            { "heroSection.name": celebInfo.name }
          ]
        });
        
        if (existing) {
          results.skipped++;
          continue; 
        }

        console.log(`🔍 Scraping new celebrity: ${celebInfo.name}...`);
        const scrapedData = await scrapeWikipediaCelebrity(celebInfo.url, industry);
        
        if (!scrapedData) {
          results.failed++;
          continue;
        }

        const finalSlug = scrapedData.heroSection.slug;
        
        // Final upsert check
        await Celebrity.findOneAndUpdate(
          { "heroSection.slug": finalSlug },
          { $set: scrapedData },
          { upsert: true, returnDocument: 'after' }
        );

        syncedInIndustry++;
        results.synced++;
        results.celebrities.push(scrapedData.heroSection.name);
        console.log(`✅ Saved celebrity: ${scrapedData.heroSection.name} (${syncedInIndustry}/${MAX_TO_SYNC})`);
        
        // Small delay to be nice to Wikipedia
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (err) {
        console.error(`Failed to sync ${celebInfo.name}:`, err.message);
        results.failed++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully synced ${results.synced} new celebrities for ${industry}. Skipped ${results.skipped} existing.`,
      data: results
    });

  } catch (error) {
    console.error("Celebrity scraping automation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
