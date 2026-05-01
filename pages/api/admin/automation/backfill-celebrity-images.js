import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import { fetchCelebrityFromTMDB } from "../../../../lib/api-clients/tmdb.js";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret && req.query.secret !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Find celebrities that don't have profile images or have placeholder images
    const celebrities = await Celebrity.find({
      $or: [
        { "heroSection.profileImage": { $exists: false } },
        { "heroSection.profileImage": "" },
        { "heroSection.profileImage": "/placeholder.jpg" },
        { "heroSection.profileImage": null }
      ]
    }).limit(20); // Process 20 at a time to avoid rate limits

    const results = {
      totalFound: celebrities.length,
      updated: 0,
      failed: 0,
      celebrities: []
    };

    console.log(`🎯 Found ${celebrities.length} celebrities to backfill with profile images`);

    for (const celeb of celebrities) {
      try {
        const name = celeb.heroSection?.name;
        if (!name) {
          results.failed++;
          continue;
        }

        console.log(`🔍 Fetching TMDB data for: ${name}`);
        const tmdbData = await fetchCelebrityFromTMDB(name);

        if (tmdbData && tmdbData.profileImage) {
          // Update the celebrity with TMDB profile image and ID
          await Celebrity.updateOne(
            { _id: celeb._id },
            {
              $set: {
                "heroSection.profileImage": tmdbData.profileImage,
                "heroSection.tmdbId": tmdbData.tmdbId
              }
            }
          );
          results.updated++;
          results.celebrities.push(name);
          console.log(`✅ Updated profile image for: ${name}`);
        } else {
          results.failed++;
          console.log(`⚠️ No TMDB profile image found for: ${name}`);
        }

        // Add delay to be nice to TMDB API
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (err) {
        results.failed++;
        console.error(`❌ Failed to update ${celeb.heroSection?.name}:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Backfill complete! Updated ${results.updated} celebrities. Failed: ${results.failed}.`,
      data: results
    });

  } catch (error) {
    console.error("Backfill error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
