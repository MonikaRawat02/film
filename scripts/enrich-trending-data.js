// Script to enrich trending data and store in database
// Fetches trends from Google & YouTube, validates against DB, then enriches content
import mongoose from "mongoose";
import { fetchAllTrends } from "./lib/trending/data-ingestion.js";
import { preprocessTrend } from "./lib/trending/preprocessing.js";
import { validateTrend } from "./lib/trending/validation.js";
import Trending from "./model/trending.js";
import Article from "./model/article.js";
import Celebrity from "./model/celebrity.js";
import dbConnect from "./lib/mongodb.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Enrich trend with full database content
 */
async function enrichTrendData(trend, validation) {
  try {
    let enrichedData = {
      ...trend,
      referenceId: validation.referenceId,
      referenceModel: validation.type === "movie" ? "Article" : validation.type === "actor" ? "Celebrity" : null,
    };

    // Fetch full details from database
    if (validation.type === "movie" && validation.referenceId) {
      const movie = await Article.findById(validation.referenceId).select(
        "movieTitle slug coverImage releaseYear director genres stats"
      );

      if (movie) {
        enrichedData.metadata = {
          ...enrichedData.metadata,
          movieTitle: movie.movieTitle,
          releaseYear: movie.releaseYear,
          director: movie.director?.[0] || "N/A",
          genres: movie.genres?.join(", ") || "N/A",
          boxOffice: movie.stats?.worldwide || "N/A",
        };
      }
    }

    if (validation.type === "actor" && validation.referenceId) {
      const celebrity = await Celebrity.findById(validation.referenceId).select(
        "heroSection.name heroSection.industry quickFacts.age netWorth"
      );

      if (celebrity) {
        enrichedData.metadata = {
          ...enrichedData.metadata,
          actorName: celebrity.heroSection?.name,
          industry: celebrity.heroSection?.industry,
          age: celebrity.quickFacts?.age,
          netWorth: celebrity.netWorth?.netWorthUSD?.display,
        };
      }
    }

    return enrichedData;
  } catch (error) {
    console.error("Enrichment error:", error.message);
    return trend;
  }
}

/**
 * Main enrichment pipeline
 */
async function enrichTrendingData() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 Starting Trend Enrichment Pipeline");
  console.log("=".repeat(70) + "\n");

  try {
    await dbConnect();
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Fetch raw trends
    console.log("📊 Step 1: Fetching trends from Google & YouTube...");
    const rawTrends = await fetchAllTrends("IN");
    console.log(`   ✅ Fetched ${rawTrends.length} raw trends\n`);

    if (rawTrends.length === 0) {
      console.log("⚠️  No trends found. Exiting.");
      return;
    }

    // Step 2: Process and validate
    let validated = 0;
    let rejected = 0;
    const trendingRecords = [];

    for (const rawTrend of rawTrends) {
      try {
        // Preprocess
        const preprocessed = await preprocessTrend(rawTrend);

        // Validate
        const validation = await validateTrend(preprocessed);

        if (!validation.isValid) {
          console.log(`   ⏭️  Skipped: "${rawTrend.title}" (not in DB)`);
          rejected++;
          continue;
        }

        // Enrich
        const enriched = await enrichTrendData(preprocessed, validation);

        // Calculate score
        let score = 0;

        // Traffic contribution (40%)
        if (enriched.metadata?.traffic > 1000000) score += 40;
        else if (enriched.metadata?.traffic > 500000) score += 30;
        else if (enriched.metadata?.traffic > 100000) score += 20;
        else if (enriched.metadata?.traffic > 50000) score += 10;

        // View count contribution (30%)
        if (enriched.metadata?.viewCount > 10000000) score += 30;
        else if (enriched.metadata?.viewCount > 5000000) score += 20;
        else if (enriched.metadata?.viewCount > 1000000) score += 10;

        // Recency contribution (20%)
        const hoursSinceTrend =
          (Date.now() - new Date(enriched.timestamp).getTime()) /
          (1000 * 60 * 60);
        if (hoursSinceTrend < 6) score += 20;
        else if (hoursSinceTrend < 24) score += 15;
        else if (hoursSinceTrend < 48) score += 10;

        // Classification confidence (10%)
        score += Math.round(
          (enriched.classificationConfidence || 0.5) * 10
        );

        const trendRecord = {
          title: enriched.title,
          type: `trending_${validation.type}s`,
          entityType: validation.entityType,
          referenceId: enriched.referenceId,
          referenceModel: enriched.referenceModel,
          slug: validation.slug,
          source: enriched.source,
          traffic: enriched.metadata?.traffic || 0,
          viewCount: enriched.metadata?.viewCount || 0,
          keywords: enriched.keywords || [],
          classificationConfidence: enriched.classificationConfidence || 0.5,
          status: "active",
          trendTimestamp: new Date(enriched.timestamp),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          metadata: enriched.metadata,
          score: Math.min(score, 100),
        };

        trendingRecords.push(trendRecord);
        console.log(
          `   ✅ Validated & enriched: "${enriched.title}" (Score: ${trendRecord.score})`
        );
        validated++;
      } catch (error) {
        console.log(
          `   ❌ Error processing "${rawTrend.title}": ${error.message}`
        );
        rejected++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`\n📝 Step 2: Processing Complete`);
    console.log(`   Processed: ${rawTrends.length}`);
    console.log(`   Validated: ${validated}`);
    console.log(`   Rejected: ${rejected}\n`);

    // Step 3: Save to database
    if (trendingRecords.length > 0) {
      console.log("💾 Step 3: Saving to database...");

      // Clear old trends
      await Trending.deleteMany({
        status: "expired",
      });

      // Upsert new trends (update if exists, insert if not)
      for (const record of trendingRecords) {
        await Trending.findOneAndUpdate(
          { title: record.title, source: record.source },
          record,
          { upsert: true, new: true }
        );
      }

      console.log(`   ✅ Saved ${trendingRecords.length} trends\n`);
    }

    console.log("=".repeat(70));
    console.log("✅ Enrichment Pipeline Complete!");
    console.log("=".repeat(70) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Pipeline error:", error.message);
    process.exit(1);
  }
}

enrichTrendingData();
