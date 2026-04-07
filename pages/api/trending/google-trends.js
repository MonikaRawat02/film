// GET /api/trending/google-trends
// Fetch ONLY Google Trends data (no YouTube)
import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import { fetchGoogleTrends } from "../../../lib/trending/data-ingestion";
import { preprocessTrend } from "../../../lib/trending/preprocessing";
import { validateTrend } from "../../../lib/trending/validation";

const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

/**
 * Enrich validated trend with full database content
 */
async function enrichTrendData(trend, validation) {
  try {
    let enrichedData = {
      ...trend,
      referenceId: validation.referenceId,
      referenceModel:
        validation.type === "trending_movies"
          ? "Article"
          : validation.type === "trending_actors"
          ? "Celebrity"
          : null,
    };

    return enrichedData;
  } catch (error) {
    console.error("Enrichment error:", error.message);
    return trend;
  }
}

/**
 * Calculate trend score based on multiple factors
 */
function calculateScore(trend) {
  let score = 0;

  // Traffic contribution (60% for Google Trends since it measures search volume)
  if (trend.traffic > 1000000) score += 60;
  else if (trend.traffic > 500000) score += 45;
  else if (trend.traffic > 100000) score += 30;
  else if (trend.traffic > 50000) score += 15;

  // Recency contribution (30%)
  const hoursSinceTrend =
    (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
  if (hoursSinceTrend < 6) score += 30;
  else if (hoursSinceTrend < 24) score += 20;
  else if (hoursSinceTrend < 48) score += 10;

  // Classification confidence (10%)
  score += Math.round((trend.classificationConfidence || 0.5) * 10);

  return Math.min(score, 100);
}

export default async function handler(req, res) {
  // Verify CRON secret for POST requests
  if (req.method === "POST") {
    const secret = req.headers["x-cron-secret"];
    if (secret !== CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  } else if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    console.log("\n" + "=".repeat(70));
    console.log("🚀 Starting Google Trends Sync Pipeline");
    console.log("=".repeat(70));

    // Step 1: Fetch ONLY Google Trends (no YouTube)
    console.log("\n📊 Step 1: Fetching Google Trends data...");
    const rawTrends = await fetchGoogleTrends("IN");
    console.log(`   ✅ Fetched ${rawTrends.length} Google Trends`);

    if (rawTrends.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Google Trends found",
        stats: {
          processed: 0,
          validated: 0,
          rejected: 0,
          movies: 0,
          actors: 0,
          topics: 0,
          source: "google",
        },
      });
    }

    // Step 2: Process and validate
    console.log("\n🔍 Step 2: Processing, validating, and enriching...");
    let validated = 0;
    let rejected = 0;
    let movies = 0;
    let actors = 0;
    let topics = 0;
    const trendingRecords = [];

    for (const rawTrend of rawTrends) {
      try {
        // Preprocess
        const preprocessed = await preprocessTrend(rawTrend);

        // Validate
        const validation = await validateTrend(preprocessed);

        if (!validation.isValid) {
          console.log(
            `   ⏭️  Skipped: "${rawTrend.title.substring(0, 40)}..." (not in DB)`
          );
          rejected++;
          continue;
        }

        // Enrich
        const enriched = await enrichTrendData(preprocessed, validation);

        // Calculate score
        const score = calculateScore(enriched);

        // Create record
        const trendRecord = {
          title: enriched.title,
          type: validation.type,
          entityType: validation.entityType,
          referenceId: enriched.referenceId,
          referenceModel: enriched.referenceModel,
          slug: validation.slug,
          source: "google", // Mark as Google Trends
          traffic: enriched.traffic || 0,
          viewCount: 0, // Google Trends doesn't have view counts
          keywords: enriched.keywords || [],
          classificationConfidence: enriched.classificationConfidence || 0.5,
          status: "active",
          trendTimestamp: new Date(enriched.timestamp),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          metadata: enriched.metadata,
          score: score,
        };

        trendingRecords.push(trendRecord);

        const typeLabel =
          validation.type === "trending_movies"
            ? "🎬"
            : validation.type === "trending_actors"
            ? "👤"
            : "📊";
        console.log(
          `   ${typeLabel} Validated & enriched: "${enriched.title.substring(0, 30)}..." (Score: ${score})`
        );

        validated++;
        if (validation.type === "trending_movies") movies++;
        else if (validation.type === "trending_actors") actors++;
        else if (validation.type === "viral_topics") topics++;
      } catch (error) {
        console.log(
          `   ❌ Error processing "${rawTrend.title.substring(0, 30)}...": ${error.message}`
        );
        rejected++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`\n📝 Processing Complete`);
    console.log(`   Total processed: ${rawTrends.length}`);
    console.log(`   Validated: ${validated} (${((validated / rawTrends.length) * 100).toFixed(1)}%)`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);


    // Step 3: Save to database
    if (trendingRecords.length > 0) {
      console.log(`\n💾 Step 3: Saving to database...`);

      // Delete expired Google Trends
      const expiredCount = await Trending.deleteMany({
        source: "google",
        expiresAt: { $lt: new Date() },
      });
      console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired Google Trends`);

      // Upsert new trends
      for (const record of trendingRecords) {
        await Trending.findOneAndUpdate(
          { title: record.title, source: "google" },
          record,
          { upsert: true, returnDocument: 'after' }
        );
      }

      console.log(`   ✅ Saved ${trendingRecords.length} Google Trends to database`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ Google Trends Sync Complete!");
    console.log("=".repeat(70) + "\n");

    return res.status(200).json({
      success: true,
      message: "Google Trends synced successfully",
      stats: {
        processed: rawTrends.length,
        validated,
        rejected,
        movies,
        actors,
        topics,
        saved: trendingRecords.length,
        source: "google",
      },
    });
  } catch (error) {
    console.error("❌ Google Trends Sync Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Google Trends sync failed",
      error: error.message,
      source: "google",
    });
  }
}
