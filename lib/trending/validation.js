// Trend Validation Service
// Validates trends against TMDB and Celebrity databases
import axios from "axios";
import dbConnect from "../mongodb";
import Article from "../../model/article";
import Celebrity from "../../model/celebrity";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Enhanced title cleaning for movie/actor matching
 */
function getCoreTitle(title) {
  if (!title) return "";
  
  // 1. Remove common YouTube suffixes/prefixes
  let clean = title.replace(/Official Trailer|Teaser|Full Movie|HD|202[0-9]|Lyric Video|Video Song|Lyrical|Trailer|Teaser|Promo/gi, '');
  
  // 2. Split by common separators and take the first part (usually the movie name)
  // Most movie titles on YouTube follow: "Movie Name | Trailer | Actor" or "Movie Name - Trailer"
  const separators = ['|', '-', ':', '–', '—'];
  for (const sep of separators) {
    if (clean.includes(sep)) {
      const parts = clean.split(sep);
      // Only take the first part if it's long enough
      if (parts[0].trim().length > 2) {
        clean = parts[0];
        break;
      }
    }
  }
  
  return clean.trim();
}

/**
 * Search for movie in TMDB/local database (User's requirement #4)
 */
export async function validateMovie(title, keywords) {
  try {
    await dbConnect();

    const coreTitle = getCoreTitle(title);
    if (!coreTitle) return { isValid: false };

    console.log(`🎬 Validating Movie: "${title}" -> Core: "${coreTitle}"`);

    // 1. Check local database first
    const movie = await Article.findOne({
      contentType: "movie",
      $or: [
        { movieTitle: { $regex: new RegExp(`^${coreTitle}$`, "i") } },
        { movieTitle: { $regex: new RegExp(coreTitle, "i") } }, // More relaxed local match
        { slug: { $regex: new RegExp(`^${coreTitle.replace(/\s+/g, "-")}$`, "i") } }
      ]
    }).select("movieTitle slug coverImage tmdbId");

    if (movie) {
      return {
        isValid: true,
        type: "trending_movies",
        entityType: "movie",
        referenceId: movie._id.toString(),
        entityId: movie.tmdbId || null,
        title: movie.movieTitle,
        slug: movie.slug,
        metadata: {
          coverImage: movie.coverImage
        }
      };
    }

    // 2. Fallback: Check TMDB directly (Requirement #4 - Verify existence)
    if (TMDB_API_KEY) {
      const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: coreTitle
        }
      });

      const tmdbMovie = tmdbRes.data.results?.[0];
      if (tmdbMovie) {
        console.log(`🔍 TMDB Search: "${coreTitle}" -> Found: "${tmdbMovie.title}" (Pop: ${tmdbMovie.popularity}, Vote: ${tmdbMovie.vote_count})`);
      } else {
        console.log(`❌ TMDB Search: "${coreTitle}" -> No results found.`);
      }
      
      // Check if title is a close match or if it's very popular
      if (tmdbMovie && (tmdbMovie.popularity > 5 || tmdbMovie.vote_count > 10)) {
        return {
          isValid: true,
          type: "trending_movies",
          entityType: "movie",
          referenceId: null, 
          entityId: tmdbMovie.id.toString(),
          title: tmdbMovie.title,
          slug: tmdbMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          metadata: {
            coverImage: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
            overview: tmdbMovie.overview,
            releaseDate: tmdbMovie.release_date
          }
        };
      }
    }

    return { isValid: false };
  } catch (error) {
    console.error("Movie validation error:", error.message);
    return { isValid: false, error: error.message };
  }
}

/**
 * Search for actor/celebrity in database (User's requirement #4)
 */
export async function validateActor(title, keywords) {
  try {
    await dbConnect();

    const coreName = getCoreTitle(title).replace(/actor|actress|star|hero|heroine/gi, '').trim();
    if (!coreName) return { isValid: false };

    console.log(`👤 Validating Actor: "${title}" -> Core: "${coreName}"`);

    // 1. Check local database
    let celebrity = await Celebrity.findOne({
      $or: [
        { "heroSection.name": new RegExp(`^${coreName}$`, "i") },
        { "heroSection.name": new RegExp(coreName, "i") }, // Relaxed local match
        { "heroSection.slug": new RegExp(`^${coreName.replace(/\s+/g, "-")}$`, "i") }
      ]
    }).select("heroSection.name heroSection.slug heroSection.profileImage heroSection.tmdbId");

    if (celebrity) {
      return {
        isValid: true,
        type: "trending_actors",
        entityType: "actor",
        referenceId: celebrity._id.toString(),
        entityId: celebrity.heroSection.tmdbId || null,
        title: celebrity.heroSection.name,
        slug: celebrity.heroSection.slug,
        metadata: {
          thumbnail: celebrity.heroSection.profileImage
        }
      };
    }

    // 2. Fallback: Check TMDB for person
    if (TMDB_API_KEY) {
      const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/person`, {
        params: {
          api_key: TMDB_API_KEY,
          query: coreName
        }
      });

      const tmdbPerson = tmdbRes.data.results?.[0];
      if (tmdbPerson && tmdbPerson.popularity > 2) {
        return {
          isValid: true,
          type: "trending_actors",
          entityType: "actor",
          referenceId: null,
          entityId: tmdbPerson.id.toString(),
          title: tmdbPerson.name,
          slug: tmdbPerson.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          metadata: {
            thumbnail: tmdbPerson.profile_path ? `https://image.tmdb.org/t/p/w185${tmdbPerson.profile_path}` : null
          }
        };
      }
    }

    return { isValid: false };
  } catch (error) {
    console.error("Actor validation error:", error.message);
    return { isValid: false, error: error.message };
  }
}

/**
 * Validate topic relevance (check if it's entertainment-related)
 */
export async function validateTopic(trend) {
  try {
    const { title, keywords, source, metadata } = trend;
    
    const entertainmentKeywords = [
      "bollywood", "hollywood", "movie", "film", "cinema", "actor", "actress",
      "trailer", "release", "box office", "premiere", "award", "festival",
      "netflix", "prime", "disney", "ott", "streaming", "web series", "series",
      "song", "album", "music video", "teaser", "review", "leaked", "shooting"
    ];

    const titleLower = title.toLowerCase();
    
    // 1. If it's from YouTube and in our target categories, it's likely relevant
    const isFromReliableSource = source === "youtube";
    
    // 2. Keyword check
    const hasEntKeyword = entertainmentKeywords.some(keyword => 
      titleLower.includes(keyword)
    ) || (keywords && keywords.some(keyword => 
      entertainmentKeywords.includes(keyword.toLowerCase())
    ));

    // 3. Score-based check (User's requirement #6 ranking)
    const isHighlyViral = (trend.traffic > 30000) || (trend.viewCount > 500000);

    if (hasEntKeyword || isFromReliableSource || isHighlyViral) {
      return {
        isValid: true,
        type: "viral_topics",
        entityType: "topic",
        referenceId: null,
        entityId: null,
        title: title,
        keywords: keywords || [],
        metadata: {
          thumbnail: metadata?.image || metadata?.thumbnail
        }
      };
    }

    return { isValid: false, reason: "Not clearly entertainment related" };
  } catch (error) {
    console.error("Topic validation error:", error.message);
    return { isValid: false, error: error.message };
  }
}

/**
 * Main validation function (User's requirement #4)
 */
export async function validateTrend(trend) {
  const { title, entityType, keywords } = trend;

  // 1. Try validation based on predicted type
  if (entityType === "movie") {
    const res = await validateMovie(title, keywords);
    if (res.isValid) return res;
  } else if (entityType === "actor") {
    const res = await validateActor(title, keywords);
    if (res.isValid) return res;
  }

  // 2. Fallback to other types if initial fails
  // First try movie, as it's the primary content
  const movieRes = await validateMovie(title, keywords);
  if (movieRes.isValid) return movieRes;

  const actorRes = await validateActor(title, keywords);
  if (actorRes.isValid) return actorRes;

  // 3. Finally try as a general entertainment topic
  return await validateTopic(trend);
}

export default {
  validateMovie,
  validateActor,
  validateTopic,
  validateTrend
};
