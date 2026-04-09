// // GET /api/trending/youtube-trends
// // Fetch ONLY YouTube trending data (no Google Trends)
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import { fetchYouTubeTrending } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

// /**
//  * Enrich validated trend with full database content
//  */
// async function enrichTrendData(trend, validation) {
//   try {
//     let enrichedData = {
//       ...trend,
//       referenceId: validation.referenceId,
//       referenceModel:
//         validation.type === "trending_movies"
//           ? "Article"
//           : validation.type === "trending_actors"
//           ? "Celebrity"
//           : null,
//     };

//     return enrichedData;
//   } catch (error) {
//     console.error("Enrichment error:", error.message);
//     return trend;
//   }
// }

// /**
//  * Calculate trend score based on multiple factors
//  */
// function calculateScore(trend) {
//   let score = 0;

//   // View count contribution (50% for YouTube since it's the main metric)
//   if (trend.viewCount > 10000000) score += 50;
//   else if (trend.viewCount > 5000000) score += 40;
//   else if (trend.viewCount > 1000000) score += 30;
//   else if (trend.viewCount > 500000) score += 20;
//   else if (trend.viewCount > 100000) score += 10;

//   // Recency contribution (30%)
//   const hoursSinceTrend =
//     (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
//   if (hoursSinceTrend < 6) score += 30;
//   else if (hoursSinceTrend < 24) score += 20;
//   else if (hoursSinceTrend < 48) score += 10;

//   // Classification confidence (20%)
//   score += Math.round((trend.classificationConfidence || 0.5) * 20);

//   return Math.min(score, 100);
// }

// export default async function handler(req, res) {
//   // Verify CRON secret for POST requests
//   if (req.method === "POST") {
//     const secret = req.headers["x-cron-secret"];
//     if (secret !== CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }
//   } else if (req.method !== "GET") {
//     return res.status(405).json({ success: false, message: "Method not allowed" });
//   }

//   try {
//     await dbConnect();

//     console.log("\n" + "=".repeat(70));
//     console.log("🎬 Starting YouTube Trends Sync Pipeline");
//     console.log("=".repeat(70));

//     // Step 1: Fetch ONLY YouTube data (3 categories)
//     console.log("\n📺 Step 1: Fetching YouTube trending data from 3 categories...");
//     const [ytFilmTrends, ytEntTrends, ytMovieTrends] = await Promise.all([
//       fetchYouTubeTrending("Film & Animation", "IN"),
//       fetchYouTubeTrending("Entertainment", "IN"),
//       fetchYouTubeTrending("Movies", "IN"),
//     ]);

//     const rawTrends = [...ytFilmTrends, ...ytEntTrends, ...ytMovieTrends];

//     // Remove duplicates
//     const uniqueTrends = Array.from(
//       new Map(rawTrends.map((t) => [t.title.toLowerCase(), t])).values()
//     );

//     console.log(
//       `   ✅ Fetched ${uniqueTrends.length} unique YouTube trends (Film: ${ytFilmTrends.length}, Entertainment: ${ytEntTrends.length}, Movies: ${ytMovieTrends.length})`
//     );

//     if (uniqueTrends.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No YouTube trends found",
//         stats: {
//           processed: 0,
//           validated: 0,
//           rejected: 0,
//           movies: 0,
//           actors: 0,
//           topics: 0,
//           source: "youtube",
//         },
//       });
//     }

//     // Step 2: Process and validate
//     console.log("\n🔍 Step 2: Processing, validating, and enriching...");
//     let validated = 0;
//     let rejected = 0;
//     let movies = 0;
//     let actors = 0;
//     let topics = 0;
//     const trendingRecords = [];
//     const validatedDetails = [];
//     const rejectedDetails = [];

//     for (const rawTrend of uniqueTrends) {
//       try {
//         // Preprocess
//         const preprocessed = await preprocessTrend(rawTrend);

//         // Validate
//         const validation = await validateTrend(preprocessed);

//         if (!validation.isValid) {
//           console.log(
//             `   ⏭️  Skipped: "${rawTrend.title.substring(0, 40)}..." (not in DB)`
//           );
//           rejectedDetails.push({
//             title: rawTrend.title,
//             reason: validation.reason || "Not found in database or not entertainment related"
//           });
//           rejected++;
//           continue;
//         }

//         // Enrich
//         const enriched = await enrichTrendData(preprocessed, validation);

//         // Calculate score
//         const score = calculateScore(enriched);

//         // Create record
//         const trendRecord = {
//           title: enriched.title,
//           type: validation.type,
//           entityType: validation.entityType,
//           referenceId: enriched.referenceId,
//           referenceModel: enriched.referenceModel,
//           slug: validation.slug,
//           source: "youtube", // Mark as YouTube
//           traffic: 0, // YouTube doesn't use traffic metric
//           viewCount: enriched.viewCount || 0,
//           keywords: enriched.keywords || [],
//           classificationConfidence: enriched.classificationConfidence || 0.5,
//           status: "active",
//           trendTimestamp: new Date(enriched.timestamp),
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//           metadata: enriched.metadata,
//           score: score,
//         };

//         trendingRecords.push(trendRecord);
//         validatedDetails.push({
//           title: enriched.title,
//           type: validation.type,
//           score: score
//         });

//         const typeLabel =
//           validation.type === "trending_movies"
//             ? "🎬"
//             : validation.type === "trending_actors"
//             ? "👤"
//             : "📊";
//         console.log(
//           `   ${typeLabel} Validated & enriched: "${enriched.title.substring(0, 30)}..." (Score: ${score}, Views: ${(enriched.viewCount / 1000000).toFixed(1)}M)`
//         );

//         validated++;
//         if (validation.type === "trending_movies") movies++;
//         else if (validation.type === "trending_actors") actors++;
//         else if (validation.type === "viral_topics") topics++;
//       } catch (error) {
//         console.log(
//           `   ❌ Error processing "${rawTrend.title.substring(0, 30)}...": ${error.message}`
//         );
//         rejectedDetails.push({
//           title: rawTrend.title,
//           reason: error.message
//         });
//         rejected++;
//       }

//       // Rate limiting
//       await new Promise((resolve) => setTimeout(resolve, 200));
//     }

//     console.log(`\n📝 Processing Complete`);
//     console.log(
//       `   Total processed: ${uniqueTrends.length}`
//     );
//     console.log(
//       `   Validated: ${validated} (${((validated / uniqueTrends.length) * 100).toFixed(1)}%)`
//     );
//     console.log(`   Rejected: ${rejected}`);
//     console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);

//     // Step 3: Save to database
//     if (trendingRecords.length > 0) {
//       console.log(`\n💾 Step 3: Saving to database...`);

//       // Delete expired YouTube trends
//       const expiredCount = await Trending.deleteMany({
//         source: "youtube",
//         expiresAt: { $lt: new Date() },
//       });
//       console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired YouTube trends`);

//       // Upsert new trends
//       for (const record of trendingRecords) {
//         await Trending.findOneAndUpdate(
//           { title: record.title, source: "youtube" },
//           record,
//           { upsert: true, returnDocument: 'after' }
//         );
//       }

//       console.log(`   ✅ Saved ${trendingRecords.length} YouTube trends to database`);
//     }

//     console.log("\n" + "=".repeat(70));
//     console.log("✅ YouTube Trends Sync Complete!");
//     console.log("=".repeat(70) + "\n");

//     return res.status(200).json({
//       success: true,
//       message: "YouTube trends synced successfully",
//       stats: {
//         processed: uniqueTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         topics,
//         saved: trendingRecords.length,
//         source: "youtube",
//       },
//       validatedData: validatedDetails,
//       rejectedData: rejectedDetails
//     });
//   } catch (error) {
//     console.error("❌ YouTube Trends Sync Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "YouTube trends sync failed",
//       error: error.message,
//       source: "youtube",
//     });
//   }
// }
// GET /api/trending/youtube-trends
// Fetch ONLY YouTube trending data (no Google Trends)

import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import { fetchYouTubeTrending } from "../../../lib/trending/data-ingestion";
import { preprocessTrend } from "../../../lib/trending/preprocessing";
import { validateTrend } from "../../../lib/trending/validation";
import axios from "axios";

const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/* ---------------- TMDB HELPERS (For enrichment only) ---------------- */

// Search Movie from TMDB for enrichment
async function searchMovieFromTMDB(query) {
  try {
    const res = await axios.get("https://api.themoviedb.org/3/search/movie", {
      params: {
        api_key: TMDB_API_KEY,
        query,
      },
    });
    return res.data.results?.[0] || null;
  } catch (err) {
    console.error("TMDB movie search error:", err.message);
    return null;
  }
}

// Search Actor from TMDB for enrichment
async function searchActorFromTMDB(query) {
  try {
    const res = await axios.get("https://api.themoviedb.org/3/search/person", {
      params: {
        api_key: TMDB_API_KEY,
        query,
      },
    });
    return res.data.results?.[0] || null;
  } catch (err) {
    console.error("TMDB actor search error:", err.message);
    return null;
  }
}

/* ---------------- ENRICHMENT (After local validation) ---------------- */

async function enrichWithTMDBData(trend, validation) {
  let enriched = { ...trend };

  try {
    // Only enrich if validation passed and we have a reference
    if (!validation.isValid) return enriched;

    if (validation.type === "trending_movies") {
      const movie = await searchMovieFromTMDB(validation.title || trend.title);
      if (movie) {
        enriched.poster = movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null;
        enriched.releaseDate = movie.release_date;
        enriched.overview = movie.overview;
        enriched.tmdbId = movie.id;
      }
    }

    if (validation.type === "trending_actors") {
      const actor = await searchActorFromTMDB(validation.title || trend.title);
      if (actor) {
        enriched.image = actor.profile_path
          ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
          : null;
        enriched.knownFor = actor.known_for?.map((m) => m.title || m.name) || [];
        enriched.tmdbId = actor.id;
      }
    }

    enriched.referenceId = validation.referenceId;
    enriched.referenceModel = validation.type === "trending_movies" ? "Article" : "Celebrity";
    enriched.localData = {
      title: validation.title,
      slug: validation.slug,
      metadata: validation.metadata
    };

    return enriched;
  } catch (error) {
    console.error("TMDB enrichment error:", error.message);
    return enriched;
  }
}

/**
 * Calculate trend score based on multiple factors for YouTube
 */
function calculateScore(trend) {
  let score = 0;

  // View count contribution (50% for YouTube since it's the main metric)
  if (trend.viewCount > 10000000) score += 50;
  else if (trend.viewCount > 5000000) score += 40;
  else if (trend.viewCount > 1000000) score += 30;
  else if (trend.viewCount > 500000) score += 20;
  else if (trend.viewCount > 100000) score += 10;
  else if (trend.viewCount > 50000) score += 5;

  // Recency contribution (30%)
  const hoursSinceTrend =
    (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
  if (hoursSinceTrend < 6) score += 30;
  else if (hoursSinceTrend < 24) score += 20;
  else if (hoursSinceTrend < 48) score += 10;
  else if (hoursSinceTrend < 72) score += 5;

  // Classification confidence (20%)
  score += Math.round((trend.classificationConfidence || 0.5) * 20);

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
    console.log("🎬 Starting YouTube Trends Sync Pipeline");
    console.log("=".repeat(70));

    // Step 1: Fetch ONLY YouTube data (3 categories)
    console.log("\n📺 Step 1: Fetching YouTube trending data from 3 categories...");
    const [ytFilmTrends, ytEntTrends, ytMovieTrends] = await Promise.all([
      fetchYouTubeTrending("Film & Animation", "IN"),
      fetchYouTubeTrending("Entertainment", "IN"),
      fetchYouTubeTrending("Movies", "IN"),
    ]);

    const rawTrends = [...ytFilmTrends, ...ytEntTrends, ...ytMovieTrends];

    // Remove duplicates
    const uniqueTrends = Array.from(
      new Map(rawTrends.map((t) => [t.title.toLowerCase(), t])).values()
    );

    console.log(
      `   ✅ Fetched ${uniqueTrends.length} unique YouTube trends (Film: ${ytFilmTrends.length}, Entertainment: ${ytEntTrends.length}, Movies: ${ytMovieTrends.length})`
    );

    if (uniqueTrends.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No YouTube trends found",
        stats: {
          processed: 0,
          validated: 0,
          rejected: 0,
          movies: 0,
          actors: 0,
          topics: 0,
          source: "youtube",
        },
      });
    }

    // Step 2: Process and validate against LOCAL DATABASE
    console.log("\n🔍 Step 2: Validating against local database...");
    let validated = 0;
    let rejected = 0;
    let movies = 0;
    let actors = 0;
    let topics = 0;
    const trendingRecords = [];
    const validatedDetails = [];
    const rejectedDetails = [];

    for (const rawTrend of uniqueTrends) {
      try {
        // Preprocess
        const preprocessed = await preprocessTrend(rawTrend);
        
        // CRITICAL: Validate against LOCAL database (Articles & Celebrities)
        const validation = await validateTrend(preprocessed);
        
        console.log(`   Processing: "${preprocessed.title.substring(0, 50)}..."`);
        
        // If not found in local database, reject
        if (!validation.isValid) {
          console.log(`      ❌ REJECTED: Not found in database`);
          rejectedDetails.push({
            title: preprocessed.title,
            reason: validation.reason || "Not found in Articles or Celebrities database",
            views: preprocessed.viewCount
          });
          rejected++;
          continue;
        }

        // Found in local database! Now enrich with TMDB data
        console.log(`      ✅ VALIDATED: ${validation.type === "trending_movies" ? "🎬 Movie" : "👤 Celebrity"} - "${validation.title}"`);
        
        // Enrich with TMDB data
        const enriched = await enrichWithTMDBData(preprocessed, validation);

        // Calculate score
        const score = calculateScore(enriched);

        // Create record
        const trendRecord = {
          title: validation.title, // Use the matched title from DB
          originalTitle: preprocessed.title, // Store original for reference
          type: validation.type,
          entityType: validation.entityType,
          referenceId: validation.referenceId,
          referenceModel: validation.referenceModel,
          slug: validation.slug,
          source: "youtube", // Mark as YouTube
          traffic: 0, // YouTube doesn't use traffic metric
          viewCount: preprocessed.viewCount || 0,
          keywords: preprocessed.keywords || [],
          classificationConfidence: preprocessed.classificationConfidence || 0.5,
          status: "active",
          trendTimestamp: new Date(preprocessed.timestamp || Date.now()),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          metadata: {
            ...enriched,
            localMetadata: validation.metadata,
            videoId: preprocessed.videoId,
            channelTitle: preprocessed.channelTitle,
            categoryId: preprocessed.categoryId
          },
          score: score,
        };

        trendingRecords.push(trendRecord);
        
        // Track for response
        validatedDetails.push({
          title: validation.title,
          originalTitle: preprocessed.title,
          type: validation.type,
          score: score,
          views: preprocessed.viewCount,
          viewsFormatted: formatViews(preprocessed.viewCount),
          image: enriched.poster || enriched.image || validation.metadata?.thumbnail || validation.metadata?.coverImage || null,
          localMatch: true
        });

        validated++;
        
        if (validation.type === "trending_movies") {
          movies++;
          console.log(`      🎬 Movie match: "${validation.title}" (Score: ${score}, Views: ${formatViews(preprocessed.viewCount)})`);
        } else if (validation.type === "trending_actors") {
          actors++;
          console.log(`      👤 Celebrity match: "${validation.title}" (Score: ${score}, Views: ${formatViews(preprocessed.viewCount)})`);
        } else if (validation.type === "viral_topics") {
          topics++;
          console.log(`      📊 Topic match: "${validation.title}" (Score: ${score})`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing "${rawTrend.title.substring(0, 30)}...": ${error.message}`);
        rejectedDetails.push({
          title: rawTrend.title,
          reason: error.message,
          views: rawTrend.viewCount
        });
        rejected++;
      }

      // Rate limiting to avoid overwhelming APIs
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`\n📝 Processing Complete`);
    console.log(`   Total processed: ${uniqueTrends.length}`);
    console.log(`   Validated: ${validated} (${((validated / uniqueTrends.length) * 100).toFixed(1)}%)`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);

    // Step 3: Save to database
    if (trendingRecords.length > 0) {
      console.log(`\n💾 Step 3: Saving to database...`);

      // Delete expired YouTube trends
      const expiredCount = await Trending.deleteMany({
        source: "youtube",
        expiresAt: { $lt: new Date() },
      });
      console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired YouTube trends`);

      // Upsert new trends
      let saved = 0;
      for (const record of trendingRecords) {
        await Trending.findOneAndUpdate(
          { 
            title: record.title, 
            source: "youtube",
            type: record.type 
          },
          record,
          { upsert: true, returnDocument: 'after' }
        );
        saved++;
      }

      console.log(`   ✅ Saved ${saved} YouTube trends to database`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ YouTube Trends Sync Complete!");
    console.log("=".repeat(70) + "\n");

    return res.status(200).json({
      success: true,
      message: "YouTube trends synced successfully",
      stats: {
        processed: uniqueTrends.length,
        validated,
        rejected,
        movies,
        actors,
        topics,
        saved: trendingRecords.length,
        source: "youtube",
      },
      validatedData: validatedDetails,
      rejectedData: rejectedDetails.length > 0 ? rejectedDetails : undefined
    });
    
  } catch (error) {
    console.error("❌ YouTube Trends Sync Error:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: "YouTube trends sync failed",
      error: error.message,
      source: "youtube",
    });
  }
}

// Helper function to format view counts
function formatViews(views) {
  if (!views) return "0";
  if (views >= 10000000) return `${(views / 10000000).toFixed(1)}Cr`;
  if (views >= 10000000) return `${(views / 10000000).toFixed(1)}Cr`;
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}