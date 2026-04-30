// // Trend Validation Service
// // Validates trends using TMDB and local database
// import dbConnect from "../mongodb";
// import Article from "../../model/article";
// import Celebrity from "../../model/celebrity";
// import { searchTMDBMovie, searchTMDBPerson } from "../api-clients/tmdb";

// /**
//  * Enhanced title cleaning for movie/actor matching
//  */
// export function getCoreTitle(title) {
//   if (!title) return "";
  
//   // 1. Remove common noise words/patterns
//   let clean = title.replace(/Official Trailer|Teaser|Full Movie|HD|202[0-9]|Lyric Video|Video Song|Lyrical|Trailer|Teaser|Promo/gi, '');
  
//   // 2. Split by common separators and take the first part
//   const separators = ['|', '-', ':', '–', '—'];
//   for (const sep of separators) {
//     if (clean.includes(sep)) {
//       const parts = clean.split(sep);
//       if (parts[0].trim().length > 2) {
//         clean = parts[0];
//         break;
//       }
//     }
//   }
  
//   return clean.trim();
// }

// /**
//  * Strict validation pipeline:
//  * Step 1: Relevance Check (from Preprocessing)
//  * Step 2: TMDB Movie search
//  * Step 3: TMDB Person search
//  * Step 4: Local DB check (to link to existing content)
//  * Step 5: Fallback to viral_topics (if relevant)
//  */
// export async function validateTrend(trend) {
//   const originalTitle = trend.title;
//   const coreTitle = trend.coreTitle || getCoreTitle(originalTitle);
//   const entityType = trend.entityType;
//   const isRelevant = trend.isRelevant !== undefined ? trend.isRelevant : true;

//   console.log(`\n🔍 Validating trend: "${originalTitle}" -> Core: "${coreTitle}" (Type: ${entityType})`);

//   // --- STEP 1: Relevance Check ---
//   if (!isRelevant) {
//     console.log(`   ❌ REJECTED: Marked as irrelevant by intelligence system.`);
//     return {
//       isValid: false,
//       reason: "Classified as irrelevant entertainment or non-entertainment topic"
//     };
//   }

//   try {
//     // --- STEP 2: TMDB Movie Search (Prioritized if AI says it's a movie) ---
//     if (entityType === "movie" || entityType === "topic") {
//       const tmdbMovie = await searchTMDBMovie(coreTitle);
//       if (tmdbMovie) {
//         console.log(`   🎬 TMDB Movie Match: ${tmdbMovie.title}`);
        
//         // Check local DB for existing article
//         await dbConnect();
//         const localMovie = await Article.findOne({
//           $or: [
//             { tmdbId: tmdbMovie.id },
//             { movieTitle: new RegExp(`^${tmdbMovie.title}$`, "i") }
//           ]
//         }).select("slug _id");

//         // ONLY validate if found in local database
//         if (localMovie) {
//           console.log(`   ✅ VALIDATED: Found in local Articles database`);
//           return {
//             isValid: true,
//             type: "trending_movies",
//             entityType: "movie",
//             referenceId: localMovie._id.toString(),
//             entityId: tmdbMovie.id,
//             title: originalTitle,
//             slug: localMovie.slug,
//             tmdbData: tmdbMovie,
//             isLocal: true
//           };
//         } else {
//           console.log(`   ❌ REJECTED: Movie not found in local Articles database`);
//         }
//       }
//     }

//     // --- STEP 3: TMDB Person Search (Prioritized if AI says it's an actor) ---
//     if (entityType === "actor" || entityType === "topic") {
//       const tmdbPerson = await searchTMDBPerson(coreTitle);
//       if (tmdbPerson) {
//         console.log(`   👤 TMDB Person Match: ${tmdbPerson.title}`);

//         // Check local DB for existing celebrity
//         await dbConnect();
//         const localCelebrity = await Celebrity.findOne({
//           $or: [
//             { "heroSection.tmdbId": tmdbPerson.id },
//             { "heroSection.name": new RegExp(`^${tmdbPerson.title}$`, "i") }
//           ]
//         }).select("heroSection.slug _id");

//         // ONLY validate if found in local database
//         if (localCelebrity) {
//           console.log(`   ✅ VALIDATED: Found in local Celebrities database`);
//           return {
//             isValid: true,
//             type: "trending_actors",
//             entityType: "actor",
//             referenceId: localCelebrity._id.toString(),
//             entityId: tmdbPerson.id,
//             title: originalTitle,
//             slug: localCelebrity.heroSection.slug,
//             tmdbData: tmdbPerson,
//             isLocal: true
//           };
//         } else {
//           console.log(`   ❌ REJECTED: Celebrity not found in local Celebrities database`);
//         }
//       }
//     }

//     // --- STEP 4: Fallback to Viral Topics ---
//     // If we reached here, it's relevant but no exact TMDB match found
//     // REJECT if no local DB match (we only want Bollywood/Hollywood content)
//     console.log(`   ❌ REJECTED: No local database match for "${coreTitle}"`);
//     return {
//       isValid: false,
//       type: null,
//       entityType: "topic",
//       referenceId: null,
//       title: originalTitle,
//       slug: coreTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
//       tmdbData: null,
//       isLocal: false,
//       reason: "No matching content in local database (Articles or Celebrities)"
//     };

//   } catch (error) {
//     console.error(`❌ Validation error for ${originalTitle}:`, error.message);
//     return {
//       isValid: false,
//       reason: error.message
//     };
//   }
// }
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
  let clean = title.replace(/Official Trailer|Teaser|Full Movie|HD|202[0-9]|Lyric Video|Video Song|Lyrical|Trailer|Teaser|Promo|Review|Reaction|First Look|Behind the Scenes|BTS|Interview/i, '');
  
  // 2. Remove special characters and extra spaces
  clean = clean.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 3. Split by common separators and take the first part
  const separators = ['|', '-', ':', '–', '—', 'ft.', 'feat.', 'vs', 'versus'];
  for (const sep of separators) {
    if (clean.includes(sep)) {
      const parts = clean.split(sep);
      if (parts[0].trim().length > 2) {
        clean = parts[0];
        break;
      }
    }
  }
  
  // 4. Remove common prefixes
  clean = clean.replace(/^(watch|new|official|exclusive|latest)\s+/i, '');
  
  return clean.trim();
}

/**
 * Detect if content is Hollywood or Bollywood based on title and region
 */
function detectContentType(title, region) {
  const lowerTitle = title.toLowerCase();
  
  // Hollywood indicators
  const hollywoodIndicators = [
    'hollywood', 'english movie', 'netflix', 'amazon prime', 'disney+', 'hbo',
    'marvel', 'dc', 'pixar', 'dreamworks', 'universal', 'warner bros', 'paramount',
    'oscar', 'emmy', 'grammy', 'hollywood actor', 'hollywood actress'
  ];
  
  // Bollywood indicators  
  const bollywoodIndicators = [
    'bollywood', 'hindi movie',
    'dharma', 'yrf', 'rajshri', 'balaji', 'filmfare', 'iifa', 'national award',
    'bollywood actor', 'bollywood actress'
  ];
  
  // English movie indicators
  const englishIndicators = [
    'hollywood', 'english', 'foreign', 'international', 'netflix', 'amazon prime'
  ];
  
  // Indian language indicators
  const indianIndicators = [
    'hindi', 'bollywood',
  ];
  
  // Check for explicit indicators
  for (const indicator of hollywoodIndicators) {
    if (lowerTitle.includes(indicator)) return "hollywood";
  }
  
  for (const indicator of bollywoodIndicators) {
    if (lowerTitle.includes(indicator)) return "bollywood";
  }
  
  // Default based on region
  if (region === "US") return "hollywood";
  if (region === "IN") return "bollywood";
  
  // Check language indicators
  for (const indicator of englishIndicators) {
    if (lowerTitle.includes(indicator)) return "hollywood";
  }
  
  for (const indicator of indianIndicators) {
    if (lowerTitle.includes(indicator)) return "bollywood";
  }
  
  return region === "US" ? "hollywood" : "bollywood";
}

/**
 * Strict validation pipeline with Hollywood/Bollywood support:
 * Step 1: Relevance Check
 * Step 2: Content Type Detection (Hollywood/Bollywood)
 * Step 3: TMDB Movie search
 * Step 4: TMDB Person search  
 * Step 5: Local DB check with region filtering
 * Step 6: Fallback to viral_topics (only if highly relevant)
 */
export async function validateTrend(trend, region = "IN") {
  const originalTitle = trend.title;
  const coreTitle = trend.coreTitle || getCoreTitle(originalTitle);
  const entityType = trend.entityType;
  const isRelevant = trend.isRelevant !== undefined ? trend.isRelevant : true;
  
  // Detect content type
  const contentType = detectContentType(originalTitle, region);
  const isHollywood = contentType === "hollywood";
  const isBollywood = contentType === "bollywood";

  console.log(`\n🔍 Validating trend: "${originalTitle}" -> Core: "${coreTitle}"`);
  console.log(`   Region: ${region}, Type: ${contentType}, Entity: ${entityType}`);

  // --- STEP 1: Relevance Check ---
  if (!isRelevant) {
    console.log(`   ❌ REJECTED: Marked as irrelevant`);
    return {
      isValid: false,
      reason: "Classified as irrelevant entertainment or non-entertainment topic"
    };
  }

  try {
    await dbConnect();
    
    // --- STEP 2: TMDB Movie Search (for movies) ---
    if (entityType === "movie" || entityType === "topic") {
      const tmdbMovie = await searchTMDBMovie(coreTitle);
      if (tmdbMovie) {
        console.log(`   🎬 TMDB Movie Match: ${tmdbMovie.title} (Language: ${tmdbMovie.original_language})`);
        
        // Check if TMDB movie matches our region requirements
        const isEnglishMovie = tmdbMovie.original_language === 'en';
        const isIndianMovie = ['hi', 'ta', 'te', 'ml', 'kn'].includes(tmdbMovie.original_language);
        
        let shouldAccept = false;
        
        if (region === "US" && isEnglishMovie) {
          shouldAccept = true;
          console.log(`   ✅ Hollywood movie accepted`);
        } else if (region === "IN" && isIndianMovie) {
          shouldAccept = true;
          console.log(`   ✅ Bollywood movie accepted`);
        } else if (region === "US" && tmdbMovie.popularity > 50) {
          // High popularity international movies might still be relevant for US
          shouldAccept = true;
          console.log(`   ✅ High popularity international movie accepted for US`);
        }
        
        if (shouldAccept) {
          // Search local database with region-aware query
          const localMovie = await Article.findOne({
            $or: [
              { tmdbId: tmdbMovie.id },
              { movieTitle: new RegExp(`^${tmdbMovie.title}$`, "i") },
              { originalTitle: new RegExp(`^${tmdbMovie.original_title}$`, "i") }
            ],
            // Region filter
            ...(region === "US" ? { language: "en" } : { language: { $in: ["hi", "Hindi", null] } })
          }).select("slug _id movieTitle");

          if (localMovie) {
            console.log(`   ✅ VALIDATED: Found in local Articles database`);
            return {
              isValid: true,
              type: "trending_movies",
              entityType: "movie",
              referenceId: localMovie._id.toString(),
              entityId: tmdbMovie.id,
              title: localMovie.movieTitle || originalTitle,
              slug: localMovie.slug,
              tmdbData: tmdbMovie,
              isLocal: true,
              contentType: contentType
            };
          } else {
            console.log(`   ⚠️ Movie found in TMDB but not in local database`);
            // For Hollywood movies, we might still want to track them
            if (region === "US" && isEnglishMovie) {
              console.log(`   ℹ️ Hollywood movie not in DB - marking as viral topic instead`);
              // Fall through to viral topics
            } else {
              console.log(`   ❌ REJECTED: Movie not found in local database`);
              return {
                isValid: false,
                reason: `Movie not found in local ${region === "US" ? "Hollywood" : "Bollywood"} database`
              };
            }
          }
        } else {
          console.log(`   ❌ REJECTED: Movie language doesn't match region requirements`);
          return {
            isValid: false,
            reason: `Movie language (${tmdbMovie.original_language}) doesn't match ${region === "US" ? "Hollywood" : "Bollywood"} requirements`
          };
        }
      }
    }

    // --- STEP 3: TMDB Person Search (for actors) ---
    if (entityType === "actor" || entityType === "topic") {
      const tmdbPerson = await searchTMDBPerson(coreTitle);
      if (tmdbPerson) {
        console.log(`   👤 TMDB Person Match: ${tmdbPerson.title}`);
        
        // Determine if person is Hollywood or Bollywood based on known for
        const isHollywoodActor = tmdbPerson.known_for_department === 'Acting' && 
          tmdbPerson.known_for?.some(movie => movie.original_language === 'en');
        const isBollywoodActor = tmdbPerson.known_for?.some(movie => 
          ['hi', 'ta', 'te', 'ml', 'kn'].includes(movie.original_language)
        );
        
        let shouldAccept = false;
        
        if (region === "US" && isHollywoodActor) {
          shouldAccept = true;
          console.log(`   ✅ Hollywood actor accepted`);
        } else if (region === "IN" && isBollywoodActor) {
          shouldAccept = true;
          console.log(`   ✅ Bollywood actor accepted`);
        } else if (tmdbPerson.popularity > 100) {
          // Very popular international actors
          shouldAccept = true;
          console.log(`   ✅ Highly popular international actor accepted`);
        }
        
        if (shouldAccept) {
          // Search local database with region-aware query
          const localCelebrity = await Celebrity.findOne({
            $or: [
              { "heroSection.tmdbId": tmdbPerson.id },
              { "heroSection.name": new RegExp(`^${tmdbPerson.title}$`, "i") }
            ],
            // Industry filter
            ...(region === "US" ? { "heroSection.industry": { $in: ["Hollywood", "International"] } } : 
                                   { "heroSection.industry": { $in: ["Bollywood", "Tollywood", "Kollywood", "Indian Cinema"] } })
          }).select("heroSection.slug _id heroSection.name heroSection.industry");

          if (localCelebrity) {
            console.log(`   ✅ VALIDATED: Found in local Celebrities database (Industry: ${localCelebrity.heroSection?.industry})`);
            return {
              isValid: true,
              type: "trending_actors",
              entityType: "actor",
              referenceId: localCelebrity._id.toString(),
              entityId: tmdbPerson.id,
              title: localCelebrity.heroSection?.name || originalTitle,
              slug: localCelebrity.heroSection?.slug,
              tmdbData: tmdbPerson,
              isLocal: true,
              contentType: contentType
            };
          } else {
            console.log(`   ⚠️ Person found in TMDB but not in local database`);
            if (region === "US" && isHollywoodActor) {
              console.log(`   ℹ️ Hollywood celebrity not in DB - marking as viral topic`);
            } else {
              console.log(`   ❌ REJECTED: Celebrity not found in local database`);
              return {
                isValid: false,
                reason: `Celebrity not found in local ${region === "US" ? "Hollywood" : "Bollywood"} database`
              };
            }
          }
        } else {
          console.log(`   ❌ REJECTED: Actor doesn't match region requirements`);
          return {
            isValid: false,
            reason: `Actor not from ${region === "US" ? "Hollywood" : "Bollywood"} industry`
          };
        }
      }
    }

    // --- STEP 4: Viral Topics (only highly relevant entertainment topics) ---
    // Check if this is an entertainment-related topic
    const entertainmentKeywords = [
      'movie', 'film', 'actor', 'actress', 'celebrity', 'director', 'producer',
      'oscar', 'emmy', 'grammy', 'award', 'release', 'trailer', 'teaser',
      'box office', 'collection', 'hit', 'blockbuster', 'flop', 'review',
      'netflix', 'amazon prime', 'disney+', 'hotstar', 'zee5', 'sonyliv'
    ];
    
    const isEntertainment = entertainmentKeywords.some(keyword => 
      originalTitle.toLowerCase().includes(keyword)
    );
    
    if (isEntertainment && originalTitle.length > 5) {
      console.log(`   📰 Valid entertainment topic accepted`);
      return {
        isValid: true,
        type: "viral_topics",
        entityType: "topic",
        referenceId: null,
        entityId: null,
        title: originalTitle,
        slug: coreTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tmdbData: null,
        isLocal: false,
        contentType: contentType,
        reason: "Valid entertainment topic"
      };
    }
    
    // --- STEP 5: Final Rejection ---
    console.log(`   ❌ REJECTED: No valid match found for "${coreTitle}"`);
    return {
      isValid: false,
      type: null,
      entityType: "unknown",
      referenceId: null,
      title: originalTitle,
      slug: null,
      tmdbData: null,
      isLocal: false,
      reason: `No matching ${region === "US" ? "Hollywood" : "Bollywood"} content found in local database or TMDB`
    };

  } catch (error) {
    console.error(`❌ Validation error for ${originalTitle}:`, error.message);
    return {
      isValid: false,
      reason: error.message
    };
  }
}