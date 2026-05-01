// // POST /api/trending/sync
// // Fetches trends from all sources, validates against database, enriches, and stores
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import Article from "../../../model/article";
// import Celebrity from "../../../model/celebrity";
// import { fetchAllTrends } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

// /**
//  * Enrich validated trend with TMDB or local database content
//  */
// async function enrichTrendData(trend, validation) {
//   try {
//     let enrichedData = {
//       ...trend,
//       title: validation.title, // Use original keyword preserved in validation
//       referenceId: validation.referenceId,
//       referenceModel: validation.type === "trending_movies" ? "Article" : validation.type === "trending_actors" ? "Celebrity" : null,
//       metadata: trend.metadata || {}
//     };

//     // 1. Enrich from TMDB Data (if available from validation)
//     if (validation.tmdbData) {
//       const tmdb = validation.tmdbData;
//       if (validation.type === "trending_movies") {
//         enrichedData.metadata = {
//           ...enrichedData.metadata,
//           movieTitle: tmdb.title,
//           releaseDate: tmdb.releaseDate,
//           overview: tmdb.overview,
//           rating: tmdb.rating,
//           coverImage: tmdb.image,
//           tmdbPopularity: tmdb.popularity
//         };
//       } else if (validation.type === "trending_actors") {
//         enrichedData.metadata = {
//           ...enrichedData.metadata,
//           actorName: tmdb.title,
//           knownFor: tmdb.knownFor?.join(", "),
//           profileImage: tmdb.image,
//           tmdbPopularity: tmdb.popularity
//         };
//       }
//     }

//     // 2. Further enrich from Local Database if it exists
//     if (validation.isLocal && validation.referenceId) {
//       if (validation.type === "trending_movies") {
//         const movie = await Article.findById(validation.referenceId).select(
//           "movieTitle slug coverImage releaseYear director genres stats"
//         );
//         if (movie) {
//           enrichedData.metadata = {
//             ...enrichedData.metadata,
//             localSlug: movie.slug,
//             localTitle: movie.movieTitle,
//             director: movie.director?.[0] || "N/A",
//             genres: movie.genres?.join(", ") || "N/A",
//             boxOffice: movie.stats?.worldwide || "N/A",
//           };
//           // Prefer local image if available
//           if (movie.coverImage) enrichedData.metadata.coverImage = movie.coverImage;
//         }
//       } else if (validation.type === "trending_actors") {
//         const celebrity = await Celebrity.findById(validation.referenceId).select(
//           "heroSection.name heroSection.industry heroSection.profileImage quickFacts.age netWorth"
//         );
//         if (celebrity) {
//           enrichedData.metadata = {
//             ...enrichedData.metadata,
//             localSlug: celebrity.heroSection?.slug,
//             localName: celebrity.heroSection?.name,
//             industry: celebrity.heroSection?.industry,
//             age: celebrity.quickFacts?.age,
//             netWorth: celebrity.netWorth?.netWorthUSD?.display,
//           };
//           // Prefer local image if available
//           if (celebrity.heroSection?.profileImage) enrichedData.metadata.profileImage = celebrity.heroSection.profileImage;
//         }
//       }
//     }

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

//   // Traffic contribution (40%)
//   if (trend.traffic > 1000000) score += 40;
//   else if (trend.traffic > 500000) score += 30;
//   else if (trend.traffic > 100000) score += 20;
//   else if (trend.traffic > 50000) score += 10;

//   // View count contribution (30%)
//   if (trend.viewCount > 10000000) score += 30;
//   else if (trend.viewCount > 5000000) score += 20;
//   else if (trend.viewCount > 1000000) score += 10;
//   else if (trend.viewCount > 500000) score += 5;

//   // Recency contribution (20%)
//   const hoursSinceTrend =
//     (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
//   if (hoursSinceTrend < 6) score += 20;
//   else if (hoursSinceTrend < 24) score += 15;
//   else if (hoursSinceTrend < 48) score += 10;
//   else if (hoursSinceTrend < 72) score += 5;

//   // Classification confidence (10%)
//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

//   // TMDB Popularity Boost (Max 10%)
//   if (trend.metadata?.tmdbPopularity) {
//     const pop = trend.metadata.tmdbPopularity;
//     if (pop > 100) score += 10;
//     else if (pop > 50) score += 7;
//     else if (pop > 20) score += 5;
//     else if (pop > 5) score += 2;
//   }

//   return Math.min(score, 100);
// }

// export default async function handler(req, res) {
//   const { region = "IN" || "US" } = req.query;

//   // Verify CRON secret
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
//     console.log(`🚀 Starting Trend Sync & Enrichment Pipeline for Region: ${region.toUpperCase()}`);
//     console.log("=".repeat(70));

//     // Step 1: Fetch raw trends from all sources
//     console.log(`\n📊 Step 1: Fetching trends from Google & YouTube for ${region.toUpperCase()}...`);
//     const rawTrends = await fetchAllTrends(region.toUpperCase());
//     console.log(`   ✅ Fetched ${rawTrends.length} raw trends`);

//     if (rawTrends.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: `No trends found for ${region.toUpperCase()}`,
//         stats: { processed: 0, validated: 0, rejected: 0, movies: 0, actors: 0, topics: 0 },
//         region: region.toUpperCase()
//       });
//     }

//     // Step 2: Process and validate in parallel batches
//     console.log("\n🔍 Step 2: Processing, validating, and enriching...");
//     let validated = 0;
//     let rejected = 0;
//     let movies = 0;
//     let actors = 0;
//     let topics = 0;
//     const trendingRecords = [];
//     const validatedDetails = [];
//     const rejectedDetails = [];

//     // Process in parallel batches of 5 to avoid overwhelming APIs/DB
//     const BATCH_SIZE = 5;
//     for (let i = 0; i < rawTrends.length; i += BATCH_SIZE) {
//       const batch = rawTrends.slice(i, i + BATCH_SIZE);
//       const results = await Promise.all(batch.map(async (rawTrend) => {
//         try {
//           // Preprocess
//           const preprocessed = await preprocessTrend(rawTrend);

//           // Validate
//           const validation = await validateTrend(preprocessed);

//           if (!validation.isValid) {
//             return { success: false, title: rawTrend.title, reason: validation.reason || "Not found" };
//           }

//           // Enrich with database content
//           const enriched = await enrichTrendData(preprocessed, validation);

//           // Calculate score
//           const score = calculateScore(enriched);

//           // Create record for database
//           const trendRecord = {
//             title: validation.title,
//             originalTitle: preprocessed.title,
//             type: validation.type,
//             entityType: validation.entityType,
//             referenceId: validation.referenceId,
//             referenceModel: validation.referenceModel,
//             slug: validation.slug,
//             source: preprocessed.source || "manual",
//             traffic: preprocessed.traffic || 0,
//             viewCount: preprocessed.viewCount || 0,
//             keywords: preprocessed.keywords || [],
//             classificationConfidence: preprocessed.classificationConfidence || 0.5,
//             status: "active",
//             region: region.toUpperCase(), // Store region
//             trendTimestamp: new Date(preprocessed.timestamp || Date.now()),
//             expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//             metadata: enriched.metadata,
//             score: score,
//           };

//           return { success: true, record: trendRecord, validation, enriched, score };
//         } catch (error) {
//           console.error(`   ❌ Error processing "${rawTrend.title.substring(0, 30)}...": ${error.message}`);
//           return { success: false, title: rawTrend.title, reason: error.message };
//         }
//       }));

//       // Handle batch results
//       for (const res of results) {
//         if (res.success) {
//           trendingRecords.push(res.record);
//           validatedDetails.push({ title: res.record.title, type: res.record.type, score: res.score, region: region.toUpperCase() });
//           validated++;
//           if (res.record.type === "trending_movies") movies++;
//           else if (res.record.type === "trending_actors") actors++;
//           else if (res.record.type === "viral_topics") topics++;
//         } else {
//           rejectedDetails.push({ title: res.title, reason: res.reason });
//           rejected++;
//         }
//       }

//       // Small delay between batches
//       await new Promise(r => setTimeout(r, 200));
//     }

//     console.log(`\n📝 Processing Complete`);
//     console.log(`   Total processed: ${rawTrends.length}`);
//     console.log(`   Validated: ${validated} (${((validated / rawTrends.length) * 100).toFixed(1)}%)`);
//     console.log(`   Rejected: ${rejected}`);
//     console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);

//     // Step 3: Save to database
//     if (trendingRecords.length > 0) {
//       console.log(`\n💾 Step 3: Saving to database...`);

//       // Delete expired trends for this region
//       const expiredCount = await Trending.deleteMany({
//         region: region.toUpperCase(),
//         expiresAt: { $lt: new Date() },
//       });
//       console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired trends for ${region.toUpperCase()}`);

//       // Upsert new trends
//       let saved = 0;
//       for (const record of trendingRecords) {
//         await Trending.findOneAndUpdate(
//           { 
//             title: record.title, 
//             source: record.source,
//             type: record.type,
//             region: record.region // Add region to uniqueness check
//           },
//           record,
//           { upsert: true, returnDocument: 'after' }
//         );
//         saved++;
//       }

//       console.log(`   ✅ Saved ${saved} trends to database for ${region.toUpperCase()}`);
//     }

//     console.log("\n" + "=".repeat(70));
//     console.log(`✅ Trend Sync Complete for ${region.toUpperCase()}!`);
//     console.log("=".repeat(70) + "\n");

//     return res.status(200).json({
//       success: true,
//       message: `Trend sync completed for ${region.toUpperCase()}`,
//       stats: {
//         processed: rawTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         topics,
//         saved: trendingRecords.length,
//         region: region.toUpperCase()
//       },
//       validatedData: validatedDetails,
//       rejectedData: rejectedDetails.length > 0 ? rejectedDetails : undefined
//     });
//   } catch (error) {
//     console.error("❌ Sync Pipeline Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Sync failed",
//       error: error.message
//     });
//   }
// }
// POST /api/trending/sync
// Fetches trends from all sources, validates against database, enriches, and stores
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import Article from "../../../model/article";
// import Celebrity from "../../../model/celebrity";
// import { fetchAllTrends } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

// /**
//  * Enrich validated trend with TMDB or local database content
//  */
// async function enrichTrendData(trend, validation) {
//   try {
//     let enrichedData = {
//       ...trend,
//       title: validation.title,
//       referenceId: validation.referenceId,
//       referenceModel: validation.type === "trending_movies" ? "Article" : validation.type === "trending_actors" ? "Celebrity" : null,
//       metadata: trend.metadata || {}
//     };

//     if (validation.tmdbData) {
//       const tmdb = validation.tmdbData;
//       if (validation.type === "trending_movies") {
//         enrichedData.metadata = {
//           ...enrichedData.metadata,
//           movieTitle: tmdb.title,
//           releaseDate: tmdb.releaseDate,
//           overview: tmdb.overview,
//           rating: tmdb.rating,
//           coverImage: tmdb.image,
//           tmdbPopularity: tmdb.popularity
//         };
//       } else if (validation.type === "trending_actors") {
//         enrichedData.metadata = {
//           ...enrichedData.metadata,
//           actorName: tmdb.title,
//           knownFor: tmdb.knownFor?.join(", "),
//           profileImage: tmdb.image,
//           tmdbPopularity: tmdb.popularity
//         };
//       }
//     }

//     if (validation.isLocal && validation.referenceId) {
//       if (validation.type === "trending_movies") {
//         const movie = await Article.findById(validation.referenceId).select(
//           "movieTitle slug coverImage releaseYear director genres stats"
//         );
//         if (movie) {
//           enrichedData.metadata = {
//             ...enrichedData.metadata,
//             localSlug: movie.slug,
//             localTitle: movie.movieTitle,
//             director: movie.director?.[0] || "N/A",
//             genres: movie.genres?.join(", ") || "N/A",
//             boxOffice: movie.stats?.worldwide || "N/A",
//           };
//           if (movie.coverImage) enrichedData.metadata.coverImage = movie.coverImage;
//         }
//       } else if (validation.type === "trending_actors") {
//         const celebrity = await Celebrity.findById(validation.referenceId).select(
//           "heroSection.name heroSection.industry heroSection.profileImage quickFacts.age netWorth"
//         );
//         if (celebrity) {
//           enrichedData.metadata = {
//             ...enrichedData.metadata,
//             localSlug: celebrity.heroSection?.slug,
//             localName: celebrity.heroSection?.name,
//             industry: celebrity.heroSection?.industry,
//             age: celebrity.quickFacts?.age,
//             netWorth: celebrity.netWorth?.netWorthUSD?.display,
//           };
//           if (celebrity.heroSection?.profileImage) enrichedData.metadata.profileImage = celebrity.heroSection.profileImage;
//         }
//       }
//     }

//     return enrichedData;
//   } catch (error) {
//     console.error("Enrichment error:", error.message);
//     return trend;
//   }
// }

// function calculateScore(trend) {
//   let score = 0;

//   if (trend.traffic > 1000000) score += 40;
//   else if (trend.traffic > 500000) score += 30;
//   else if (trend.traffic > 100000) score += 20;
//   else if (trend.traffic > 50000) score += 10;

//   if (trend.viewCount > 10000000) score += 30;
//   else if (trend.viewCount > 5000000) score += 20;
//   else if (trend.viewCount > 1000000) score += 10;
//   else if (trend.viewCount > 500000) score += 5;

//   const hoursSinceTrend =
//     (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
//   if (hoursSinceTrend < 6) score += 20;
//   else if (hoursSinceTrend < 24) score += 15;
//   else if (hoursSinceTrend < 48) score += 10;
//   else if (hoursSinceTrend < 72) score += 5;

//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

//   if (trend.metadata?.tmdbPopularity) {
//     const pop = trend.metadata.tmdbPopularity;
//     if (pop > 100) score += 10;
//     else if (pop > 50) score += 7;
//     else if (pop > 20) score += 5;
//     else if (pop > 5) score += 2;
//   }

//   return Math.min(score, 100);
// }

// export default async function handler(req, res) {
//   // Get region from query parameter
//   const { region } = req.query;
  
//   const validRegions = ["IN", "US"];
//   let targetRegion = "IN";
  
//   if (region && validRegions.includes(region.toUpperCase())) {
//     targetRegion = region.toUpperCase();
//   } else if (region && !validRegions.includes(region.toUpperCase())) {
//     return res.status(400).json({ 
//       success: false, 
//       message: `Invalid region. Supported regions: ${validRegions.join(", ")}`,
//       supportedRegions: validRegions
//     });
//   }

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
//     console.log(`🚀 Starting Trend Sync & Enrichment Pipeline for Region: ${targetRegion}`);
//     console.log("=".repeat(70));

//     // Step 1: Fetch raw trends from all sources
//     console.log(`\n📊 Step 1: Fetching trends from Google & YouTube for ${targetRegion}...`);
//     const rawTrends = await fetchAllTrends(targetRegion);
//     console.log(`   ✅ Fetched ${rawTrends.length} raw trends for ${targetRegion}`);

//     if (rawTrends.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: `No trends found for ${targetRegion}`,
//         stats: { 
//           processed: 0, 
//           validated: 0, 
//           rejected: 0, 
//           movies: 0, 
//           actors: 0, 
//           topics: 0,
//           region: targetRegion
//         }
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

//     const BATCH_SIZE = 5;
//     for (let i = 0; i < rawTrends.length; i += BATCH_SIZE) {
//       const batch = rawTrends.slice(i, i + BATCH_SIZE);
//       const results = await Promise.all(batch.map(async (rawTrend) => {
//         try {
//           const preprocessed = await preprocessTrend(rawTrend);
//           const validation = await validateTrend(preprocessed);

//           if (!validation.isValid) {
//             return { success: false, title: rawTrend.title, reason: validation.reason || "Not found" };
//           }

//           const enriched = await enrichTrendData(preprocessed, validation);
//           const score = calculateScore(enriched);

//           const trendRecord = {
//             title: validation.title,
//             originalTitle: preprocessed.title,
//             type: validation.type,
//             entityType: validation.entityType,
//             referenceId: validation.referenceId,
//             referenceModel: validation.referenceModel,
//             slug: validation.slug,
//             source: preprocessed.source || "manual",
//             traffic: preprocessed.traffic || 0,
//             viewCount: preprocessed.viewCount || 0,
//             keywords: preprocessed.keywords || [],
//             classificationConfidence: preprocessed.classificationConfidence || 0.5,
//             status: "active",
//             region: targetRegion,
//             trendTimestamp: new Date(preprocessed.timestamp || Date.now()),
//             expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//             metadata: enriched.metadata,
//             score: score,
//           };

//           return { success: true, record: trendRecord, validation, score };
//         } catch (error) {
//           console.error(`   ❌ Error processing "${rawTrend.title.substring(0, 30)}...": ${error.message}`);
//           return { success: false, title: rawTrend.title, reason: error.message };
//         }
//       }));

//       for (const result of results) {
//         if (result.success) {
//           trendingRecords.push(result.record);
//           validatedDetails.push({ 
//             title: result.record.title, 
//             type: result.record.type, 
//             score: result.score, 
//             region: targetRegion 
//           });
//           validated++;
//           if (result.record.type === "trending_movies") movies++;
//           else if (result.record.type === "trending_actors") actors++;
//           else if (result.record.type === "viral_topics") topics++;
//         } else {
//           rejectedDetails.push({ title: result.title, reason: result.reason });
//           rejected++;
//         }
//       }

//       await new Promise(r => setTimeout(r, 200));
//     }

//     console.log(`\n📝 Processing Complete for ${targetRegion}`);
//     console.log(`   Total processed: ${rawTrends.length}`);
//     console.log(`   Validated: ${validated} (${((validated / rawTrends.length) * 100).toFixed(1)}%)`);
//     console.log(`   Rejected: ${rejected}`);
//     console.log(`   Breakdown: ${movies} movies, ${actors} actors, ${topics} topics`);

//     // Step 3: Save to database
//     if (trendingRecords.length > 0) {
//       console.log(`\n💾 Step 3: Saving to database for ${targetRegion}...`);

//       const expiredCount = await Trending.deleteMany({
//         region: targetRegion,
//         expiresAt: { $lt: new Date() },
//       });
//       console.log(`   🗑️  Cleaned up ${expiredCount.deletedCount} expired trends for ${targetRegion}`);

//       let saved = 0;
//       for (const record of trendingRecords) {
//         await Trending.findOneAndUpdate(
//           { 
//             title: record.title, 
//             source: record.source,
//             type: record.type,
//             region: record.region
//           },
//           record,
//           { upsert: true, returnDocument: 'after' }
//         );
//         saved++;
//       }

//       console.log(`   ✅ Saved ${saved} trends to database for ${targetRegion}`);
//     }

//     console.log("\n" + "=".repeat(70));
//     console.log(`✅ Trend Sync Complete for ${targetRegion}!`);
//     console.log("=".repeat(70) + "\n");

//     return res.status(200).json({
//       success: true,
//       message: `Trend sync completed for ${targetRegion}`,
//       stats: {
//         processed: rawTrends.length,
//         validated,
//         rejected,
//         movies,
//         actors,
//         topics,
//         saved: trendingRecords.length,
//         region: targetRegion
//       },
//       validatedData: validatedDetails,
//       rejectedData: rejectedDetails.length > 0 ? rejectedDetails : undefined
//     });
//   } catch (error) {
//     console.error("❌ Sync Pipeline Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Sync failed",
//       error: error.message,
//       region: targetRegion
//     });
//   }
// }


// POST /api/trending/sync
// Fetches trends from all sources, validates against database, enriches, and stores
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import Article from "../../../model/article";
// import Celebrity from "../../../model/celebrity";
// import { fetchAllTrends } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";
// import redis, { cacheManager } from "../../../lib/redis";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

// // Optimized batch processing with concurrency control
// const CONCURRENT_LIMIT = 20; // Process 20 items concurrently
// const REDIS_CACHE_TTL = 600; // 10 minutes cache for validation results (in seconds)   

// // Cache for validation results to avoid duplicate processing
// const validationCache = new Map();

// /**
//  * Enrich validated trend with TMDB or local database content
//  */
// async function enrichTrendDataBatch(trends, validations) {
//   const enrichmentPromises = trends.map(async (trend, index) => {
//     const validation = validations[index];
//     if (!validation.isValid) return null;

//     try {
//       let enrichedData = {
//         ...trend,
//         title: validation.title,
//         referenceId: validation.referenceId,
//         referenceModel: validation.type === "trending_movies" ? "Article" : validation.type === "trending_actors" ? "Celebrity" : null,
//         metadata: trend.metadata || {}
//       };

//       // TMDB Data enrichment
//       if (validation.tmdbData) {
//         const tmdb = validation.tmdbData;
//         if (validation.type === "trending_movies") {
//           enrichedData.metadata = {
//             ...enrichedData.metadata,
//             movieTitle: tmdb.title,
//             releaseDate: tmdb.releaseDate,
//             overview: tmdb.overview?.substring(0, 500),
//             rating: tmdb.rating,
//             coverImage: tmdb.image,
//             tmdbPopularity: tmdb.popularity
//           };
//         } else if (validation.type === "trending_actors") {
//           enrichedData.metadata = {
//             ...enrichedData.metadata,
//             actorName: tmdb.title,
//             knownFor: tmdb.knownFor?.slice(0, 3).join(", "),
//             profileImage: tmdb.image,
//             tmdbPopularity: tmdb.popularity
//           };
//         }
//       }

//       return enrichedData;
//     } catch (error) {
//       console.error(`Enrichment error for ${trend.title}:`, error.message);
//       return null;
//     }
//   });

//   const enrichedResults = await Promise.all(enrichmentPromises);
//   return enrichedResults.filter(result => result !== null);
// }

// /**
//  * Bulk database enrichment for movies and celebrities
//  */
// async function bulkDatabaseEnrichment(enrichedData) {
//   // Separate movie and celebrity IDs
//   const movieIds = [];
//   const celebrityIds = [];
  
//   enrichedData.forEach(item => {
//     if (item.referenceModel === 'Article' && item.referenceId) {
//       movieIds.push(item.referenceId);
//     } else if (item.referenceModel === 'Celebrity' && item.referenceId) {
//       celebrityIds.push(item.referenceId);
//     }
//   });

//   // Fetch all movies and celebrities in parallel with limited fields
//   const [movies, celebrities] = await Promise.all([
//     movieIds.length > 0 
//       ? Article.find({ _id: { $in: movieIds } })
//           .select('movieTitle slug coverImage releaseYear director genres stats')
//           .lean() // Use lean() for better performance
//       : [],
//     celebrityIds.length > 0
//       ? Celebrity.find({ _id: { $in: celebrityIds } })
//           .select('heroSection.name heroSection.slug heroSection.industry heroSection.profileImage quickFacts.age netWorth.netWorthUSD')
//           .lean()
//       : []
//   ]);

//   // Create maps for quick lookup
//   const movieMap = new Map(movies.map(m => [m._id.toString(), m]));
//   const celebrityMap = new Map(celebrities.map(c => [c._id.toString(), c]));

//   // Enrich each item with local data
//   for (const item of enrichedData) {
//     if (item.referenceModel === 'Article' && item.referenceId) {
//       const movie = movieMap.get(item.referenceId.toString());
//       if (movie) {
//         item.metadata = {
//           ...item.metadata,
//           localSlug: movie.slug,
//           localTitle: movie.movieTitle,
//           director: movie.director?.[0] || "N/A",
//           genres: movie.genres?.slice(0, 3).join(", ") || "N/A",
//           boxOffice: movie.stats?.worldwide || "N/A",
//         };
//         if (movie.coverImage && !item.metadata.coverImage) {
//           item.metadata.coverImage = movie.coverImage;
//         }
//       }
//     } else if (item.referenceModel === 'Celebrity' && item.referenceId) {
//       const celebrity = celebrityMap.get(item.referenceId.toString());
//       if (celebrity) {
//         item.metadata = {
//           ...item.metadata,
//           localSlug: celebrity.heroSection?.slug,
//           localName: celebrity.heroSection?.name,
//           industry: celebrity.heroSection?.industry,
//           age: celebrity.quickFacts?.age,
//           netWorth: celebrity.netWorth?.netWorthUSD?.display,
//         };
//         if (celebrity.heroSection?.profileImage && !item.metadata.profileImage) {
//           item.metadata.profileImage = celebrity.heroSection.profileImage;
//         }
//       }
//     }
//   }

//   return enrichedData;
// }

// /**
//  * Calculate trend score (optimized)
//  */
// function calculateScore(trend) {
//   let score = 0;

//   // Traffic contribution (40%)
//   const traffic = trend.traffic || 0;
//   if (traffic > 1000000) score += 40;
//   else if (traffic > 500000) score += 30;
//   else if (traffic > 100000) score += 20;
//   else if (traffic > 50000) score += 10;

//   // View count contribution (30%)
//   const viewCount = trend.viewCount || 0;
//   if (viewCount > 10000000) score += 30;
//   else if (viewCount > 5000000) score += 20;
//   else if (viewCount > 1000000) score += 10;
//   else if (viewCount > 500000) score += 5;

//   // Recency contribution (20%)
//   const hoursSinceTrend = (Date.now() - new Date(trend.timestamp).getTime()) / (1000 * 60 * 60);
//   if (hoursSinceTrend < 6) score += 20;
//   else if (hoursSinceTrend < 24) score += 15;
//   else if (hoursSinceTrend < 48) score += 10;
//   else if (hoursSinceTrend < 72) score += 5;

//   // Classification confidence (10%)
//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

//   // TMDB Popularity Boost (Max 10%)
//   const tmdbPop = trend.metadata?.tmdbPopularity;
//   if (tmdbPop) {
//     if (tmdbPop > 100) score += 10;
//     else if (tmdbPop > 50) score += 7;
//     else if (tmdbPop > 20) score += 5;
//     else if (tmdbPop > 5) score += 2;
//   }

//   return Math.min(score, 100);
// }

// /**
//  * Process batch of trends with concurrency control
//  */
// async function processBatchWithConcurrency(trends, batchSize = CONCURRENT_LIMIT) {
//   const results = [];
  
//   for (let i = 0; i < trends.length; i += batchSize) {
//     const batch = trends.slice(i, i + batchSize);
    
//     // Process batch concurrently
//     const batchResults = await Promise.all(
//       batch.map(async (rawTrend) => {
//         try {
//           // Check cache first
//           const cacheKey = `trend_validation_${rawTrend.title}_${rawTrend.source}`;
//           let validation = validationCache.get(cacheKey);
          
//           if (!validation) {
//             const preprocessed = await preprocessTrend(rawTrend);
//             validation = await validateTrend(preprocessed);
            
//             // Cache validation result
//             if (validation.isValid) {
//               validationCache.set(cacheKey, validation);
//               // Limit cache size
//               if (validationCache.size > 1000) {
//                 const firstKey = validationCache.keys().next().value;
//                 validationCache.delete(firstKey);
//               }
//             }
//           }
          
//           return {
//             rawTrend,
//             validation,
//             preprocessed: validation.preprocessed || rawTrend
//           };
//         } catch (error) {
//           return {
//             rawTrend,
//             validation: { isValid: false, reason: error.message },
//             error: error.message
//           };
//         }
//       })
//     );
    
//     results.push(...batchResults);
//   }
  
//   return results;
// }

// export default async function handler(req, res) {
//   const startTime = Date.now();
  
//   // Get region from query parameter
//   const { region } = req.query;
  
//   const validRegions = ["IN", "US"];
//   let targetRegion = "IN";
  
//   if (region && validRegions.includes(region.toUpperCase())) {
//     targetRegion = region.toUpperCase();
//   } else if (region && !validRegions.includes(region.toUpperCase())) {
//     return res.status(400).json({ 
//       success: false, 
//       message: `Invalid region. Supported regions: ${validRegions.join(", ")}`,
//       supportedRegions: validRegions
//     });
//   }

//   // Authentication check
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
//     console.log(`🚀 Starting Optimized Trend Sync for Region: ${targetRegion}`);
//     console.log("=".repeat(70));

//     // Step 1: Fetch raw trends (with Redis caching)
//     console.log(`\n📊 Step 1: Fetching trends for ${targetRegion}...`);
//     const fetchStart = Date.now();
    
//     const rawTrends = await cacheManager(
//       `trends_raw_${targetRegion}`,
//       REDIS_CACHE_TTL,
//       async () => await fetchAllTrends(targetRegion)
//     );
    
//     console.log(`   ✅ Fetched ${rawTrends.length} trends in ${Date.now() - fetchStart}ms`);

//     if (rawTrends.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: `No trends found for ${targetRegion}`,
//         stats: { 
//           processed: 0, 
//           validated: 0, 
//           rejected: 0, 
//           movies: 0, 
//           actors: 0, 
//           topics: 0,
//           region: targetRegion,
//           executionTime: `${Date.now() - startTime}ms`
//         }
//       });
//     }

//     // Step 2: Process and validate in parallel
//     console.log("\n🔍 Step 2: Processing and validating trends...");
//     const validateStart = Date.now();
    
//     const processedResults = await processBatchWithConcurrency(rawTrends);
    
//     console.log(`   ✅ Validated ${processedResults.length} trends in ${Date.now() - validateStart}ms`);

//     // Separate valid and invalid trends
//     const validTrends = [];
//     const invalidTrends = [];
    
//     for (const result of processedResults) {
//       if (result.validation.isValid) {
//         validTrends.push(result);
//       } else {
//         invalidTrends.push({
//           title: result.rawTrend.title,
//           reason: result.validation.reason || "No matching content"
//         });
//       }
//     }

//     console.log(`   Valid: ${validTrends.length}, Invalid: ${invalidTrends.length}`);

//     if (validTrends.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: `No valid trends found for ${targetRegion}`,
//         stats: {
//           processed: rawTrends.length,
//           validated: 0,
//           rejected: rawTrends.length,
//           movies: 0,
//           actors: 0,
//           topics: 0,
//           saved: 0,
//           region: targetRegion,
//           executionTime: `${Date.now() - startTime}ms`
//         },
//         rejectedData: invalidTrends.slice(0, 100) // Limit rejected data
//       });
//     }

//     // Step 3: Enrich trends
//     console.log("\n✨ Step 3: Enriching trends...");
//     const enrichStart = Date.now();
    
//     const enrichedTrends = await enrichTrendDataBatch(
//       validTrends.map(v => v.rawTrend),
//       validTrends.map(v => v.validation)
//     );
    
//     // Step 4: Bulk database enrichment
//     const dbEnrichedTrends = await bulkDatabaseEnrichment(enrichedTrends);
    
//     console.log(`   ✅ Enriched ${dbEnrichedTrends.length} trends in ${Date.now() - enrichStart}ms`);

//     // Step 5: Calculate scores and prepare for database
//     const trendingRecords = [];
//     const validatedDetails = [];
//     let movies = 0, actors = 0, topics = 0;
    
//     for (let i = 0; i < dbEnrichedTrends.length; i++) {
//       const trend = dbEnrichedTrends[i];
//       const validation = validTrends[i].validation;
//       const rawTrend = validTrends[i].rawTrend;
      
//       const score = calculateScore(trend);
      
//       const trendRecord = {
//         title: validation.title,
//         originalTitle: rawTrend.title,
//         type: validation.type,
//         entityType: validation.entityType,
//         referenceId: validation.referenceId,
//         referenceModel: validation.referenceModel,
//         slug: validation.slug,
//         source: rawTrend.source || "manual",
//         traffic: rawTrend.traffic || 0,
//         viewCount: rawTrend.viewCount || 0,
//         keywords: rawTrend.keywords || [],
//         classificationConfidence: rawTrend.classificationConfidence || 0.5,
//         status: "active",
//         region: targetRegion,
//         trendTimestamp: new Date(rawTrend.timestamp || Date.now()),
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         metadata: trend.metadata,
//         score: score,
//         updatedAt: new Date()
//       };
      
//       trendingRecords.push(trendRecord);
//       validatedDetails.push({
//         title: trendRecord.title,
//         type: trendRecord.type,
//         score: score,
//         region: targetRegion
//       });
      
//       if (trendRecord.type === "trending_movies") movies++;
//       else if (trendRecord.type === "trending_actors") actors++;
//       else if (trendRecord.type === "viral_topics") topics++;
//     }

//     // Step 6: Bulk database operations
//     console.log("\n💾 Step 4: Saving to database...");
//     const saveStart = Date.now();
    
//     // Use bulkWrite for better performance
//     if (trendingRecords.length > 0) {
//       // Delete expired trends
//       await Trending.deleteMany({
//         region: targetRegion,
//         expiresAt: { $lt: new Date() }
//       });
      
//       // Prepare bulk operations
//       const bulkOps = trendingRecords.map(record => ({
//         updateOne: {
//           filter: {
//             title: record.title,
//             source: record.source,
//             type: record.type,
//             region: record.region
//           },
//           update: { $set: record },
//           upsert: true
//         }
//       }));
      
//       // Execute bulk write
//       if (bulkOps.length > 0) {
//         const result = await Trending.bulkWrite(bulkOps, { ordered: false });
//         console.log(`   ✅ Saved ${result.upsertedCount + result.modifiedCount} trends in ${Date.now() - saveStart}ms`);
//       }
//     }

//     const totalTime = Date.now() - startTime;
    
//     console.log("\n" + "=".repeat(70));
//     console.log(`✅ Trend Sync Complete for ${targetRegion} in ${totalTime}ms!`);
//     console.log("=".repeat(70) + "\n");

//     return res.status(200).json({
//       success: true,
//       message: `Trend sync completed for ${targetRegion}`,
//       executionTime: `${totalTime}ms`,
//       stats: {
//         processed: rawTrends.length,
//         validated: validTrends.length,
//         rejected: invalidTrends.length,
//         movies,
//         actors,
//         topics,
//         saved: trendingRecords.length,
//         region: targetRegion
//       },
//       validatedData: validatedDetails.slice(0, 20), // Limit response size
//       rejectedData: invalidTrends.slice(0, 50) // Limit rejected data
//     });
    
//   } catch (error) {
//     console.error("❌ Sync Pipeline Error for", targetRegion + ":", error);
//     return res.status(500).json({
//       success: false,
//       message: "Sync failed",
//       error: error.message,
//       region: targetRegion,
//       executionTime: `${Date.now() - startTime}ms`
//     });
//   }
// }


// POST /api/trending/sync
// Optimized API with Redis caching and performance improvements
// import dbConnect from "../../../lib/mongodb";
// import Trending from "../../../model/trending";
// import Article from "../../../model/article";
// import Celebrity from "../../../model/celebrity";
// import { fetchAllTrends } from "../../../lib/trending/data-ingestion";
// import { preprocessTrend } from "../../../lib/trending/preprocessing";
// import { validateTrend } from "../../../lib/trending/validation";
// import redis from "../../../lib/redis";

// const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

// // Optimized configuration
// const CONCURRENT_LIMIT = 30; // Increased to 30 for better throughput
// const REDIS_CACHE_TTL = 600; // 10 minutes
// const VALIDATION_CACHE_TTL = 3600; // 1 hour for validation results
// const BULK_WRITE_SIZE = 100; // Batch size for bulk operations

// // LRU cache for validation results (in-memory for speed)
// class LRUCache {
//   constructor(maxSize = 500) {
//     this.cache = new Map();
//     this.maxSize = maxSize;
//   }

//   get(key) {
//     const item = this.cache.get(key);
//     if (item && Date.now() < item.expiry) {
//       // Refresh - move to end (most recently used)
//       this.cache.delete(key);
//       this.cache.set(key, item);
//       return item.value;
//     }
//     if (item) this.cache.delete(key);
//     return null;
//   }

//   set(key, value, ttlSeconds = 3600) {
//     if (this.cache.size >= this.maxSize) {
//       const firstKey = this.cache.keys().next().value;
//       this.cache.delete(firstKey);
//     }
//     this.cache.set(key, {
//       value,
//       expiry: Date.now() + (ttlSeconds * 1000)
//     });
//   }

//   clear() {
//     this.cache.clear();
//   }
// }

// const validationCache = new LRUCache(500);

// // Helper for Redis operations with error handling
// async function redisGet(key) {
//   try {
//     const value = await redis.get(key);
//     return value ? JSON.parse(value) : null;
//   } catch (error) {
//     console.error(`Redis GET error for ${key}:`, error.message);
//     return null;
//   }
// }

// async function redisSet(key, value, ttl = REDIS_CACHE_TTL) {
//   try {
//     await redis.setex(key, ttl, JSON.stringify(value));
//     return true;
//   } catch (error) {
//     console.error(`Redis SET error for ${key}:`, error.message);
//     return false;
//   }
// }

// async function redisDel(key) {
//   try {
//     await redis.del(key);
//     return true;
//   } catch (error) {
//     console.error(`Redis DEL error for ${key}:`, error.message);
//     return false;
//   }
// }

// /**
//  * Parallel validation with Redis caching
//  */
// async function validateTrendsBatch(trends) {
//   const validationPromises = trends.map(async (rawTrend) => {
//     const cacheKey = `validation:${rawTrend.title}:${rawTrend.source}`;
    
//     // Check in-memory cache first (fastest)
//     let validation = validationCache.get(cacheKey);
    
//     // Check Redis cache if not in memory
//     if (!validation) {
//       validation = await redisGet(cacheKey);
//     }
    
//     if (validation) {
//       return { rawTrend, validation, cached: true };
//     }
    
//     // Perform validation
//     try {
//       const preprocessed = await preprocessTrend(rawTrend);
//       validation = await validateTrend(preprocessed);
      
//       if (validation.isValid) {
//         // Store in both caches
//         validationCache.set(cacheKey, validation, VALIDATION_CACHE_TTL);
//         await redisSet(cacheKey, validation, VALIDATION_CACHE_TTL);
//       }
      
//       return { rawTrend, validation, cached: false };
//     } catch (error) {
//       return { 
//         rawTrend, 
//         validation: { isValid: false, reason: error.message },
//         error: error.message 
//       };
//     }
//   });
  
//   return Promise.all(validationPromises);
// }

// /**
//  * Optimized enrichment with parallel processing
//  */
// async function enrichTrendsBatch(validResults) {
//   const enrichmentPromises = validResults.map(async ({ rawTrend, validation }) => {
//     if (!validation.isValid) return null;

//     const enrichedData = {
//       ...rawTrend,
//       title: validation.title,
//       referenceId: validation.referenceId,
//       referenceModel: validation.type === "trending_movies" ? "Article" : 
//                       validation.type === "trending_actors" ? "Celebrity" : null,
//       metadata: rawTrend.metadata || {},
//       tmdbData: validation.tmdbData || null
//     };

//     // Add TMDB data if available
//     if (validation.tmdbData && validation.type === "trending_movies") {
//       const tmdb = validation.tmdbData;
//       enrichedData.metadata = {
//         ...enrichedData.metadata,
//         movieTitle: tmdb.title,
//         releaseDate: tmdb.releaseDate,
//         overview: tmdb.overview?.substring(0, 300),
//         rating: tmdb.rating,
//         coverImage: tmdb.image,
//         tmdbPopularity: tmdb.popularity
//       };
//     } else if (validation.tmdbData && validation.type === "trending_actors") {
//       const tmdb = validation.tmdbData;
//       enrichedData.metadata = {
//         ...enrichedData.metadata,
//         actorName: tmdb.title,
//         knownFor: tmdb.knownFor?.slice(0, 3).join(", "),
//         profileImage: tmdb.image,
//         tmdbPopularity: tmdb.popularity
//       };
//     }

//     return enrichedData;
//   });

//   const results = await Promise.all(enrichmentPromises);
//   return results.filter(r => r !== null);
// }

// /**
//  * Batch database enrichment (optimized single query)
//  */
// async function enrichWithLocalData(trends) {
//   const movieIds = [];
//   const celebrityIds = [];
  
//   trends.forEach(trend => {
//     if (trend.referenceModel === 'Article' && trend.referenceId) {
//       movieIds.push(trend.referenceId);
//     } else if (trend.referenceModel === 'Celebrity' && trend.referenceId) {
//       celebrityIds.push(trend.referenceId);
//     }
//   });

//   // Parallel queries with lean() for performance
//   const [movies, celebrities] = await Promise.all([
//     movieIds.length ? Article.find({ _id: { $in: [...new Set(movieIds)] } })
//       .select('movieTitle slug coverImage releaseYear director genres stats')
//       .lean() : [],
//     celebrityIds.length ? Celebrity.find({ _id: { $in: [...new Set(celebrityIds)] } })
//       .select('heroSection.name heroSection.slug heroSection.industry heroSection.profileImage quickFacts.age netWorth.netWorthUSD')
//       .lean() : []
//   ]);

//   // Create maps for O(1) lookup
//   const movieMap = new Map(movies.map(m => [m._id.toString(), m]));
//   const celebrityMap = new Map(celebrities.map(c => [c._id.toString(), c]));

//   // Single-pass enrichment
//   for (const trend of trends) {
//     if (trend.referenceModel === 'Article' && trend.referenceId) {
//       const movie = movieMap.get(trend.referenceId.toString());
//       if (movie) {
//         Object.assign(trend.metadata, {
//           localSlug: movie.slug,
//           localTitle: movie.movieTitle,
//           director: movie.director?.[0] || "N/A",
//           genres: movie.genres?.slice(0, 3).join(", ") || "N/A",
//           boxOffice: movie.stats?.worldwide || "N/A",
//           coverImage: trend.metadata.coverImage || movie.coverImage
//         });
//       }
//     } else if (trend.referenceModel === 'Celebrity' && trend.referenceId) {
//       const celebrity = celebrityMap.get(trend.referenceId.toString());
//       if (celebrity && celebrity.heroSection) {
//         Object.assign(trend.metadata, {
//           localSlug: celebrity.heroSection.slug,
//           localName: celebrity.heroSection.name,
//           industry: celebrity.heroSection.industry,
//           age: celebrity.quickFacts?.age,
//           netWorth: celebrity.netWorth?.netWorthUSD?.display,
//           profileImage: trend.metadata.profileImage || celebrity.heroSection.profileImage
//         });
//       }
//     }
//   }

//   return trends;
// }

// /**
//  * Fast score calculation (pre-compute thresholds)
//  */
// const SCORE_THRESHOLDS = {
//   traffic: [{ min: 1000000, score: 40 }, { min: 500000, score: 30 }, { min: 100000, score: 20 }, { min: 50000, score: 10 }],
//   viewCount: [{ min: 10000000, score: 30 }, { min: 5000000, score: 20 }, { min: 1000000, score: 10 }, { min: 500000, score: 5 }],
//   tmdbPopularity: [{ min: 100, score: 10 }, { min: 50, score: 7 }, { min: 20, score: 5 }, { min: 5, score: 2 }]
// };

// function calculateTrendScore(trend) {
//   let score = 0;
//   const now = Date.now();

//   // Traffic score
//   const traffic = trend.traffic || 0;
//   for (const threshold of SCORE_THRESHOLDS.traffic) {
//     if (traffic >= threshold.min) {
//       score += threshold.score;
//       break;
//     }
//   }

//   // View count score
//   const viewCount = trend.viewCount || 0;
//   for (const threshold of SCORE_THRESHOLDS.viewCount) {
//     if (viewCount >= threshold.min) {
//       score += threshold.score;
//       break;
//     }
//   }

//   // Recency score (optimized)
//   const hoursSinceTrend = (now - new Date(trend.trendTimestamp || trend.timestamp).getTime()) / 3600000;
//   if (hoursSinceTrend < 6) score += 20;
//   else if (hoursSinceTrend < 24) score += 15;
//   else if (hoursSinceTrend < 48) score += 10;
//   else if (hoursSinceTrend < 72) score += 5;

//   // Classification confidence
//   score += Math.round((trend.classificationConfidence || 0.5) * 10);

//   // TMDB Popularity Boost
//   const tmdbPop = trend.metadata?.tmdbPopularity;
//   if (tmdbPop) {
//     for (const threshold of SCORE_THRESHOLDS.tmdbPopularity) {
//       if (tmdbPop >= threshold.min) {
//         score += threshold.score;
//         break;
//       }
//     }
//   }

//   return Math.min(score, 100);
// }

// /**
//  * Bulk database upsert with chunking
//  */
// async function bulkUpsertTrends(trends, region) {
//   if (!trends.length) return 0;

//   // Delete expired trends first (single operation)
//   await Trending.deleteMany({
//     region: region,
//     expiresAt: { $lt: new Date() }
//   });

//   // Prepare bulk operations
//   const bulkOps = trends.map(trend => ({
//     updateOne: {
//       filter: {
//         title: trend.title,
//         source: trend.source,
//         type: trend.type,
//         region: trend.region
//       },
//       update: { $set: trend },
//       upsert: true
//     }
//   }));

//   // Process in chunks to avoid memory issues
//   let totalModified = 0;
//   for (let i = 0; i < bulkOps.length; i += BULK_WRITE_SIZE) {
//     const chunk = bulkOps.slice(i, i + BULK_WRITE_SIZE);
//     const result = await Trending.bulkWrite(chunk, { ordered: false });
//     totalModified += result.modifiedCount + result.upsertedCount;
//   }

//   return totalModified;
// }

// export default async function handler(req, res) {
//   const startTime = Date.now();
  
//   // Parse region
//   const { region } = req.query;
//   const targetRegion = (region && ["IN", "US"].includes(region.toUpperCase())) 
//     ? region.toUpperCase() 
//     : "IN";

//   // Authentication (only for POST)
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

//     console.log(`\n🚀 Trend Sync [${targetRegion}] started`);

//     // Check if sync is already running (prevent concurrent runs)
//     const syncLockKey = `sync:lock:${targetRegion}`;
//     const isLocked = await redisGet(syncLockKey);
//     if (isLocked) {
//       return res.status(409).json({
//         success: false,
//         message: `Sync already in progress for ${targetRegion}`,
//         executionTime: `${Date.now() - startTime}ms`
//       });
//     }

//     // Set lock with 5-minute expiry
//     await redisSet(syncLockKey, true, 300);

//     // Fetch raw trends with Redis caching
//     const cacheKey = `trends:raw:${targetRegion}`;
//     let rawTrends = await redisGet(cacheKey);
    
//     if (!rawTrends) {
//       rawTrends = await fetchAllTrends(targetRegion);
//       await redisSet(cacheKey, rawTrends, REDIS_CACHE_TTL);
//     }

//     if (!rawTrends || rawTrends.length === 0) {
//       await redisDel(syncLockKey);
//       return res.status(200).json({
//         success: true,
//         message: `No trends found for ${targetRegion}`,
//         stats: { processed: 0, validated: 0, region: targetRegion, executionTime: `${Date.now() - startTime}ms` }
//       });
//     }

//     console.log(`📊 Fetched ${rawTrends.length} trends`);

//     // Validate trends in parallel
//     const validatedResults = await validateTrendsBatch(rawTrends);
    
//     const validResults = validatedResults.filter(r => r.validation.isValid);
//     const invalidCount = validatedResults.length - validResults.length;

//     console.log(`✅ Valid: ${validResults.length}, Invalid: ${invalidCount}`);

//     if (validResults.length === 0) {
//       await redisDel(syncLockKey);
//       return res.status(200).json({
//         success: true,
//         message: `No valid trends for ${targetRegion}`,
//         stats: { processed: rawTrends.length, validated: 0, region: targetRegion, executionTime: `${Date.now() - startTime}ms` }
//       });
//     }

//     // Enrich trends
//     let enrichedTrends = await enrichTrendsBatch(validResults);
//     enrichedTrends = await enrichWithLocalData(enrichedTrends);

//     // Prepare records with scores
//     const now = new Date();
//     const trendingRecords = [];
//     let movies = 0, actors = 0, topics = 0;

//     for (let i = 0; i < enrichedTrends.length; i++) {
//       const trend = enrichedTrends[i];
//       const validation = validResults[i].validation;
//       const rawTrend = validResults[i].rawTrend;

//       const score = calculateTrendScore({
//         ...trend,
//         trendTimestamp: rawTrend.timestamp,
//         classificationConfidence: rawTrend.classificationConfidence
//       });

//       const record = {
//         title: validation.title,
//         originalTitle: rawTrend.title,
//         type: validation.type,
//         entityType: validation.entityType,
//         referenceId: validation.referenceId,
//         referenceModel: validation.referenceModel,
//         slug: validation.slug,
//         source: rawTrend.source || "manual",
//         traffic: rawTrend.traffic || 0,
//         viewCount: rawTrend.viewCount || 0,
//         keywords: rawTrend.keywords || [],
//         classificationConfidence: rawTrend.classificationConfidence || 0.5,
//         status: "active",
//         region: targetRegion,
//         trendTimestamp: new Date(rawTrend.timestamp || Date.now()),
//         expiresAt: new Date(Date.now() + 7 * 24 * 3600000),
//         metadata: trend.metadata,
//         score: score,
//         updatedAt: now
//       };

//       trendingRecords.push(record);
      
//       if (record.type === "trending_movies") movies++;
//       else if (record.type === "trending_actors") actors++;
//       else if (record.type === "viral_topics") topics++;
//     }

//     // Save to database
//     const savedCount = await bulkUpsertTrends(trendingRecords, targetRegion);
    
//     // Invalidate cache
//     await redisDel(cacheKey);
//     await redisDel(`trending:list:${targetRegion}`);
//     await redisDel(syncLockKey);

//     const executionTime = `${Date.now() - startTime}ms`;
//     console.log(`✅ Sync complete in ${executionTime}`);

//     return res.status(200).json({
//       success: true,
//       message: `Trend sync completed for ${targetRegion}`,
//       executionTime,
//       stats: {
//         processed: rawTrends.length,
//         validated: validResults.length,
//         rejected: invalidCount,
//         movies,
//         actors,
//         topics,
//         saved: savedCount,
//         region: targetRegion
//       }
//     });

//   } catch (error) {
//     console.error(`❌ Sync failed for ${targetRegion}:`, error);
    
//     // Clean up lock on error
//     try {
//       await redis.del(`sync:lock:${targetRegion}`);
//     } catch (e) {}
    
//     return res.status(500).json({
//       success: false,
//       message: "Sync failed",
//       error: error.message,
//       region: targetRegion,
//       executionTime: `${Date.now() - startTime}ms`
//     });
//   }
// }



// POST /api/trending/sync
// Optimized API with Redis caching and Hollywood/Bollywood support
import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";
import { fetchAllTrends } from "../../../lib/trending/data-ingestion";
import { preprocessTrend } from "../../../lib/trending/preprocessing";
import { validateTrend } from "../../../lib/trending/validation";
import redis from "../../../lib/redis";

const CRON_SECRET = process.env.CRON_SECRET || "filmyfire_automation_secret_2026";

// Configuration
const CONCURRENT_LIMIT = 30;
const REDIS_CACHE_TTL = 600; // 10 minutes
const VALIDATION_CACHE_TTL = 3600; // 1 hour
const BULK_WRITE_SIZE = 100;

// LRU Cache for validation results
class LRUCache {
  constructor(maxSize = 500) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() < item.expiry) {
      this.cache.delete(key);
      this.cache.set(key, item);
      return item.value;
    }
    if (item) this.cache.delete(key);
    return null;
  }

  set(key, value, ttlSeconds = 3600) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }
}

const validationCache = new LRUCache(500);

// Redis helpers
async function redisGet(key) {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Redis GET error:`, error.message);
    return null;
  }
}

async function redisSet(key, value, ttl = REDIS_CACHE_TTL) {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Redis SET error:`, error.message);
    return false;
  }
}

async function redisDel(key) {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis DEL error:`, error.message);
    return false;
  }
}

/**
 * Parallel validation with region support
 */
async function validateTrendsBatch(trends, region) {
  const validationPromises = trends.map(async (rawTrend) => {
    const cacheKey = `validation:${region}:${rawTrend.title}:${rawTrend.source}`;
    
    let validation = validationCache.get(cacheKey);
    if (!validation) {
      validation = await redisGet(cacheKey);
    }
    
    if (validation) {
      return { rawTrend, validation, cached: true };
    }
    
    try {
      const preprocessed = await preprocessTrend(rawTrend);
      validation = await validateTrend(preprocessed, region);
      
      if (validation.isValid) {
        validationCache.set(cacheKey, validation, VALIDATION_CACHE_TTL);
        await redisSet(cacheKey, validation, VALIDATION_CACHE_TTL);
      }
      
      return { rawTrend, validation, cached: false };
    } catch (error) {
      return { 
        rawTrend, 
        validation: { isValid: false, reason: error.message },
        error: error.message 
      };
    }
  });
  
  return Promise.all(validationPromises);
}

/**
 * Enrich trends with region data
 */
async function enrichTrendsBatch(validResults, region) {
  const enrichmentPromises = validResults.map(async ({ rawTrend, validation }) => {
    if (!validation.isValid) return null;

    const enrichedData = {
      ...rawTrend,
      title: validation.title,
      referenceId: validation.referenceId,
      referenceModel: validation.type === "trending_movies" ? "Article" : 
                      validation.type === "trending_actors" ? "Celebrity" : null,
      metadata: {
        ...rawTrend.metadata,
        region: region,
        contentType: region === "IN" ? "bollywood" : "hollywood"
      },
      tmdbData: validation.tmdbData || null
    };

    if (validation.tmdbData && validation.type === "trending_movies") {
      const tmdb = validation.tmdbData;
      enrichedData.metadata = {
        ...enrichedData.metadata,
        movieTitle: tmdb.title,
        originalTitle: tmdb.original_title,
        releaseDate: tmdb.release_date,
        overview: tmdb.overview?.substring(0, 300),
        rating: tmdb.vote_average,
        voteCount: tmdb.vote_count,
        coverImage: tmdb.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : null,
        backdropImage: tmdb.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdb.backdrop_path}` : null,
        tmdbPopularity: tmdb.popularity,
        language: tmdb.original_language,
        isHollywood: region === "US" || tmdb.original_language === "en"
      };
    } else if (validation.tmdbData && validation.type === "trending_actors") {
      const tmdb = validation.tmdbData;
      enrichedData.metadata = {
        ...enrichedData.metadata,
        actorName: tmdb.name,
        knownFor: tmdb.known_for?.slice(0, 3).map(film => film.title || film.name).join(", "),
        profileImage: tmdb.profile_path ? `https://image.tmdb.org/t/p/w500${tmdb.profile_path}` : null,
        tmdbPopularity: tmdb.popularity,
        knownForDepartment: tmdb.known_for_department,
        isHollywood: region === "US"
      };
    }

    return enrichedData;
  });

  const results = await Promise.all(enrichmentPromises);
  return results.filter(r => r !== null);
}

/**
 * Calculate trend score with region weights
 */
function calculateTrendScore(trend, region) {
  let score = 0;
  const now = Date.now();

  const traffic = trend.traffic || 0;
  if (traffic >= 1000000) score += 40;
  else if (traffic >= 500000) score += 30;
  else if (traffic >= 100000) score += 20;
  else if (traffic >= 50000) score += 10;

  const viewCount = trend.viewCount || 0;
  if (viewCount >= 10000000) score += 30;
  else if (viewCount >= 5000000) score += 20;
  else if (viewCount >= 1000000) score += 10;
  else if (viewCount >= 500000) score += 5;

  const hoursSinceTrend = (now - new Date(trend.trendTimestamp || trend.timestamp).getTime()) / 3600000;
  if (hoursSinceTrend < 6) score += 20;
  else if (hoursSinceTrend < 24) score += 15;
  else if (hoursSinceTrend < 48) score += 10;
  else if (hoursSinceTrend < 72) score += 5;

  score += Math.round((trend.classificationConfidence || 0.5) * 10);

  if (region === "US") {
    const tmdbPop = trend.metadata?.tmdbPopularity;
    if (tmdbPop) {
      if (tmdbPop >= 100) score += 15;
      else if (tmdbPop >= 50) score += 10;
      else if (tmdbPop >= 20) score += 7;
      else if (tmdbPop >= 5) score += 3;
    }
    if (trend.metadata?.language === "en" || trend.metadata?.isHollywood) {
      score += 5;
    }
  } else {
    const tmdbPop = trend.metadata?.tmdbPopularity;
    if (tmdbPop) {
      if (tmdbPop >= 50) score += 10;
      else if (tmdbPop >= 20) score += 7;
      else if (tmdbPop >= 5) score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Bulk database upsert
 */
async function bulkUpsertTrends(trends, region) {
  if (!trends.length) return 0;

  await Trending.deleteMany({
    region: region,
    expiresAt: { $lt: new Date() }
  });

  const bulkOps = trends.map(trend => ({
    updateOne: {
      filter: {
        title: trend.title,
        source: trend.source,
        type: trend.type,
        region: trend.region
      },
      update: { $set: trend },
      upsert: true
    }
  }));

  let totalSaved = 0;
  for (let i = 0; i < bulkOps.length; i += BULK_WRITE_SIZE) {
    const chunk = bulkOps.slice(i, i + BULK_WRITE_SIZE);
    const result = await Trending.bulkWrite(chunk, { ordered: false });
    totalSaved += result.modifiedCount + result.upsertedCount;
  }

  return totalSaved;
}

export default async function handler(req, res) {
  const startTime = Date.now();
  
  const { region } = req.query;
  let targetRegion = "IN";
  
  if (region && region.toUpperCase() === "US") {
    targetRegion = "US";
  } else if (region && region.toUpperCase() === "IN") {
    targetRegion = "IN";
  }

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

    const regionName = targetRegion === "IN" ? "Bollywood" : "Hollywood";
    console.log(`\n🎬 Starting ${regionName} Trend Sync`);

    const syncLockKey = `sync:lock:${targetRegion}`;
    const isLocked = await redisGet(syncLockKey);
    if (isLocked) {
      return res.status(409).json({
        success: false,
        message: `${regionName} sync already in progress`,
        executionTime: `${Date.now() - startTime}ms`
      });
    }

    await redisSet(syncLockKey, true, 300);

    const cacheKey = `trends:raw:${targetRegion}`;
    let rawTrends = await redisGet(cacheKey);
    
    if (!rawTrends) {
      console.log(`📊 Fetching ${regionName} trends...`);
      rawTrends = await fetchAllTrends(targetRegion);
      await redisSet(cacheKey, rawTrends, REDIS_CACHE_TTL);
    }

    if (!rawTrends || rawTrends.length === 0) {
      await redisDel(syncLockKey);
      return res.status(200).json({
        success: true,
        message: `No ${regionName} trends found`,
        stats: { 
          processed: 0, 
          validated: 0, 
          region: targetRegion,
          regionName,
          executionTime: `${Date.now() - startTime}ms` 
        }
      });
    }

    console.log(`📊 Fetched ${rawTrends.length} ${regionName} trends`);

    const validatedResults = await validateTrendsBatch(rawTrends, targetRegion);
    
    const validResults = validatedResults.filter(r => r.validation.isValid);
    const invalidResults = validatedResults.filter(r => !r.validation.isValid);

    console.log(`✅ Validated: ${validResults.length} / ${rawTrends.length}`);
    
    if (invalidResults.length > 0) {
      console.log(`❌ Sample invalid:`, 
        invalidResults.slice(0, 3).map(r => ({ 
          title: r.rawTrend.title, 
          reason: r.validation.reason 
        }))
      );
    }

    if (validResults.length === 0) {
      await redisDel(syncLockKey);
      return res.status(200).json({
        success: true,
        message: `No valid ${regionName} trends found`,
        stats: {
          processed: rawTrends.length,
          validated: 0,
          rejected: rawTrends.length,
          region: targetRegion,
          regionName,
          executionTime: `${Date.now() - startTime}ms`
        },
        debug: {
          sampleInvalid: invalidResults.slice(0, 5).map(r => ({
            title: r.rawTrend.title,
            reason: r.validation.reason
          }))
        }
      });
    }

    let enrichedTrends = await enrichTrendsBatch(validResults, targetRegion);

    const now = new Date();
    const trendingRecords = [];
    let movies = 0, actors = 0, topics = 0;

    for (let i = 0; i < enrichedTrends.length; i++) {
      const trend = enrichedTrends[i];
      const validation = validResults[i].validation;
      const rawTrend = validResults[i].rawTrend;

      // Only add record if it has a valid referenceId!
      if (!validation.referenceId) continue;

      const score = calculateTrendScore({
        ...trend,
        trendTimestamp: rawTrend.timestamp,
        classificationConfidence: rawTrend.classificationConfidence
      }, targetRegion);

      const record = {
        title: validation.title,
        originalTitle: rawTrend.title,
        type: validation.type,
        entityType: validation.entityType,
        referenceId: validation.referenceId,
        referenceModel: validation.referenceModel,
        slug: validation.slug,
        source: rawTrend.source || "manual",
        traffic: rawTrend.traffic || 0,
        viewCount: rawTrend.viewCount || 0,
        keywords: rawTrend.keywords || [],
        classificationConfidence: rawTrend.classificationConfidence || 0.5,
        status: "active",
        region: targetRegion,
        regionName: regionName,
        contentType: validation.contentType || (targetRegion === "US" ? "hollywood" : "bollywood"),
        trendTimestamp: new Date(rawTrend.timestamp || Date.now()),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600000),
        metadata: trend.metadata,
        score: score,
        updatedAt: now,
        isValidated: true
      };

      trendingRecords.push(record);
      
      if (record.type === "trending_movies") movies++;
      else if (record.type === "trending_actors") actors++;
      else if (record.type === "viral_topics") topics++;
    }

    const savedCount = await bulkUpsertTrends(trendingRecords, targetRegion);
    
    await redisDel(cacheKey);
    await redisDel(`trending:list:${targetRegion}`);
    await redisDel(syncLockKey);

    const executionTime = `${Date.now() - startTime}ms`;
    console.log(`✅ ${regionName} sync complete in ${executionTime}`);
    console.log(`📊 Stats: Movies: ${movies}, Actors: ${actors}, Topics: ${topics}`);

    return res.status(200).json({
      success: true,
      message: `${regionName} trend sync completed`,
      executionTime,
      stats: {
        processed: rawTrends.length,
        validated: validResults.length,
        rejected: invalidResults.length,
        movies,
        actors,
        topics,
        saved: savedCount,
        region: targetRegion,
        regionName
      },
      sample: trendingRecords.slice(0, 5).map(t => ({
        title: t.title,
        type: t.type,
        score: t.score,
        contentType: t.contentType
      }))
    });

  } catch (error) {
    console.error(`❌ Sync failed:`, error);
    
    try {
      await redis.del(`sync:lock:${targetRegion}`);
    } catch (e) {}
    
    return res.status(500).json({
      success: false,
      message: "Sync failed",
      error: error.message,
      executionTime: `${Date.now() - startTime}ms`
    });
  }
}