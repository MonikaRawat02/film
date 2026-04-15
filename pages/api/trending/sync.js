// POST /api/trending/sync
// Fetches trends from all sources, validates against database, enriches, and stores
import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";
import { fetchAllTrends } from "../../../lib/trending/data-ingestion";
import { preprocessTrend } from "../../../lib/trending/preprocessing";
import { validateTrend } from "../../../lib/trending/validation";

const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

/**
 * Enrich validated trend with TMDB or local database content
 */
async function enrichTrendData(trend, validation) {
  try {
    let enrichedData = {
      ...trend,
      title: validation.title, // Use original keyword preserved in validation
      referenceId: validation.referenceId,
      referenceModel: validation.type === "trending_movies" ? "Article" : validation.type === "trending_actors" ? "Celebrity" : null,
      metadata: trend.metadata || {}
    };

    // 1. Enrich from TMDB Data (if available from validation)
    if (validation.tmdbData) {
      const tmdb = validation.tmdbData;
      if (validation.type === "trending_movies") {
        enrichedData.metadata = {
          ...enrichedData.metadata,
          movieTitle: tmdb.title,
          releaseDate: tmdb.releaseDate,
          overview: tmdb.overview,
          rating: tmdb.rating,
          coverImage: tmdb.image,
          tmdbPopularity: tmdb.popularity
        };
      } else if (validation.type === "trending_actors") {
        enrichedData.metadata = {
          ...enrichedData.metadata,
          actorName: tmdb.title,
          knownFor: tmdb.knownFor?.join(", "),
          profileImage: tmdb.image,
          tmdbPopularity: tmdb.popularity
        };
      }
    }

    // 2. Further enrich from Local Database if it exists
    if (validation.isLocal && validation.referenceId) {
      if (validation.type === "trending_movies") {
        const movie = await Article.findById(validation.referenceId).select(
          "movieTitle slug coverImage releaseYear director genres stats"
        );
        if (movie) {
          enrichedData.metadata = {
            ...enrichedData.metadata,
            localSlug: movie.slug,
            localTitle: movie.movieTitle,
            director: movie.director?.[0] || "N/A",
            genres: movie.genres?.join(", ") || "N/A",
            boxOffice: movie.stats?.worldwide || "N/A",
          };
          // Prefer local image if available
          if (movie.coverImage) enrichedData.metadata.coverImage = movie.coverImage;
        }
      } else if (validation.type === "trending_actors") {
        const celebrity = await Celebrity.findById(validation.referenceId).select(
          "heroSection.name heroSection.industry heroSection.profileImage quickFacts.age netWorth"
        );
        if (celebrity) {
          enrichedData.metadata = {
            ...enrichedData.metadata,
            localSlug: celebrity.heroSection?.slug,
            localName: celebrity.heroSection?.name,
            industry: celebrity.heroSection?.industry,
            age: celebrity.quickFacts?.age,
            netWorth: celebrity.netWorth?.netWorthUSD?.display,
          };
          // Prefer local image if available
          if (celebrity.heroSection?.profileImage) enrichedData.metadata.profileImage = celebrity.heroSection.profileImage;
        }
      }
    }

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

  // Traffic contribution (40%)
  if (trend.traffic > 1000000) score += 40;
  else if (trend.traffic > 500000) score += 30;
  else if (trend.traffic > 100000) score += 20;
  else if (trend.traffic > 50000) score += 10;

  // View count contribution (30%)
  if (trend.viewCount > 10000000) score += 30;
  else if (trend.viewCount > 5000000) score += 20;
  else if (trend.viewCount > 1000000) score += 10;
  else if (trend.viewCount > 500000) score += 5;

  // Recency contribution (20%)
  const hoursSinceTrend =
    (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
  if (hoursSinceTrend < 6) score += 20;
  else if (hoursSinceTrend < 24) score += 15;
  else if (hoursSinceTrend < 48) score += 10;
  else if (hoursSinceTrend < 72) score += 5;

  // Classification confidence (10%)
  score += Math.round((trend.classificationConfidence || 0.5) * 10);

  // TMDB Popularity Boost (Max 10%)
  if (trend.metadata?.tmdbPopularity) {
    const pop = trend.metadata.tmdbPopularity;
    if (pop > 100) score += 10;
    else if (pop > 50) score += 7;
    else if (pop > 20) score += 5;
    else if (pop > 5) score += 2;
  }

  return Math.min(score, 100);
}

export default async function handler(req, res) {
  const { region = "IN" } = req.query;

  // Verify CRON secret
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
    console.log(`🚀 Starting Trend Sync & Enrichment Pipeline for Region: ${region.toUpperCase()}`);
    console.log("=".repeat(70));

    // Step 1: Fetch raw trends from all sources
    console.log(`\n📊 Step 1: Fetching trends from Google & YouTube for ${region.toUpperCase()}...`);
    const rawTrends = await fetchAllTrends(region.toUpperCase());
    console.log(`   ✅ Fetched ${rawTrends.length} raw trends`);

    if (rawTrends.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No trends found for ${region.toUpperCase()}`,
        stats: { processed: 0, validated: 0, rejected: 0, movies: 0, actors: 0, topics: 0 },
        region: region.toUpperCase()
      });
    }

    // Step 2: Process and validate in parallel batches
    console.log("\n🔍 Step 2: Processing, validating, and enriching...");
    let validated = 0;
    let rejected = 0;
    let movies = 0;
    let actors = 0;
    let topics = 0;
    const trendingRecords = [];
    const validatedDetails = [];
    const rejectedDetails = [];

    // Process in parallel batches of 5 to avoid overwhelming APIs/DB
    const BATCH_SIZE = 5;
    for (let i = 0; i < rawTrends.length; i += BATCH_SIZE) {
      const batch = rawTrends.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(async (rawTrend) => {
        try {
          // Preprocess
          const preprocessed = await preprocessTrend(rawTrend);

          // Validate
          const validation = await validateTrend(preprocessed);

          if (!validation.isValid) {
            return { success: false, title: rawTrend.title, reason: validation.reason || "Not found" };
          }

          // Enrich with database content
          const enriched = await enrichTrendData(preprocessed, validation);

          // Calculate score
          const score = calculateScore(enriched);

          // Create record for database
          const trendRecord = {
            title: validation.title,
            originalTitle: preprocessed.title,
            type: validation.type,
            entityType: validation.entityType,
            referenceId: validation.referenceId,
            referenceModel: validation.referenceModel,
            slug: validation.slug,
            source: preprocessed.source || "manual",
            traffic: preprocessed.traffic || 0,
            viewCount: preprocessed.viewCount || 0,
            keywords: preprocessed.keywords || [],
            classificationConfidence: preprocessed.classificationConfidence || 0.5,
            status: "active",
            region: region.toUpperCase(), // Store region
            trendTimestamp: new Date(preprocessed.timestamp || Date.now()),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            metadata: enriched.metadata,
            score: score,
          };

          return { success: true, record: trendRecord, validation, enriched, score };
        } catch (error) {
          console.error(`   ❌ Error processing "${rawTrend.title.substring(0, 30)}...": ${error.message}`);
          return { success: false, title: rawTrend.title, reason: error.message };
        }
      }));

      // Handle batch results
      for (const res of results) {
        if (res.success) {
          trendingRecords.push(res.record);
          validatedDetails.push({ title: res.record.title, type: res.record.type, score: res.score, region: region.toUpperCase() });
          validated++;
          if (res.record.type === "trending_movies") movies++;
          else if (res.record.type === "trending_actors") actors++;
          else if (res.record.type === "viral_topics") topics++;
        } else {
          rejectedDetails.push({ title: res.title, reason: res.reason });
          rejected++;
        }
      }

      // Small delay between batches
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\n📝 Processing Complete`);
    console.log(`   Total processed: ${rawTrends.length}`);
    console.log(`   Validated: ${validated} (${((validated / rawTrends.length) * 100).toFixed(1)}%)`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);

    // Step 3: Save to database
    if (trendingRecords.length > 0) {
      console.log(`\n💾 Step 3: Saving to database...`);

      // Delete expired trends for this region
      const expiredCount = await Trending.deleteMany({
        region: region.toUpperCase(),
        expiresAt: { $lt: new Date() },
      });
      console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired trends for ${region.toUpperCase()}`);

      // Upsert new trends
      let saved = 0;
      for (const record of trendingRecords) {
        await Trending.findOneAndUpdate(
          { 
            title: record.title, 
            source: record.source,
            type: record.type,
            region: record.region // Add region to uniqueness check
          },
          record,
          { upsert: true, returnDocument: 'after' }
        );
        saved++;
      }

      console.log(`   ✅ Saved ${saved} trends to database for ${region.toUpperCase()}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log(`✅ Trend Sync Complete for ${region.toUpperCase()}!`);
    console.log("=".repeat(70) + "\n");

    return res.status(200).json({
      success: true,
      message: `Trend sync completed for ${region.toUpperCase()}`,
      stats: {
        processed: rawTrends.length,
        validated,
        rejected,
        movies,
        actors,
        topics,
        saved: trendingRecords.length,
        region: region.toUpperCase()
      },
      validatedData: validatedDetails,
      rejectedData: rejectedDetails.length > 0 ? rejectedDetails : undefined
    });
  } catch (error) {
    console.error("❌ Sync Pipeline Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Sync failed",
      error: error.message
    });
  }
}
