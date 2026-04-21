// Trend Validation Service
// Validates trends using TMDB and local database
import dbConnect from "../mongodb";
import Article from "../../model/article";
import Celebrity from "../../model/celebrity";
import { searchTMDBMovie, searchTMDBPerson } from "../api-clients/tmdb";

/**
 * Enhanced title cleaning for movie/actor matching
 */
export function getCoreTitle(title) {
  if (!title) return "";
  
  // 1. Remove common noise words/patterns
  let clean = title.replace(/Official Trailer|Teaser|Full Movie|HD|202[0-9]|Lyric Video|Video Song|Lyrical|Trailer|Teaser|Promo/gi, '');
  
  // 2. Split by common separators and take the first part
  const separators = ['|', '-', ':', '–', '—'];
  for (const sep of separators) {
    if (clean.includes(sep)) {
      const parts = clean.split(sep);
      if (parts[0].trim().length > 2) {
        clean = parts[0];
        break;
      }
    }
  }
  
  return clean.trim();
}

/**
 * Strict validation pipeline:
 * Step 1: Relevance Check (from Preprocessing)
 * Step 2: TMDB Movie search
 * Step 3: TMDB Person search
 * Step 4: Local DB check (to link to existing content)
 * Step 5: Fallback to viral_topics (if relevant)
 */
export async function validateTrend(trend) {
  const originalTitle = trend.title;
  const coreTitle = trend.coreTitle || getCoreTitle(originalTitle);
  const entityType = trend.entityType;
  const isRelevant = trend.isRelevant !== undefined ? trend.isRelevant : true;

  console.log(`\n🔍 Validating trend: "${originalTitle}" -> Core: "${coreTitle}" (Type: ${entityType})`);

  // --- STEP 1: Relevance Check ---
  if (!isRelevant) {
    console.log(`   ❌ REJECTED: Marked as irrelevant by intelligence system.`);
    return {
      isValid: false,
      reason: "Classified as irrelevant entertainment or non-entertainment topic"
    };
  }

  try {
    // --- STEP 2: TMDB Movie Search (Prioritized if AI says it's a movie) ---
    if (entityType === "movie" || entityType === "topic") {
      const tmdbMovie = await searchTMDBMovie(coreTitle);
      if (tmdbMovie) {
        console.log(`   🎬 TMDB Movie Match: ${tmdbMovie.title}`);
        
        // Check local DB for existing article
        await dbConnect();
        const localMovie = await Article.findOne({
          $or: [
            { tmdbId: tmdbMovie.id },
            { movieTitle: new RegExp(`^${tmdbMovie.title}$`, "i") }
          ]
        }).select("slug _id");

        // ONLY validate if found in local database
        if (localMovie) {
          console.log(`   ✅ VALIDATED: Found in local Articles database`);
          return {
            isValid: true,
            type: "trending_movies",
            entityType: "movie",
            referenceId: localMovie._id.toString(),
            entityId: tmdbMovie.id,
            title: originalTitle,
            slug: localMovie.slug,
            tmdbData: tmdbMovie,
            isLocal: true
          };
        } else {
          console.log(`   ❌ REJECTED: Movie not found in local Articles database`);
        }
      }
    }

    // --- STEP 3: TMDB Person Search (Prioritized if AI says it's an actor) ---
    if (entityType === "actor" || entityType === "topic") {
      const tmdbPerson = await searchTMDBPerson(coreTitle);
      if (tmdbPerson) {
        console.log(`   👤 TMDB Person Match: ${tmdbPerson.title}`);

        // Check local DB for existing celebrity
        await dbConnect();
        const localCelebrity = await Celebrity.findOne({
          $or: [
            { "heroSection.tmdbId": tmdbPerson.id },
            { "heroSection.name": new RegExp(`^${tmdbPerson.title}$`, "i") }
          ]
        }).select("heroSection.slug _id");

        // ONLY validate if found in local database
        if (localCelebrity) {
          console.log(`   ✅ VALIDATED: Found in local Celebrities database`);
          return {
            isValid: true,
            type: "trending_actors",
            entityType: "actor",
            referenceId: localCelebrity._id.toString(),
            entityId: tmdbPerson.id,
            title: originalTitle,
            slug: localCelebrity.heroSection.slug,
            tmdbData: tmdbPerson,
            isLocal: true
          };
        } else {
          console.log(`   ❌ REJECTED: Celebrity not found in local Celebrities database`);
        }
      }
    }

    // --- STEP 4: Fallback to Viral Topics ---
    // If we reached here, it's relevant but no exact TMDB match found
    // REJECT if no local DB match (we only want Bollywood/Hollywood content)
    console.log(`   ❌ REJECTED: No local database match for "${coreTitle}"`);
    return {
      isValid: false,
      type: null,
      entityType: "topic",
      referenceId: null,
      title: originalTitle,
      slug: coreTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      tmdbData: null,
      isLocal: false,
      reason: "No matching content in local database (Articles or Celebrities)"
    };

  } catch (error) {
    console.error(`❌ Validation error for ${originalTitle}:`, error.message);
    return {
      isValid: false,
      reason: error.message
    };
  }
}
