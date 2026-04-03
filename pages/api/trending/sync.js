// Trend Validation & Mapping System Orchestrator
// pages/api/trending/sync.js
import dbConnect from "../../../lib/mongodb";
import Trending, { calculateTrendScore } from "../../../model/trending";
import { fetchAllTrends } from "../../../lib/trending/data-ingestion";
import { preprocessTrend } from "../../../lib/trending/preprocessing";
import { validateTrend } from "../../../lib/trending/validation";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  
  // Security check
  if (req.headers['x-cron-secret'] !== cronSecret && req.query.secret !== cronSecret) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();
    console.log("🚀 Starting Trend Validation & Mapping System Sync...");

    // 1. Data Ingestion Layer (User's requirement #1)
    const rawTrends = await fetchAllTrends("IN");
    console.log(`📡 Ingested ${rawTrends.length} raw trends from Google & YouTube`);

    const results = {
      total: rawTrends.length,
      processed: 0,
      validated: 0,
      stored: 0,
      errors: []
    };

    // 2. Process, Validate & Map each trend
    for (const rawTrend of rawTrends) {
      try {
        // Step 2 & 3: Preprocessing & Entity Recognition (User's requirements #2, #3)
        const processedTrend = await preprocessTrend(rawTrend);
        results.processed++;

        // Step 4 & 5: Database Validation & Mapping (User's requirements #4, #5)
        const validationResult = await validateTrend(processedTrend);

        if (validationResult.isValid) {
          results.validated++;

          // Step 6 & 7: Ranking & Storage Layer (User's requirements #6, #7)
          const trendData = {
            title: validationResult.title || processedTrend.title,
            type: validationResult.type, // trending_movies | trending_actors | viral_topics
            entityType: validationResult.entityType, // movie | actor | topic
            entityId: validationResult.entityId,
            referenceId: validationResult.referenceId,
            referenceModel: validationResult.entityType === "movie" ? "Article" : (validationResult.entityType === "actor" ? "Celebrity" : null),
            slug: validationResult.slug,
            source: processedTrend.source,
            traffic: processedTrend.traffic,
            viewCount: processedTrend.viewCount,
            keywords: processedTrend.keywords,
            classificationConfidence: processedTrend.classificationConfidence,
            metadata: {
              ...processedTrend.metadata,
              ...validationResult.metadata
            },
            status: "active",
            trendTimestamp: processedTrend.timestamp
          };

          // Step 6: Ranking Engine (User's requirement #6)
          trendData.score = calculateTrendScore(trendData);

          // Step 7: Storage Layer (User's requirement #7)
          await Trending.findOneAndUpdate(
            { 
              title: trendData.title,
              type: trendData.type
            },
            trendData,
            { upsert: true, new: true }
          );

          results.stored++;
        }
      } catch (err) {
        console.error(`❌ Error processing trend "${rawTrend.title}":`, err.message);
        results.errors.push({ title: rawTrend.title, error: err.message });
      }
    }

    // Cleanup: Expire old trends (older than 48 hours)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 48);
    await Trending.updateMany(
      { trendTimestamp: { $lt: expirationDate }, status: "active" },
      { status: "expired" }
    );

    console.log(`✅ Sync Completed: Stored ${results.stored}/${results.total} valid trends.`);

    return res.status(200).json({
      success: true,
      message: "Trend Validation & Mapping System Sync completed successfully",
      results
    });

  } catch (error) {
    console.error("CRITICAL Trend Sync Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
