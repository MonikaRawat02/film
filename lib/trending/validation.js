// Trend Validation Service
// Validates trends ONLY against local database (Articles and Celebrities)
//lib/trending/validation.js
import dbConnect from "../mongodb";
import Article from "../../model/article";
import Celebrity from "../../model/celebrity";

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
 * Search for movie in local database (User's requirement #4)
 */
export async function validateMovie(title, keywords) {
  try {
    await dbConnect();

    const coreTitle = getCoreTitle(title);
    if (!coreTitle || coreTitle.length < 2) return { isValid: false };

    console.log(`   🎬 Validating Movie: "${title}" -> Core: "${coreTitle}"`);

    // Helper: check if string contains non-Latin characters (like Hindi)
    const isNonEnglish = /[^\x00-\x7F]/.test(coreTitle);

    // 1. Check local database - Multiple strategies
    
    // Strategy 1: Exact title match
    let movie = await Article.findOne({
      contentType: "movie",
      movieTitle: new RegExp(`^${coreTitle}$`, "i")
    }).select("movieTitle slug coverImage tmdbId");

    if (movie) {
      console.log(`      ✅ EXACT MATCH: ${movie.movieTitle}`);
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

    // Strategy 2: Partial match (title contains coreTitle)
    movie = await Article.findOne({
      contentType: "movie",
      movieTitle: new RegExp(coreTitle, "i")
    }).select("movieTitle slug coverImage tmdbId");

    if (movie) {
      console.log(`      ✅ PARTIAL MATCH: ${movie.movieTitle}`);
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

    // Strategy 3: Slug match (Only if English)
    if (!isNonEnglish) {
      const slugVersion = coreTitle.replace(/\s+/g, "-").toLowerCase();
      movie = await Article.findOne({
        contentType: "movie",
        slug: new RegExp(`^${slugVersion}`, "i")
      }).select("movieTitle slug coverImage tmdbId");

      if (movie) {
        console.log(`      ✅ SLUG MATCH: ${movie.movieTitle}`);
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
    }

    // Strategy 4: Non-English Search (Search in summary/content if title is Hindi)
    if (isNonEnglish) {
      console.log(`      🔍 Searching Hindi term in database content...`);
      movie = await Article.findOne({
        contentType: "movie",
        $or: [
          { summary: new RegExp(coreTitle, "i") },
          { movieTitle: new RegExp(coreTitle, "i") },
          { title: new RegExp(coreTitle, "i") }
        ]
      }).select("movieTitle slug coverImage tmdbId");

      if (movie) {
        console.log(`      ✅ CONTENT MATCH (Hindi): ${movie.movieTitle}`);
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
    }

    console.log(`      ❌ NO MATCH FOUND IN DATABASE`);
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
    if (!coreName || coreName.length < 2) return { isValid: false };

    console.log(`   👤 Validating Actor: "${title}" -> Core: "${coreName}"`);

    // 1. Check local database - Multiple strategies
    
    // Strategy 1: Exact match
    let celebrity = await Celebrity.findOne({
      $or: [
        { "heroSection.name": new RegExp(`^${coreName}$`, "i") },
        { "heroSection.slug": new RegExp(`^${coreName.replace(/\s+/g, "-")}$`, "i") }
      ]
    }).select("heroSection.name heroSection.slug heroSection.profileImage heroSection.tmdbId");

    if (celebrity) {
      console.log(`      ✅ EXACT MATCH: ${celebrity.heroSection.name}`);
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

    // Strategy 2: Partial match (contains coreName)
    celebrity = await Celebrity.findOne({
      "heroSection.name": new RegExp(coreName, "i")
    }).select("heroSection.name heroSection.slug heroSection.profileImage heroSection.tmdbId");

    if (celebrity) {
      console.log(`      ✅ PARTIAL MATCH: ${celebrity.heroSection.name}`);
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

    // Strategy 3: Last name only match (for Indian names)
    const lastWord = coreName.split(/\s+/).pop();
    if (lastWord && lastWord.length > 3) {
      celebrity = await Celebrity.findOne({
        "heroSection.name": new RegExp(lastWord, "i")
      }).select("heroSection.name heroSection.slug heroSection.profileImage heroSection.tmdbId");

      if (celebrity) {
        console.log(`      ✅ LASTNAME MATCH: ${celebrity.heroSection.name}`);
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
    }

    // Strategy 4: Non-English Search (Search in bio/name if name is Hindi)
    const isNonEnglish = /[^\x00-\x7F]/.test(coreName);
    if (isNonEnglish) {
      console.log(`      🔍 Searching Hindi term in celebrity database...`);
      celebrity = await Celebrity.findOne({
        $or: [
          { "heroSection.name": new RegExp(coreName, "i") },
          { biographyTimeline: { $elemMatch: { description: new RegExp(coreName, "i") } } }
        ]
      }).select("heroSection.name heroSection.slug heroSection.profileImage heroSection.tmdbId");

      if (celebrity) {
        console.log(`      ✅ CONTENT MATCH (Hindi Actor): ${celebrity.heroSection.name}`);
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
    }

    console.log(`      ❌ NO MATCH FOUND IN DATABASE`);
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
      "song", "album", "music video", "teaser", "review", "leaked", "shooting",
      // Hindi Entertainment Keywords
      "धुरंधर", "रिवेंज", "मूवी", "फिल्म", "ट्रेलर", "टीज़र", "गाना", "रिलीज़", "एक्टर", "अभिनेता", "अभिनेत्री"
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

  console.log(`\n🔍 Validating: "${title.substring(0, 50)}..." (Predicted: ${entityType})`);

  // 1. Extract potential celebrity names from title (common Indian surnames)
  const actorNames = extractActorNames(title);
  console.log(`   Extracted potential names: ${actorNames.length > 0 ? actorNames.join(", ") : "none"}`);

  // 2. Try each extracted actor name
  for (const actorName of actorNames) {
    console.log(`   ⚡ Trying actor: "${actorName}"`);
    const actorRes = await validateActor(actorName, keywords);
    if (actorRes.isValid) {
      console.log(`   ✅ FOUND: Actor "${actorRes.title}"`);
      return actorRes;
    }
  }

  // 3. Try validation based on predicted type
  if (entityType === "movie") {
    const res = await validateMovie(title, keywords);
    if (res.isValid) {
      console.log(`   ✅ FOUND: Movie "${res.title}"`);
      return res;
    }
  } else if (entityType === "actor") {
    const res = await validateActor(title, keywords);
    if (res.isValid) {
      console.log(`   ✅ FOUND: Actor "${res.title}"`);
      return res;
    }
  }

  // 4. Fallback: Try movie validation (since it's primary content)
  const movieRes = await validateMovie(title, keywords);
  if (movieRes.isValid) {
    console.log(`   ✅ FOUND: Movie "${movieRes.title}" (fallback)`);
    return movieRes;
  }

  // 5. Fallback: Try actor validation
  const actorRes = await validateActor(title, keywords);
  if (actorRes.isValid) {
    console.log(`   ✅ FOUND: Actor "${actorRes.title}" (fallback)`);
    return actorRes;
  }

  // 6. Finally try as a general entertainment topic
  const topicRes = await validateTopic(trend);
  if (topicRes.isValid) {
    console.log(`   ✅ FOUND: Topic (entertainment related)`);
  } else {
    console.log(`   ❌ REJECTED: Not found in any category`);
  }
  return topicRes;
}

/**
 * Extract potential actor/celebrity names from YouTube title
 * Common Indian surnames: Khan, Kumar, Singh, Sharma, Kapoor, Patel, Nair, etc.
 */
function extractActorNames(title) {
  const names = [];
  const titleLower = title.toLowerCase();
  
  // Common Indian actor surnames
  const actorSurnames = [
    "khan", "kumar", "singh", "sharma", "kapoor", "patel", "nair",
    "verma", "gupta", "pandey", "mishra", "reddy", "iyer", "menon",
    "roy", "desai", "pillai", "sen", "chatterjee", "banerjee"
  ];

  // Extract first/last names before or after common surnames
  actorSurnames.forEach(surname => {
    if (titleLower.includes(surname)) {
      // Try to extract the full name
      const regex = new RegExp(`(\\b\\w+\\s+)?${surname}(\\s+\\w+)?`, "i");
      const match = title.match(regex);
      if (match) {
        const name = match[0].trim();
        if (name.length > 3 && !names.includes(name)) {
          names.push(name);
        }
      }
    }
  });

  // Also try to extract 2-3 word phrases that could be names
  const words = title.split(/[\s\-:|]/)
    .filter(w => w.length > 2 && /^[a-zA-Z]+$/.test(w))
    .slice(0, 5); // First 5 words

  // Combine 2 words (likely first + last name)
  for (let i = 0; i < words.length - 1; i++) {
    const potential = `${words[i]} ${words[i + 1]}`;
    if (!names.includes(potential) && potential.length > 4) {
      names.push(potential);
    }
  }

  return names;
}

export default {
  validateMovie,
  validateActor,
  validateTopic,
  validateTrend
};
