// // GET /api/trending/youtube-trends
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import { fetchYouTubeTrending } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";
// import axios from "axios";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";
// const TMDB_API_KEY = process.env.TMDB_API_KEY;

// /* ---------------- TMDB HELPERS (For enrichment only) ---------------- */

// // Search Movie from TMDB for enrichment
// async function searchMovieFromTMDB(query) {
//   try {
//     const res = await axios.get("https://api.themoviedb.org/3/search/movie", {
//       params: {
//         api_key: TMDB_API_KEY,
//         query,
//       },
//     });
//     return res.data.results?.[0] || null;
//   } catch (err) {
//     console.error("TMDB movie search error:", err.message);
//     return null;
//   }
// }

// // Search Actor from TMDB for enrichment
// async function searchActorFromTMDB(query) {
//   try {
//     const res = await axios.get("https://api.themoviedb.org/3/search/person", {
//       params: {
//         api_key: TMDB_API_KEY,
//         query,
//       },
//     });
//     return res.data.results?.[0] || null;
//   } catch (err) {
//     console.error("TMDB actor search error:", err.message);
//     return null;
//   }
// }

// /* ---------------- ENRICHMENT (After local validation) ---------------- */

// async function enrichWithTMDBData(trend, validation) {
//   let enriched = { ...trend };

//   try {
//     // Only enrich if validation passed and we have a reference
//     if (!validation.isValid) return enriched;

//     if (validation.type === "trending_movies") {
//       const movie = await searchMovieFromTMDB(validation.title || trend.title);
//       if (movie) {
//         enriched.poster = movie.poster_path
//           ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//           : null;
//         enriched.releaseDate = movie.release_date;
//         enriched.overview = movie.overview;
//         enriched.tmdbId = movie.id;
//       }
//     }

//     if (validation.type === "trending_actors") {
//       const actor = await searchActorFromTMDB(validation.title || trend.title);
//       if (actor) {
//         enriched.image = actor.profile_path
//           ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
//           : null;
//         enriched.knownFor = actor.known_for?.map((m) => m.title || m.name) || [];
//         enriched.tmdbId = actor.id;
//       }
//     }

//     enriched.referenceId = validation.referenceId;
//     enriched.referenceModel = validation.type === "trending_movies" ? "Article" : "Celebrity";
//     enriched.localData = {
//       title: validation.title,
//       slug: validation.slug,
//       metadata: validation.metadata
//     };

//     return enriched;
//   } catch (error) {
//     console.error("TMDB enrichment error:", error.message);
//     return enriched;
//   }
// }

// /**
//  * Calculate trend score based on multiple factors for YouTube
//  */
// function calculateScore(trend) {
//   let score = 0;

//   // View count contribution (50% for YouTube since it's the main metric)
//   if (trend.viewCount > 10000000) score += 50;
//   else if (trend.viewCount > 5000000) score += 40;
//   else if (trend.viewCount > 1000000) score += 30;
//   else if (trend.viewCount > 500000) score += 20;
//   else if (trend.viewCount > 100000) score += 10;
//   else if (trend.viewCount > 50000) score += 5;

//   // Recency contribution (30%)
//   const hoursSinceTrend =
//     (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
//   if (hoursSinceTrend < 6) score += 30;
//   else if (hoursSinceTrend < 24) score += 20;
//   else if (hoursSinceTrend < 48) score += 10;
//   else if (hoursSinceTrend < 72) score += 5;

//   // Classification confidence (20%)
//   score += Math.round((trend.classificationConfidence || 0.5) * 20);

//   return Math.min(score, 100);
// }

// export default async function handler(req, res) {
//   const { region = "IN" } = req.query;

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
//     console.log(`🎬 Starting YouTube Trends Sync Pipeline for Region: ${region.toUpperCase()}`);
//     console.log("=".repeat(70));

//     // Step 1: Fetch ONLY YouTube data (3 categories)
//     console.log(`\n📺 Step 1: Fetching YouTube trending data from 3 categories for ${region.toUpperCase()}...`);
//     const [ytFilmTrends, ytEntTrends, ytMovieTrends] = await Promise.all([
//       fetchYouTubeTrending("Film & Animation", region.toUpperCase()),
//       fetchYouTubeTrending("Entertainment", region.toUpperCase()),
//       fetchYouTubeTrending("Movies", region.toUpperCase()),
//     ]);

//     const rawTrends = [...ytFilmTrends, ...ytEntTrends, ...ytMovieTrends];

//     // Remove duplicates
//     const uniqueTrends = Array.from(
//       new Map(rawTrends.map((t) => [t.title.toLowerCase(), t])).values()
//     );

//     console.log(
//       `   ✅ Fetched ${uniqueTrends.length} unique YouTube trends for ${region.toUpperCase()} (Film: ${ytFilmTrends.length}, Entertainment: ${ytEntTrends.length}, Movies: ${ytMovieTrends.length})`
//     );

//     if (uniqueTrends.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: `No YouTube trends found for ${region.toUpperCase()}`,
//         stats: {
//           processed: 0,
//           validated: 0,
//           rejected: 0,
//           movies: 0,
//           actors: 0,
//           topics: 0,
//           source: "youtube",
//           region: region.toUpperCase()
//         },
//         validatedData: [],
//         rejectedData: []
//       });
//     }

//     // Step 2: Process and validate against LOCAL DATABASE
//     console.log("\n🔍 Step 2: Validating against local database...");
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
        
//         // CRITICAL: Validate against LOCAL database (Articles & Celebrities)
//         const validation = await validateTrend(preprocessed);
        
//         console.log(`   Processing: "${preprocessed.title.substring(0, 50)}..."`);
        
//         // If not found in local database, reject
//         if (!validation.isValid) {
//           console.log(`      ❌ REJECTED: Not found in database`);
//           rejectedDetails.push({
//             title: preprocessed.title,
//             reason: validation.reason || "Not found in Articles or Celebrities database",
//             views: preprocessed.viewCount
//           });
//           rejected++;
//           continue;
//         }

//         // Found in local database! Now enrich with TMDB data
//         console.log(`      ✅ VALIDATED: ${validation.type === "trending_movies" ? "🎬 Movie" : "👤 Celebrity"} - "${validation.title}"`);
        
//         // Enrich with TMDB data
//         const enriched = await enrichWithTMDBData(preprocessed, validation);

//         // Calculate score
//         const score = calculateScore(enriched);

//         // Create record
//         const trendRecord = {
//           title: validation.title, // Use the matched title from DB
//           originalTitle: preprocessed.title, // Store original for reference
//           type: validation.type,
//           entityType: validation.entityType,
//           referenceId: validation.referenceId,
//           referenceModel: validation.referenceModel,
//           slug: validation.slug,
//           source: "youtube", // Mark as YouTube
//           traffic: 0, // YouTube doesn't use traffic metric
//           viewCount: preprocessed.viewCount || 0,
//           keywords: preprocessed.keywords || [],
//           classificationConfidence: preprocessed.classificationConfidence || 0.5,
//           status: "active",
//           region: region.toUpperCase(), // Store region
//           trendTimestamp: new Date(preprocessed.timestamp || Date.now()),
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//           metadata: {
//             ...enriched,
//             localMetadata: validation.metadata,
//             videoId: preprocessed.videoId,
//             channelTitle: preprocessed.channelTitle,
//             categoryId: preprocessed.categoryId
//           },
//           score: score,
//         };

//         trendingRecords.push(trendRecord);
        
//         // Track for response
//         validatedDetails.push({
//           title: validation.title,
//           originalTitle: preprocessed.title,
//           type: validation.type,
//           score: score,
//           views: preprocessed.viewCount,
//           viewsFormatted: formatViews(preprocessed.viewCount),
//           image: enriched.poster || enriched.image || validation.metadata?.thumbnail || validation.metadata?.coverImage || null,
//           slug: validation.slug,
//           referenceId: validation.referenceId,
//           localMatch: true,
//           region: region.toUpperCase()
//         });

//         validated++;
        
//         if (validation.type === "trending_movies") {
//           movies++;
//           console.log(`      🎬 Movie match: "${validation.title}" (Score: ${score}, Views: ${formatViews(preprocessed.viewCount)})`);
//         } else if (validation.type === "trending_actors") {
//           actors++;
//           console.log(`      👤 Celebrity match: "${validation.title}" (Score: ${score}, Views: ${formatViews(preprocessed.viewCount)})`);
//         } else if (validation.type === "viral_topics") {
//           topics++;
//           console.log(`      📊 Topic match: "${validation.title}" (Score: ${score})`);
//         }
        
//       } catch (error) {
//         console.log(`   ❌ Error processing "${rawTrend.title.substring(0, 30)}...": ${error.message}`);
//         rejectedDetails.push({
//           title: rawTrend.title,
//           reason: error.message,
//           views: rawTrend.viewCount
//         });
//         rejected++;
//       }

//       // Rate limiting to avoid overwhelming APIs
//       await new Promise((resolve) => setTimeout(resolve, 200));
//     }

//     console.log(`\n📝 Processing Complete`);
//     console.log(`   Total processed: ${uniqueTrends.length}`);
//     console.log(`   Validated: ${validated} (${((validated / uniqueTrends.length) * 100).toFixed(1)}%)`);
//     console.log(`   Rejected: ${rejected}`);
//     console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);

//     // Step 3: Save to database
//     if (trendingRecords.length > 0) {
//       console.log(`\n💾 Step 3: Saving to database...`);

//       // Delete expired YouTube trends for this region
//       const expiredCount = await Trending.deleteMany({
//         source: "youtube",
//         region: region.toUpperCase(),
//         expiresAt: { $lt: new Date() },
//       });
//       console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired YouTube trends for ${region.toUpperCase()}`);

//       // Upsert new trends
//       let saved = 0;
//       for (const record of trendingRecords) {
//         await Trending.findOneAndUpdate(
//           { 
//             title: record.title, 
//             source: "youtube",
//             type: record.type,
//             region: record.region // Add region to uniqueness check
//           },
//           record,
//           { upsert: true, returnDocument: 'after' }
//         );
//         saved++;
//       }

//       console.log(`   ✅ Saved ${saved} YouTube trends to database for ${region.toUpperCase()}`);
//     }

//     console.log("\n" + "=".repeat(70));
//     console.log(`✅ YouTube Trends Sync Complete for ${region.toUpperCase()}!`);
//     console.log("=".repeat(70) + "\n");

//     return res.status(200).json({
//       success: true,
//       message: `YouTube trends synced successfully for ${region.toUpperCase()}`,
//       stats: {
//         processed: uniqueTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         topics,
//         saved: trendingRecords.length,
//         source: "youtube",
//         region: region.toUpperCase()
//       },
//       validatedData: validatedDetails,
//       rejectedData: rejectedDetails.length > 0 ? rejectedDetails : undefined
//     });
    
//   } catch (error) {
//     console.error("❌ YouTube Trends Sync Error:", error.message);
//     console.error(error.stack);
//     return res.status(500).json({
//       success: false,
//       message: "YouTube trends sync failed",
//       error: error.message,
//       source: "youtube",
//     });
//   }
// }

// // Helper function to format view counts
// function formatViews(views) {
//   if (!views) return "0";
//   if (views >= 10000000) return `${(views / 10000000).toFixed(1)}Cr`;
//   if (views >= 10000000) return `${(views / 10000000).toFixed(1)}Cr`;
//   if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
//   if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
//   return views.toString();
// }


// // FAST VERSION - /api/trending/youtube-trends
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import { fetchYouTubeTrending } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";
// import axios from "axios";

// const CRON_SECRET =
//   process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

// const TMDB_API_KEY = process.env.TMDB_API_KEY;

// /* =========================================================
//    CONFIG
// ========================================================= */

// const BATCH_SIZE = 5; // parallel workers
// const CACHE = new Map();

// /* =========================================================
//    TMDB FAST CACHE
// ========================================================= */

// async function searchTMDB(type, query) {
//   const key = `${type}_${query.toLowerCase()}`;

//   if (CACHE.has(key)) return CACHE.get(key);

//   try {
//     const url =
//       type === "movie"
//         ? "https://api.themoviedb.org/3/search/movie"
//         : "https://api.themoviedb.org/3/search/person";

//     const res = await axios.get(url, {
//       params: {
//         api_key: TMDB_API_KEY,
//         query,
//       },
//       timeout: 5000,
//     });

//     const result = res.data.results?.[0] || null;

//     CACHE.set(key, result);

//     return result;
//   } catch (error) {
//     return null;
//   }
// }

// /* =========================================================
//    SCORE
// ========================================================= */

// function calculateScore(trend) {
//   let score = 0;

//   const views = trend.viewCount || 0;

//   if (views > 10000000) score += 50;
//   else if (views > 5000000) score += 40;
//   else if (views > 1000000) score += 30;
//   else if (views > 500000) score += 20;
//   else if (views > 100000) score += 10;

//   const hrs =
//     (Date.now() - new Date(trend.timestamp).getTime()) /
//     (1000 * 60 * 60);

//   if (hrs < 6) score += 30;
//   else if (hrs < 24) score += 20;
//   else if (hrs < 48) score += 10;

//   score += Math.round((trend.classificationConfidence || 0.5) * 20);

//   return Math.min(score, 100);
// }

// /* =========================================================
//    SINGLE TREND PROCESSOR
// ========================================================= */

// async function processTrend(rawTrend, region) {
//   try {
//     const pre = await preprocessTrend(rawTrend);

//     const validation = await validateTrend(pre);

//     if (!validation.isValid) return null;

//     let enriched = {};

//     /* ---------- TMDB ENRICH ---------- */

//     if (validation.type === "trending_movies") {
//       const movie = await searchTMDB(
//         "movie",
//         validation.title || pre.title
//       );

//       if (movie) {
//         enriched.poster = movie.poster_path
//           ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//           : null;

//         enriched.tmdbId = movie.id;
//         enriched.overview = movie.overview;
//       }
//     }

//     if (validation.type === "trending_actors") {
//       const actor = await searchTMDB(
//         "person",
//         validation.title || pre.title
//       );

//       if (actor) {
//         enriched.image = actor.profile_path
//           ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
//           : null;

//         enriched.tmdbId = actor.id;
//       }
//     }

//     const score = calculateScore(pre);

//     return {
//       updateOne: {
//         filter: {
//           title: validation.title,
//           source: "youtube",
//           region,
//           type: validation.type,
//         },
//         update: {
//           $set: {
//             title: validation.title,
//             originalTitle: pre.title,
//             source: "youtube",
//             type: validation.type,
//             slug: validation.slug,
//             score,
//             region,
//             status: "active",
//             trendTimestamp: new Date(
//               pre.timestamp || Date.now()
//             ),
//             expiresAt: new Date(
//               Date.now() + 7 * 24 * 60 * 60 * 1000
//             ),
//             viewCount: pre.viewCount || 0,
//             metadata: {
//               ...enriched,
//               videoId: pre.videoId,
//               channelTitle: pre.channelTitle,
//             },
//           },
//         },
//         upsert: true,
//       },
//     };
//   } catch (error) {
//     return null;
//   }
// }

// /* =========================================================
//    PARALLEL BATCH RUNNER
// ========================================================= */

// async function processInBatches(items, batchSize, handler) {
//   const results = [];

//   for (let i = 0; i < items.length; i += batchSize) {
//     const batch = items.slice(i, i + batchSize);

//     const res = await Promise.all(
//       batch.map((item) => handler(item))
//     );

//     results.push(...res);
//   }

//   return results;
// }

// /* =========================================================
//    API
// ========================================================= */

// export default async function handler(req, res) {
//   const { region = "IN" } = req.query;

//   /* ---------------------------------
//      GET = FAST READ ONLY
//   --------------------------------- */

//   if (req.method === "GET") {
//     await dbConnect();

//     const data = await Trending.find({
//       source: "youtube",
//       region,
//       expiresAt: { $gt: new Date() },
//     })
//       .sort({ score: -1 })
//       .limit(50)
//       .lean();

//     return res.status(200).json({
//       success: true,
//       source: "youtube",
//       region,
//       cached: true,
//       count: data.length,
//       data,
//     });
//   }

//   /* ---------------------------------
//      POST = CRON REFRESH
//   --------------------------------- */

//   if (req.method === "POST") {
//     const secret = req.headers["x-cron-secret"];

//     if (secret !== CRON_SECRET) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     try {
//       await dbConnect();

//       console.time("TOTAL");

//       /* STEP 1 FETCH */

//       const [film, ent, movie] = await Promise.all([
//         fetchYouTubeTrending("Film & Animation", region),
//         fetchYouTubeTrending("Entertainment", region),
//         fetchYouTubeTrending("Movies", region),
//       ]);

//       const raw = [...film, ...ent, ...movie];

//       const unique = Array.from(
//         new Map(raw.map((x) => [x.title.toLowerCase(), x]))
//           .values()
//       );

//       /* STEP 2 PROCESS FAST */

//       const ops = await processInBatches(
//         unique,
//         BATCH_SIZE,
//         (item) => processTrend(item, region)
//       );

//       const finalOps = ops.filter(Boolean);

//       /* STEP 3 DELETE OLD */

//       await Trending.deleteMany({
//         source: "youtube",
//         region,
//         expiresAt: { $lt: new Date() },
//       });

//       /* STEP 4 BULK WRITE */

//       if (finalOps.length > 0) {
//         await Trending.bulkWrite(finalOps);
//       }

//       console.timeEnd("TOTAL");

//       return res.status(200).json({
//         success: true,
//         message: "YouTube trends synced",
//         processed: unique.length,
//         saved: finalOps.length,
//         region,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   return res.status(405).json({
//     success: false,
//     message: "Method not allowed",
//   });
// }


// /api/trending/youtube-trends
// REDIS ULTRA FAST VERSION

import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import { fetchYouTubeTrending } from "../../../lib/trending/data-ingestion";
import { preprocessTrend } from "../../../lib/trending/preprocessing";
import { validateTrend } from "../../../lib/trending/validation";
import redis, { cacheManager } from "../../../lib/redis";
import axios from "axios";

const CRON_SECRET =
  process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const BATCH_SIZE = 5;
const MEMORY_CACHE = new Map();

/* =====================================================
   REDIS CONFIG
===================================================== */

const REDIS_TTL = 900; // 15 min

function getRedisKey(region) {
  return `youtube_trends:${region.toUpperCase()}`;
}

/* =====================================================
   TMDB CACHE
===================================================== */

async function searchTMDB(type, query) {
  const key = `${type}_${query.toLowerCase()}`;

  if (MEMORY_CACHE.has(key)) {
    return MEMORY_CACHE.get(key);
  }

  try {
    const url =
      type === "movie"
        ? "https://api.themoviedb.org/3/search/movie"
        : "https://api.themoviedb.org/3/search/person";

    const res = await axios.get(url, {
      params: {
        api_key: TMDB_API_KEY,
        query,
      },
      timeout: 5000,
    });

    const result = res.data.results?.[0] || null;

    MEMORY_CACHE.set(key, result);

    return result;
  } catch (error) {
    return null;
  }
}

/* =====================================================
   SCORE
===================================================== */

function calculateScore(trend) {
  let score = 0;

  const views = trend.viewCount || 0;

  if (views > 10000000) score += 50;
  else if (views > 5000000) score += 40;
  else if (views > 1000000) score += 30;
  else if (views > 500000) score += 20;
  else if (views > 100000) score += 10;

  const hrs =
    (Date.now() - new Date(trend.timestamp).getTime()) /
    (1000 * 60 * 60);

  if (hrs < 6) score += 30;
  else if (hrs < 24) score += 20;
  else if (hrs < 48) score += 10;

  score += Math.round((trend.classificationConfidence || 0.5) * 20);

  return Math.min(score, 100);
}

/* =====================================================
   PROCESS SINGLE TREND
===================================================== */

async function processTrend(rawTrend, region) {
  try {
    const pre = await preprocessTrend(rawTrend);
    const validation = await validateTrend(pre);

    if (!validation.isValid) return null;

    let enriched = {};

    if (validation.type === "trending_movies") {
      const movie = await searchTMDB(
        "movie",
        validation.title || pre.title
      );

      if (movie) {
        enriched.poster = movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null;

        enriched.tmdbId = movie.id;
      }
    }

    if (validation.type === "trending_actors") {
      const actor = await searchTMDB(
        "person",
        validation.title || pre.title
      );

      if (actor) {
        enriched.image = actor.profile_path
          ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
          : null;

        enriched.tmdbId = actor.id;
      }
    }

    const score = calculateScore(pre);

    return {
      updateOne: {
        filter: {
          title: validation.title,
          source: "youtube",
          region,
          type: validation.type,
        },
        update: {
          $set: {
            title: validation.title,
            originalTitle: pre.title,
            source: "youtube",
            type: validation.type,
            slug: validation.slug,
            score,
            region,
            status: "active",
            trendTimestamp: new Date(
              pre.timestamp || Date.now()
            ),
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            viewCount: pre.viewCount || 0,
            metadata: {
              ...enriched,
              videoId: pre.videoId,
              channelTitle: pre.channelTitle,
            },
          },
        },
        upsert: true,
      },
    };
  } catch (error) {
    return null;
  }
}

/* =====================================================
   BATCH RUNNER
===================================================== */

async function processInBatches(items, batchSize, handler) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const res = await Promise.all(
      batch.map((item) => handler(item))
    );

    results.push(...res);
  }

  return results;
}

/* =====================================================
   API HANDLER
===================================================== */

export default async function handler(req, res) {
  const { region = "IN" } = req.query;
  const REGION = region.toUpperCase();

  /* =================================================
     GET -> REDIS FIRST
  ================================================= */

  if (req.method === "GET") {
    try {
      const redisKey = getRedisKey(REGION);

      const response = await cacheManager(
        redisKey,
        REDIS_TTL,
        async () => {
          await dbConnect();

          const data = await Trending.find({
            source: "youtube",
            region: REGION,
            expiresAt: { $gt: new Date() },
          })
            .sort({ score: -1 })
            .limit(50)
            .lean();

          return {
            success: true,
            source: "youtube",
            region: REGION,
            cached: false,
            count: data.length,
            data,
          };
        }
      );

      // If Redis served, mark true
      if (response.cached === false) {
        return res.status(200).json(response);
      }

      return res.status(200).json({
        ...response,
        cached: true,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /* =================================================
     POST -> REFRESH DATA + CLEAR REDIS
  ================================================= */

  if (req.method === "POST") {
    const secret = req.headers["x-cron-secret"];

    if (secret !== CRON_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      await dbConnect();

      console.time("YOUTUBE_SYNC");

      /* STEP 1 FETCH */

      const [film, ent, movie] = await Promise.all([
        fetchYouTubeTrending("Film & Animation", REGION),
        fetchYouTubeTrending("Entertainment", REGION),
        fetchYouTubeTrending("Movies", REGION),
      ]);

      const raw = [...film, ...ent, ...movie];

      const unique = Array.from(
        new Map(raw.map((x) => [x.title.toLowerCase(), x]))
          .values()
      );

      /* STEP 2 PROCESS */

      const ops = await processInBatches(
        unique,
        BATCH_SIZE,
        (item) => processTrend(item, REGION)
      );

      const finalOps = ops.filter(Boolean);

      /* STEP 3 CLEANUP */

      await Trending.deleteMany({
        source: "youtube",
        region: REGION,
        expiresAt: { $lt: new Date() },
      });

      /* STEP 4 SAVE */

      if (finalOps.length > 0) {
        await Trending.bulkWrite(finalOps);
      }

      /* STEP 5 CLEAR REDIS CACHE */

      const redisKey = getRedisKey(REGION);

      if (redis) {
        await redis.del(redisKey);
      }

      console.timeEnd("YOUTUBE_SYNC");

      return res.status(200).json({
        success: true,
        message: "YouTube trends synced",
        processed: unique.length,
        saved: finalOps.length,
        region: REGION,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
}