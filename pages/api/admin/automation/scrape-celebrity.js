import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import { getCelebrityUrlsByIndustry, scrapeWikipediaCelebrity } from "../../../../lib/scrapers/wikipedia";
import { slugify } from "../../../../lib/slugify";
import { generateCelebrityData } from "../../../../lib/ai-generator";

export default async function handler(req, res) {
  // Security check for production
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { industry = "Bollywood", limit = 50 } = req.body;

  try {
    await dbConnect();

    // --- Daily Limit Check ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const countToday = await Celebrity.countDocuments({
      createdAt: { $gte: today },
      isAutomated: true
    });

    const DAILY_LIMIT = 20;
    if (countToday >= DAILY_LIMIT) {
      return res.status(200).json({
        success: true,
        message: `Daily limit of ${DAILY_LIMIT} celebrities reached. Skipping for today.`,
        synced: 0
      });
    }

    const remainingQuota = DAILY_LIMIT - countToday;
    const MAX_PER_RUN = Math.min(remainingQuota, 20);
    // --- End Daily Limit Check ---

    const celebUrls = await getCelebrityUrlsByIndustry(industry);
    console.log(`Found ${celebUrls.length} celebrity URLs for ${industry}`);
    
    const results = {
      totalFound: celebUrls.length,
      synced: 0,
      failed: 0,
      celebrities: []
    };

    let syncedInIndustry = 0;

    for (const celebInfo of celebUrls) {
      if (syncedInIndustry >= MAX_PER_RUN) break;

      try {
        const celebSlug = slugify(celebInfo.name);
        const existing = await Celebrity.findOne({ "heroSection.slug": celebSlug });
        if (existing) continue; // Skip if already exists

        console.log(`🔍 Scraping new celebrity: ${celebInfo.name}...`);
        const scrapedData = await scrapeWikipediaCelebrity(celebInfo.url, industry);
        if (!scrapedData) {
          results.failed++;
          continue;
        }

        // --- New AI Intelligence Enhancement ---
        console.log(`🤖 Generating intelligence data for ${celebInfo.name}...`);
        const aiData = await generateCelebrityData(celebInfo.name, industry);
        
        let finalData = scrapedData;
        if (aiData) {
          finalData = {
            ...scrapedData,
            ...aiData,
            heroSection: {
              ...scrapedData.heroSection,
              ...aiData.heroSection
            }
          };
        }
        // --- End AI Intelligence Enhancement ---

        const finalSlug = finalData.heroSection.slug;
        
        // Update if exists, otherwise create
        await Celebrity.findOneAndUpdate(
          { "heroSection.slug": finalSlug },
          { $set: finalData },
          { upsert: true, returnDocument: 'after' }
        );

        syncedInIndustry++;
        results.synced++;
        results.celebrities.push(scrapedData.heroSection.name);
        console.log(`✅ Saved celebrity: ${scrapedData.heroSection.name}`);
      } catch (err) {
        console.error(`Failed to sync ${celebInfo.name}:`, err.message);
        results.failed++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully synced ${results.synced} new celebrities for ${industry}`,
      data: results
    });

  } catch (error) {
    console.error("Celebrity scraping automation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
