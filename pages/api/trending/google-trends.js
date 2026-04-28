// // GET /api/trending/google-trends
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import { fetchGoogleTrends } from "../../../lib/trending/data-ingestion";
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

// /* ---------------- SCORE CALCULATION ---------------- */

// function calculateScore(trend) {
//   let score = 0;

//   // Traffic contribution (60% max)
//   if (trend.traffic > 1000000) score += 60;
//   else if (trend.traffic > 500000) score += 45;
//   else if (trend.traffic > 100000) score += 30;
//   else if (trend.traffic > 50000) score += 15;
//   else if (trend.traffic > 10000) score += 8;

//   // Recency contribution (30% max)
//   const hours = (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
//   if (hours < 6) score += 30;
//   else if (hours < 24) score += 20;
//   else if (hours < 48) score += 10;
//   else if (hours < 72) score += 5;

//   // Classification confidence (10% max)
//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

//   return Math.min(score, 100);
// }

// /* ---------------- MAIN HANDLER ---------------- */

// export default async function handler(req, res) {
//   const { region = "IN" } = req.query;

//   // Authentication for POST requests
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
//     console.log(`🚀 Starting Google Trends Sync Pipeline for Region: ${region.toUpperCase()}`);
//     console.log("=".repeat(70));

//     // Step 1: Fetch Google Trends
//     console.log(`\n📊 Step 1: Fetching Google Trends data for ${region.toUpperCase()}...`);
//     const rawTrends = await fetchGoogleTrends(region.toUpperCase());
//     console.log(`   ✅ Fetched ${rawTrends.length} Google Trends`);

//     if (!rawTrends.length) {
//       return res.status(200).json({
//         success: true,
//         message: `No Google Trends found for ${region.toUpperCase()}`,
//         stats: {
//           processed: 0,
//           validated: 0,
//           rejected: 0,
//           movies: 0,
//           actors: 0,
//           topics: 0,
//           saved: 0,
//         },
//         validatedData: [],
//         rejectedData: [],
//         region: region.toUpperCase()
//       });
//     }

//     // Step 2: Process each trend - Validate against LOCAL DATABASE first
//     console.log("\n🔍 Step 2: Validating against local database...");
//     let validated = 0;
//     let rejected = 0;
//     let movies = 0;
//     let actors = 0;
//     let topics = 0;
//     const trendingRecords = [];
//     const validatedDetails = [];
//     const rejectedDetails = [];

//     for (const rawTrend of rawTrends) {
//       try {
//         // Preprocess the raw trend
//         const preprocessed = await preprocessTrend(rawTrend);
        
//         // CRITICAL: Validate against LOCAL database (Articles & Celebrities)
//         const validation = await validateTrend(preprocessed);
        
//         console.log(`   Processing: "${preprocessed.title.substring(0, 50)}..."`);
        
//         // If not found in local database, reject
//         if (!validation.isValid) {
//           console.log(`      ❌ REJECTED: Not found in database`);
//           rejectedDetails.push({
//             title: preprocessed.title,
//             reason: validation.reason || "Not found in Articles or Celebrities database"
//           });
//           rejected++;
//           continue;
//         }

//         // Found in local database! Now enrich with TMDB data
//         console.log(`      ✅ VALIDATED: ${validation.type === "trending_movies" ? "🎬 Movie" : "👤 Celebrity"} - "${validation.title}"`);
        
//         const enriched = await enrichWithTMDBData(preprocessed, validation);
//         const score = calculateScore(enriched);

//         // Create database record
//         const trendRecord = {
//           title: validation.title, // Use the matched title from DB
//           originalTitle: preprocessed.title, // Store original for reference
//           type: validation.type,
//           entityType: validation.entityType,
//           referenceId: validation.referenceId,
//           referenceModel: validation.referenceModel,
//           slug: validation.slug,
//           source: "google",
//           traffic: preprocessed.traffic || 0,
//           viewCount: 0,
//           keywords: preprocessed.keywords || [],
//           classificationConfidence: preprocessed.classificationConfidence || 0.5,
//           status: "active",
//           region: region.toUpperCase(), // Store region
//           trendTimestamp: new Date(preprocessed.timestamp || Date.now()),
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//           metadata: {
//             ...enriched,
//             localMetadata: validation.metadata
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
//           image: enriched.poster || enriched.image || validation.metadata?.thumbnail || validation.metadata?.coverImage || null,
//           slug: validation.slug,
//           referenceId: validation.referenceId,
//           localMatch: true,
//           region: region.toUpperCase()
//         });

//         validated++;
        
//         if (validation.type === "trending_movies") {
//           movies++;
//           console.log(`      🎬 Movie match: "${validation.title}" (Score: ${score})`);
//         } else if (validation.type === "trending_actors") {
//           actors++;
//           console.log(`      👤 Celebrity match: "${validation.title}" (Score: ${score})`);
//         } else if (validation.type === "viral_topics") {
//           topics++;
//           console.log(`      📊 Topic match: "${validation.title}" (Score: ${score})`);
//         }
        
//       } catch (error) {
//         console.error(`   ❌ Error processing trend:`, error.message);
//         rejectedDetails.push({
//           title: rawTrend.title,
//           reason: error.message
//         });
//         rejected++;
//       }

//       // Rate limiting to avoid overwhelming APIs
//       await new Promise((resolve) => setTimeout(resolve, 200));
//     }

//     console.log(`\n📝 Validation Complete`);
//     console.log(`   Total processed: ${rawTrends.length}`);
//     console.log(`   Validated: ${validated} (${((validated / rawTrends.length) * 100).toFixed(1)}%)`);
//     console.log(`   Rejected: ${rejected}`);
//     console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);

//     // Step 3: Save to database
//     if (trendingRecords.length > 0) {
//       console.log(`\n💾 Step 3: Saving to database...`);

//       // Delete expired Google Trends for this region
//       const expiredCount = await Trending.deleteMany({
//         source: "google",
//         region: region.toUpperCase(),
//         expiresAt: { $lt: new Date() },
//       });
//       console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired Google Trends for ${region.toUpperCase()}`);

//       // Upsert new trends
//       let saved = 0;
//       for (const record of trendingRecords) {
//         await Trending.findOneAndUpdate(
//           { 
//             title: record.title, 
//             source: "google",
//             type: record.type,
//             region: record.region // Add region to uniqueness check
//           },
//           record,
//           { upsert: true, returnDocument: 'after' }
//         );
//         saved++;
//       }

//       console.log(`   ✅ Saved ${saved} Google Trends to database for ${region.toUpperCase()}`);
//     }

//     console.log("\n" + "=".repeat(70));
//     console.log(`✅ Google Trends Sync Complete for ${region.toUpperCase()}!`);
//     console.log("=".repeat(70) + "\n");

//     return res.status(200).json({
//       success: true,
//       message: `Google Trends synced successfully for ${region.toUpperCase()}`,
//       stats: {
//         processed: rawTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         topics,
//         saved: trendingRecords.length,
//         source: "google",
//         region: region.toUpperCase()
//       },
//       validatedData: validatedDetails,
//       rejectedData: rejectedDetails.length > 0 ? rejectedDetails : undefined
//     });
    
//   } catch (error) {
//     console.error("❌ Google Trends Sync Error:", error.message);
//     console.error(error.stack);
//     return res.status(500).json({
//       success: false,
//       message: "Google Trends sync failed",
//       error: error.message,
//       source: "google",
//     });
//   }
// }

// /api/trending/google-trends
// ULTRA FAST + REDIS VERSION

import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import { fetchGoogleTrends } from "../../../lib/trending/data-ingestion";
import { preprocessTrend } from "../../../lib/trending/preprocessing";
import { validateTrend } from "../../../lib/trending/validation";
import redis, { cacheManager } from "../../../lib/redis";
import axios from "axios";

const CRON_SECRET =
  process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const BATCH_SIZE = 5;
const REDIS_TTL = 900; // 15 min
const MEMORY_CACHE = new Map();

/* ===================================================
   REDIS KEY
=================================================== */

function getRedisKey(region) {
  return `google_trends:${region.toUpperCase()}`;
}

/* ===================================================
   TMDB CACHE
=================================================== */

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

/* ===================================================
   SCORE
=================================================== */

function calculateScore(trend) {
  let score = 0;

  const traffic = trend.traffic || 0;

  if (traffic > 1000000) score += 60;
  else if (traffic > 500000) score += 45;
  else if (traffic > 100000) score += 30;
  else if (traffic > 50000) score += 15;
  else if (traffic > 10000) score += 8;

  const hrs =
    (Date.now() - new Date(trend.timestamp).getTime()) /
    (1000 * 60 * 60);

  if (hrs < 6) score += 30;
  else if (hrs < 24) score += 20;
  else if (hrs < 48) score += 10;

  score += Math.round(
    (trend.classificationConfidence || 0.5) * 10
  );

  return Math.min(score, 100);
}

/* ===================================================
   SINGLE TREND PROCESSOR
=================================================== */

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
        enriched.overview = movie.overview;
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
          source: "google",
          region,
          type: validation.type,
        },
        update: {
          $set: {
            title: validation.title,
            originalTitle: pre.title,
            source: "google",
            type: validation.type,
            slug: validation.slug,
            score,
            region,
            status: "active",
            traffic: pre.traffic || 0,
            viewCount: 0,
            trendTimestamp: new Date(
              pre.timestamp || Date.now()
            ),
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            metadata: {
              ...enriched,
              localMetadata: validation.metadata,
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

/* ===================================================
   BATCH PROCESSOR
=================================================== */

async function processInBatches(items, batchSize, fn) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const res = await Promise.all(
      batch.map((item) => fn(item))
    );

    results.push(...res);
  }

  return results;
}

/* ===================================================
   API
=================================================== */

export default async function handler(req, res) {
  const { region = "IN" } = req.query;

  const REGION = region.toUpperCase();

  /* ================================================
     GET = REDIS FIRST
  ================================================ */

  if (req.method === "GET") {
    try {
      const redisKey = getRedisKey(REGION);

      const response = await cacheManager(
        redisKey,
        REDIS_TTL,
        async () => {
          await dbConnect();

          const data = await Trending.find({
            source: "google",
            region: REGION,
            expiresAt: { $gt: new Date() },
          })
            .sort({ score: -1 })
            .limit(50)
            .lean();

          return {
            success: true,
            source: "google",
            region: REGION,
            cached: false,
            count: data.length,
            data,
          };
        }
      );

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

  /* ================================================
     POST = HEAVY REFRESH ONLY
  ================================================ */

  if (req.method === "POST") {
    const secret = req.headers["x-cron-secret"];

    if (
      secret !== CRON_SECRET &&
      req.headers.authorization !==
        `Bearer ${CRON_SECRET}`
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      await dbConnect();

      console.time("GOOGLE_SYNC");

      /* STEP 1 FETCH */

      const rawTrends = await fetchGoogleTrends(REGION);

      if (!rawTrends.length) {
        return res.status(200).json({
          success: true,
          message: "No trends found",
          count: 0,
        });
      }

      /* STEP 2 PROCESS IN PARALLEL */

      const ops = await processInBatches(
        rawTrends,
        BATCH_SIZE,
        (item) => processTrend(item, REGION)
      );

      const finalOps = ops.filter(Boolean);

      /* STEP 3 DELETE EXPIRED */

      await Trending.deleteMany({
        source: "google",
        region: REGION,
        expiresAt: { $lt: new Date() },
      });

      /* STEP 4 BULK WRITE */

      if (finalOps.length > 0) {
        await Trending.bulkWrite(finalOps);
      }

      /* STEP 5 CLEAR REDIS */

      const redisKey = getRedisKey(REGION);

      if (redis) {
        await redis.del(redisKey);
      }

      console.timeEnd("GOOGLE_SYNC");

      return res.status(200).json({
        success: true,
        message: "Google trends synced",
        processed: rawTrends.length,
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