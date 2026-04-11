// // GET /api/trending/google-trends
// // Fetch ONLY Google Trends data (no YouTube)
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import { fetchGoogleTrends } from "../../../lib/trending/data-ingestion";
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
//             ? "Celebrity"
//             : null,
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

//   // Traffic contribution (60% for Google Trends since it measures search volume)
//   if (trend.traffic > 1000000) score += 60;
//   else if (trend.traffic > 500000) score += 45;
//   else if (trend.traffic > 100000) score += 30;
//   else if (trend.traffic > 50000) score += 15;

//   // Recency contribution (30%)
//   const hoursSinceTrend =
//     (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
//   if (hoursSinceTrend < 6) score += 30;
//   else if (hoursSinceTrend < 24) score += 20;
//   else if (hoursSinceTrend < 48) score += 10;

//   // Classification confidence (10%)
//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

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
//     console.log("🚀 Starting Google Trends Sync Pipeline");
//     console.log("=".repeat(70));

//     // Step 1: Fetch ONLY Google Trends (no YouTube)
//     console.log("\n📊 Step 1: Fetching Google Trends data...");
//     const rawTrends = await fetchGoogleTrends("IN");
//     console.log(`   ✅ Fetched ${rawTrends.length} Google Trends`);

//     if (rawTrends.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No Google Trends found",
//         stats: {
//           processed: 0,
//           validated: 0,
//           rejected: 0,
//           movies: 0,
//           actors: 0,
//           topics: 0,
//           source: "google",
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

//     for (const rawTrend of rawTrends) {
//       try {
//         // Preprocess
//         const preprocessed = await preprocessTrend(rawTrend);

//         // Validate
//         // const validation = await validateTrend(preprocessed);
//         if (validation.type === "trending_movies") {
//           const movie = await searchMovieFromTMDB(preprocessed.title);

//           enriched.poster = movie.poster_path;
//           enriched.releaseDate = movie.release_date;
//           enriched.overview = movie.overview;
//         }

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
//           source: "google", // Mark as Google Trends
//           traffic: enriched.traffic || 0,
//           viewCount: 0, // Google Trends doesn't have view counts
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
//               ? "👤"
//               : "📊";
//         console.log(
//           `   ${typeLabel} Validated & enriched: "${enriched.title.substring(0, 30)}..." (Score: ${score})`
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
//     console.log(`   Total processed: ${rawTrends.length}`);
//     console.log(`   Validated: ${validated} (${((validated / rawTrends.length) * 100).toFixed(1)}%)`);
//     console.log(`   Rejected: ${rejected}`);
//     console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);


//     // Step 3: Save to database
//     if (trendingRecords.length > 0) {
//       console.log(`\n💾 Step 3: Saving to database...`);

//       // Delete expired Google Trends
//       const expiredCount = await Trending.deleteMany({
//         source: "google",
//         expiresAt: { $lt: new Date() },
//       });
//       console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired Google Trends`);

//       // Upsert new trends
//       for (const record of trendingRecords) {
//         await Trending.findOneAndUpdate(
//           { title: record.title, source: "google" },
//           record,
//           { upsert: true, returnDocument: 'after' }
//         );
//       }

//       console.log(`   ✅ Saved ${trendingRecords.length} Google Trends to database`);
//     }

//     console.log("\n" + "=".repeat(70));
//     console.log("✅ Google Trends Sync Complete!");
//     console.log("=".repeat(70) + "\n");

//     return res.status(200).json({
//       success: true,
//       message: "Google Trends synced successfully",
//       stats: {
//         processed: rawTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         topics,
//         saved: trendingRecords.length,
//         source: "google",
//       },
//       validatedData: validatedDetails,
//       rejectedData: rejectedDetails
//     });
//   } catch (error) {
//     console.error("❌ Google Trends Sync Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Google Trends sync failed",
//       error: error.message,
//       source: "google",
//     });
//   }
// }
// GET /api/trending/google-trends

// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import { fetchGoogleTrends } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";
// import axios from "axios";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";
// const TMDB_API_KEY = process.env.TMDB_API_KEY;

// /* ---------------- TMDB HELPERS ---------------- */

// // Search Movie
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

// // Search Actor
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

// /* ---------------- ENRICHMENT ---------------- */

// async function enrichTrendData(trend, validation) {
//   let enriched = { ...trend };

//   try {
//     if (validation.type === "trending_movies") {
//       const movie = await searchMovieFromTMDB(trend.title);

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
//       const actor = await searchActorFromTMDB(trend.title);

//       if (actor) {
//         enriched.image = actor.profile_path
//           ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
//           : null;
//         enriched.knownFor = actor.known_for?.map((m) => m.title || m.name) || [];
//         enriched.tmdbId = actor.id;
//       }
//     }

//     enriched.referenceId = validation.referenceId;
//     enriched.referenceModel =
//       validation.type === "trending_movies"
//         ? "Article"
//         : validation.type === "trending_actors"
//         ? "Celebrity"
//         : null;

//     return enriched;
//   } catch (error) {
//     console.error("Enrichment error:", error.message);
//     return trend;
//   }
// }

// /* ---------------- SCORE ---------------- */

// function calculateScore(trend) {
//   let score = 0;

//   if (trend.traffic > 1000000) score += 60;
//   else if (trend.traffic > 500000) score += 45;
//   else if (trend.traffic > 100000) score += 30;
//   else if (trend.traffic > 50000) score += 15;

//   const hours =
//     (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);

//   if (hours < 6) score += 30;
//   else if (hours < 24) score += 20;
//   else if (hours < 48) score += 10;

//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

//   return Math.min(score, 100);
// }

// /* ---------------- MAIN HANDLER ---------------- */

// export default async function handler(req, res) {
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

//     console.log("🚀 Fetching Google Trends...");
//     const rawTrends = await fetchGoogleTrends("IN");

//     if (!rawTrends.length) {
//       return res.json({ success: true, message: "No Google Trends found" });
//     }

//     let validated = 0;
//     let rejected = 0;
//     let movies = 0;
//     let actors = 0;

//     const trendingRecords = [];

//     for (const rawTrend of rawTrends) {
//       try {
//         const preprocessed = await preprocessTrend(rawTrend);
//         const validation = await validateTrend(preprocessed);

//         if (!validation.isValid) {
//           rejected++;
//           continue;
//         }

//         const enriched = await enrichTrendData(preprocessed, validation);
//         const score = calculateScore(enriched);

//         trendingRecords.push({
//           title: enriched.title,
//           type: validation.type,
//           slug: validation.slug,
//           source: "google",
//           traffic: enriched.traffic,
//           metadata: enriched,
//           score,
//           trendTimestamp: new Date(),
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         });

//         validated++;

//         if (validation.type === "trending_movies") movies++;
//         if (validation.type === "trending_actors") actors++;
//       } catch (err) {
//         rejected++;
//       }

//       await new Promise((r) => setTimeout(r, 150));
//     }

//     // Save
//     for (const record of trendingRecords) {
//       await Trending.findOneAndUpdate(
//         { title: record.title, source: "google" },
//         record,
//         { upsert: true }
//       );
//     }

//     return res.json({
//       success: true,
//       stats: {
//         processed: rawTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         saved: trendingRecords.length,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// }

// // GET /api/trending/google-trends

// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import { fetchGoogleTrends } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";
// import axios from "axios";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";
// const TMDB_API_KEY = process.env.TMDB_API_KEY;

// /* ---------------- TMDB HELPERS ---------------- */

// // Search Movie
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

// // Search Actor
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

// /* ---------------- ENRICHMENT ---------------- */

// async function enrichTrendData(trend, validation) {
//   let enriched = { ...trend };

//   try {
//     if (validation.type === "trending_movies") {
//       const movie = await searchMovieFromTMDB(trend.title);

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
//       const actor = await searchActorFromTMDB(trend.title);

//       if (actor) {
//         enriched.image = actor.profile_path
//           ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
//           : null;
//         enriched.knownFor = actor.known_for?.map((m) => m.title || m.name) || [];
//         enriched.tmdbId = actor.id;
//       }
//     }

//     enriched.referenceId = validation.referenceId;
//     enriched.referenceModel =
//       validation.type === "trending_movies"
//         ? "Article"
//         : validation.type === "trending_actors"
//         ? "Celebrity"
//         : null;

//     return enriched;
//   } catch (error) {
//     console.error("Enrichment error:", error.message);
//     return trend;
//   }
// }

// /* ---------------- SCORE ---------------- */

// function calculateScore(trend) {
//   let score = 0;

//   if (trend.traffic > 1000000) score += 60;
//   else if (trend.traffic > 500000) score += 45;
//   else if (trend.traffic > 100000) score += 30;
//   else if (trend.traffic > 50000) score += 15;

//   const hours =
//     (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);

//   if (hours < 6) score += 30;
//   else if (hours < 24) score += 20;
//   else if (hours < 48) score += 10;

//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

//   return Math.min(score, 100);
// }

// /* ---------------- MAIN HANDLER ---------------- */

// export default async function handler(req, res) {
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

//     console.log("🚀 Fetching Google Trends...");
//     const rawTrends = await fetchGoogleTrends("IN");

//     if (!rawTrends.length) {
//       return res.json({ success: true, message: "No Google Trends found" });
//     }

//     let validated = 0;
//     let rejected = 0;
//     let movies = 0;
//     let actors = 0;
//     const trendingRecords = [];
//     const validatedDetails = [];

//     for (const rawTrend of rawTrends) {
//       try {
//         const preprocessed = await preprocessTrend(rawTrend);

//         // NEW VALIDATION USING TMDB
//         let validation = {
//           isValid: false,
//           type: null,
//           slug: preprocessed.title.toLowerCase().replace(/\s+/g, "-"),
//         };

//         let enriched = { ...preprocessed };

//         // Try Movie
//         const movie = await searchMovieFromTMDB(preprocessed.title);
//         if (movie) {
//           validation.isValid = true;
//           validation.type = "trending_movies";

//           enriched.poster = movie.poster_path
//             ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//             : null;
//           enriched.releaseDate = movie.release_date;
//           enriched.overview = movie.overview;
//         }

//         // Try Actor (only if not movie)
//         if (!validation.isValid) {
//           const actor = await searchActorFromTMDB(preprocessed.title);

//           if (actor) {
//             validation.isValid = true;
//             validation.type = "trending_actors";

//             enriched.image = actor.profile_path
//               ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
//               : null;
//             enriched.knownFor =
//               actor.known_for?.map((m) => m.title || m.name) || [];
//           }
//         }

//         // Reject if not found anywhere
//         if (!validation.isValid) {
//           rejected++;
//           continue;
//         }

//         const score = calculateScore(enriched);

//         const trendRecord = {
//           title: enriched.title,
//           type: validation.type,
//           slug: validation.slug,
//           source: "google",
//           traffic: enriched.traffic || 0,
//           viewCount: 0,
//           keywords: enriched.keywords || [],
//           classificationConfidence: enriched.classificationConfidence || 0.5,
//           status: "active",
//           metadata: enriched,
//           score,
//           trendTimestamp: new Date(enriched.timestamp || Date.now()),
//           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         };

//         trendingRecords.push(trendRecord);

//         // Save validated data for response
//         validatedDetails.push({
//           title: enriched.title,
//           type: validation.type,
//           score,
//           image: enriched.poster || enriched.image || null,
//         });

//         validated++;

//         if (validation.type === "trending_movies") movies++;
//         if (validation.type === "trending_actors") actors++;
//       } catch (err) {
//         console.error(`Error processing trend:`, err.message);
//         rejected++;
//       }

//       await new Promise((r) => setTimeout(r, 150));
//     }

//     // Save to database
//     if (trendingRecords.length > 0) {
//       // Delete expired Google Trends
//       await Trending.deleteMany({
//         source: "google",
//         expiresAt: { $lt: new Date() },
//       });

//       // Upsert new trends
//       for (const record of trendingRecords) {
//         await Trending.findOneAndUpdate(
//           { title: record.title, source: "google" },
//           record,
//           { upsert: true }
//         );
//       }
//     }

//     return res.json({
//       success: true,
//       stats: {
//         processed: rawTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         saved: trendingRecords.length,
//       },
//       validatedData: validatedDetails,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// }
// GET /api/trending/google-trends

import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import { fetchGoogleTrends } from "../../../lib/trending/data-ingestion";
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

/* ---------------- SCORE CALCULATION ---------------- */

function calculateScore(trend) {
  let score = 0;

  // Traffic contribution (60% max)
  if (trend.traffic > 1000000) score += 60;
  else if (trend.traffic > 500000) score += 45;
  else if (trend.traffic > 100000) score += 30;
  else if (trend.traffic > 50000) score += 15;
  else if (trend.traffic > 10000) score += 8;

  // Recency contribution (30% max)
  const hours = (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
  if (hours < 6) score += 30;
  else if (hours < 24) score += 20;
  else if (hours < 48) score += 10;
  else if (hours < 72) score += 5;

  // Classification confidence (10% max)
  score += Math.round((trend.classificationConfidence || 0.5) * 10);

  return Math.min(score, 100);
}

/* ---------------- MAIN HANDLER ---------------- */

export default async function handler(req, res) {
  // Authentication for POST requests
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

    // Step 1: Fetch Google Trends
    console.log("\n📊 Step 1: Fetching Google Trends data...");
    const rawTrends = await fetchGoogleTrends("IN");
    console.log(`   ✅ Fetched ${rawTrends.length} Google Trends`);

    if (!rawTrends.length) {
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
          saved: 0,
        },
        validatedData: [],
        rejectedData: []
      });
    }

    // Step 2: Process each trend - Validate against LOCAL DATABASE first
    console.log("\n🔍 Step 2: Validating against local database...");
    let validated = 0;
    let rejected = 0;
    let movies = 0;
    let actors = 0;
    let topics = 0;
    const trendingRecords = [];
    const validatedDetails = [];
    const rejectedDetails = [];

    for (const rawTrend of rawTrends) {
      try {
        // Preprocess the raw trend
        const preprocessed = await preprocessTrend(rawTrend);
        
        // CRITICAL: Validate against LOCAL database (Articles & Celebrities)
        const validation = await validateTrend(preprocessed);
        
        console.log(`   Processing: "${preprocessed.title.substring(0, 50)}..."`);
        
        // If not found in local database, reject
        if (!validation.isValid) {
          console.log(`      ❌ REJECTED: Not found in database`);
          rejectedDetails.push({
            title: preprocessed.title,
            reason: validation.reason || "Not found in Articles or Celebrities database"
          });
          rejected++;
          continue;
        }

        // Found in local database! Now enrich with TMDB data
        console.log(`      ✅ VALIDATED: ${validation.type === "trending_movies" ? "🎬 Movie" : "👤 Celebrity"} - "${validation.title}"`);
        
        const enriched = await enrichWithTMDBData(preprocessed, validation);
        const score = calculateScore(enriched);

        // Create database record
        const trendRecord = {
          title: validation.title, // Use the matched title from DB
          originalTitle: preprocessed.title, // Store original for reference
          type: validation.type,
          entityType: validation.entityType,
          referenceId: validation.referenceId,
          referenceModel: validation.referenceModel,
          slug: validation.slug,
          source: "google",
          traffic: preprocessed.traffic || 0,
          viewCount: 0,
          keywords: preprocessed.keywords || [],
          classificationConfidence: preprocessed.classificationConfidence || 0.5,
          status: "active",
          trendTimestamp: new Date(preprocessed.timestamp || Date.now()),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          metadata: {
            ...enriched,
            localMetadata: validation.metadata
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
          image: enriched.poster || enriched.image || validation.metadata?.thumbnail || validation.metadata?.coverImage || null,
          slug: validation.slug,
          referenceId: validation.referenceId,
          localMatch: true
        });

        validated++;
        
        if (validation.type === "trending_movies") {
          movies++;
          console.log(`      🎬 Movie match: "${validation.title}" (Score: ${score})`);
        } else if (validation.type === "trending_actors") {
          actors++;
          console.log(`      👤 Celebrity match: "${validation.title}" (Score: ${score})`);
        } else if (validation.type === "viral_topics") {
          topics++;
          console.log(`      📊 Topic match: "${validation.title}" (Score: ${score})`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing trend:`, error.message);
        rejectedDetails.push({
          title: rawTrend.title,
          reason: error.message
        });
        rejected++;
      }

      // Rate limiting to avoid overwhelming APIs
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`\n📝 Validation Complete`);
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
      let saved = 0;
      for (const record of trendingRecords) {
        await Trending.findOneAndUpdate(
          { 
            title: record.title, 
            source: "google",
            type: record.type 
          },
          record,
          { upsert: true, returnDocument: 'after' }
        );
        saved++;
      }

      console.log(`   ✅ Saved ${saved} Google Trends to database`);
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
      validatedData: validatedDetails,
      rejectedData: rejectedDetails.length > 0 ? rejectedDetails : undefined
    });
    
  } catch (error) {
    console.error("❌ Google Trends Sync Error:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: "Google Trends sync failed",
      error: error.message,
      source: "google",
    });
  }
}