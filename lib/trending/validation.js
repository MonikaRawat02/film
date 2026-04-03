// Trend Validation Service
// Validates trends against TMDB and Celebrity databases
import dbConnect from "../mongodb.js";
import Article from "../../model/article.js";
import Celebrity from "../../model/celebrity.js";

/**
 * Search for movie in TMDB/local database (User's requirement #4)
 */
export async function validateMovie(title, keywords) {
  try {
    await dbConnect();

    // Clean title for better matching
    const cleanTitle = title.replace(/Official Trailer|Teaser|Full Movie|HD|202[0-9]/gi, '').trim();

    // Build search query
    const searchPatterns = [
      new RegExp(`^${cleanTitle}$`, "i"), // Exact title match
      ...keywords.map(k => new RegExp(k, "i")) // Keyword matches
    ];

    const movie = await Article.findOne({
      contentType: "movie",
      $or: [
        { movieTitle: { $regex: new RegExp(cleanTitle, "i") } },
        { slug: { $regex: new RegExp(cleanTitle.replace(/\s+/g, "-"), "i") } }
      ]
    }).select("movieTitle slug coverImage tmdbId");

    if (movie) {
      return {
        isValid: true,
        type: "trending_movies", // User's requirement #5 classification
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

    const cleanName = title.replace(/actor|actress|star|hero|heroine/gi, '').trim();

    let celebrity = await Celebrity.findOne({
      $or: [
        { "heroSection.name": new RegExp(cleanName, "i") },
        { "heroSection.slug": new RegExp(cleanName.replace(/\s+/g, "-"), "i") }
      ]
    }).select("heroSection.name heroSection.slug heroSection.profileImage heroSection.tmdbId");

    if (celebrity) {
      return {
        isValid: true,
        type: "trending_actors", // User's requirement #5 classification
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

    return { isValid: false };
  } catch (error) {
    console.error("Actor validation error:", error.message);
    return { isValid: false, error: error.message };
  }
}

/**
 * Validate topic relevance (check if it's entertainment-related)
 */
export async function validateTopic(title, keywords) {
  try {
    const entertainmentKeywords = [
      "bollywood", "hollywood", "movie", "film", "cinema", "actor", "actress",
      "trailer", "release", "box office", "premiere", "award", "festival",
      "netflix", "prime", "disney", "ott", "streaming", "web series", "series"
    ];

    const titleLower = title.toLowerCase();
    const isEntertainmentRelated = entertainmentKeywords.some(keyword => 
      titleLower.includes(keyword)
    ) || keywords.some(keyword => 
      entertainmentKeywords.includes(keyword.toLowerCase())
    );

    if (isEntertainmentRelated) {
      return {
        isValid: true,
        type: "viral_topics", // User's requirement #5 classification
        entityType: "topic",
        referenceId: null,
        entityId: null,
        title: title,
        keywords: keywords
      };
    }

    return { isValid: false, reason: "Not entertainment related" };
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
  const movieRes = await validateMovie(title, keywords);
  if (movieRes.isValid) return movieRes;

  const actorRes = await validateActor(title, keywords);
  if (actorRes.isValid) return actorRes;

  // 3. Finally try as a general entertainment topic
  return await validateTopic(title, keywords);
}

export default {
  validateMovie,
  validateActor,
  validateTopic,
  validateTrend
};
