
import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import { generateCelebrityData } from "../../../../lib/ai-generator";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug, limit = 5 } = req.body;

  try {
    await dbConnect();

    let query = { isAutomated: true };
    if (slug) {
      query = { "heroSection.slug": slug };
    }

    // Find celebrities that need enrichment
    const celebs = await Celebrity.find(query).limit(limit).sort({ updatedAt: 1 });

    const results = {
      enriched: 0,
      failed: 0,
      details: []
    };

    for (const celeb of celebs) {
      try {
        const name = celeb.heroSection.name;
        const industry = celeb.heroSection.industry || "Bollywood";
        
        console.log(`🤖 Enriching ${name}...`);
        const aiData = await generateCelebrityData(name, industry);
        
        if (aiData) {
          // Merge AI data into existing record
          const update = {
            "heroSection.birthday": aiData.heroSection.birthday || celeb.heroSection.birthday,
            "heroSection.placeOfBirth": aiData.heroSection.placeOfBirth || celeb.heroSection.placeOfBirth,
            "heroSection.filmsCount": aiData.heroSection.filmsCount || celeb.heroSection.filmsCount,
            "heroSection.awardsCount": aiData.heroSection.awardsCount || celeb.heroSection.awardsCount,
            "heroSection.height": aiData.heroSection.height || celeb.heroSection.height,
            "quickFacts.age": aiData.quickFacts.age || celeb.quickFacts.age,
            "quickFacts.birthDate": aiData.quickFacts.birthDate || celeb.quickFacts.birthDate,
            "quickFacts.notableMovies": aiData.quickFacts.notableMovies || celeb.quickFacts.notableMovies,
            "netWorth": aiData.netWorth || celeb.netWorth,
            "netWorthCalculation": aiData.netWorthCalculation || celeb.netWorthCalculation,
            "netWorthTimeline": aiData.netWorthTimeline || celeb.netWorthTimeline,
            "assets": aiData.assets || celeb.assets
          };

          await Celebrity.updateOne({ _id: celeb._id }, { $set: update });
          results.enriched++;
          results.details.push({ name, status: "Success" });
        } else {
          results.failed++;
          results.details.push({ name, status: "AI Failed" });
        }
      } catch (err) {
        console.error(`Failed to enrich ${celeb.heroSection?.name}:`, err.message);
        results.failed++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Enriched ${results.enriched} celebrities.`,
      results
    });

  } catch (error) {
    console.error("Celebrity enrichment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
