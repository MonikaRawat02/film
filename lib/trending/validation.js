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
 * Step 1: TMDB Movie search
 * Step 2: TMDB Person search
 * Step 3: Local DB check (to link to existing content)
 * Step 4: Fallback to viral_topics
 */
export async function validateTrend(trend) {
  const originalTitle = trend.title;
  const coreTitle = getCoreTitle(originalTitle);

  console.log(`\n🔍 Validating trend: "${originalTitle}" -> Core: "${coreTitle}"`);

  try {
    // --- STEP 1: TMDB Movie Search ---
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

      return {
        isValid: true,
        type: "trending_movies",
        entityType: "movie",
        referenceId: localMovie?._id.toString() || null,
        entityId: tmdbMovie.id,
        title: originalTitle, // Preserve original keyword
        slug: localMovie?.slug || tmdbMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tmdbData: tmdbMovie,
        isLocal: !!localMovie
      };
    }

    // --- STEP 2: TMDB Person Search ---
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

      return {
        isValid: true,
        type: "trending_actors",
        entityType: "actor",
        referenceId: localCelebrity?._id.toString() || null,
        entityId: tmdbPerson.id,
        title: originalTitle, // Preserve original keyword
        slug: localCelebrity?.heroSection?.slug || tmdbPerson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tmdbData: tmdbPerson,
        isLocal: !!localCelebrity
      };
    }

    // --- STEP 3: Fallback to Viral Topics ---
    console.log(`   📊 No TMDB match. Classifying as "viral_topics"`);
    return {
      isValid: true, // All trends are valid now, just different types
      type: "viral_topics",
      entityType: "topic",
      referenceId: null,
      title: originalTitle,
      slug: originalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      tmdbData: null,
      isLocal: false
    };

  } catch (error) {
    console.error(`❌ Validation error for ${originalTitle}:`, error.message);
    return {
      isValid: false,
      reason: error.message
    };
  }
}
