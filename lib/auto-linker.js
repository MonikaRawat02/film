/**
 * Content Auto-Linker
 * Automatically links actor names, movie titles, and OTT platforms in content
 */

import dbConnect from "./mongodb";
import Celebrity from "../model/celebrity";
import Article from "../model/article";

// Cache for faster lookups (refreshed every hour in production)
let actorCache = null;
let movieCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Load actors into cache
 */
async function loadActorCache() {
  if (actorCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
    return actorCache;
  }

  try {
    await dbConnect();
    
    const actors = await Celebrity.find({ status: "published" })
      .select("name slug profileImage")
      .lean();
    
    // Create a map for fast lookup
    actorCache = new Map();
    actors.forEach(actor => {
      if (actor.name) {
        actorCache.set(actor.name.toLowerCase(), {
          name: actor.name,
          slug: actor.slug,
          profileImage: actor.profileImage
        });
      }
    });
    
    cacheTimestamp = Date.now();
    console.log(`🎭 Actor cache loaded: ${actorCache.size} actors`);
    
    return actorCache;
  } catch (error) {
    console.error("Error loading actor cache:", error);
    return new Map();
  }
}

/**
 * Load movies into cache
 */
async function loadMovieCache() {
  if (movieCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
    return movieCache;
  }

  try {
    await dbConnect();
    
    const movies = await Article.find({ contentType: "movie" })
      .select("movieTitle slug category")
      .lean();
    
    movieCache = new Map();
    movies.forEach(movie => {
      if (movie.movieTitle) {
        movieCache.set(movie.movieTitle.toLowerCase(), {
          title: movie.movieTitle,
          slug: movie.slug,
          category: movie.category
        });
      }
    });
    
    console.log(`🎬 Movie cache loaded: ${movieCache.size} movies`);
    
    return movieCache;
  } catch (error) {
    console.error("Error loading movie cache:", error);
    return new Map();
  }
}

/**
 * OTT Platforms with their links
 */
const OTT_PLATFORMS = {
  'netflix': { name: 'Netflix', slug: 'netflix', color: '#E50914' },
  'amazon prime': { name: 'Amazon Prime', slug: 'amazon-prime', color: '#00A8E1' },
  'amazon prime video': { name: 'Amazon Prime', slug: 'amazon-prime', color: '#00A8E1' },
  'prime video': { name: 'Amazon Prime', slug: 'amazon-prime', color: '#00A8E1' },
  'disney+': { name: 'Disney+', slug: 'disney-plus', color: '#113CCF' },
  'disney+ hotstar': { name: 'Disney+ Hotstar', slug: 'disney-plus-hotstar', color: '#113CCF' },
  'hotstar': { name: 'Hotstar', slug: 'hotstar', color: '#113CCF' },
  'zee5': { name: 'ZEE5', slug: 'zee5', color: '#8B008B' },
  'jiocinema': { name: 'JioCinema', slug: 'jiocinema', color: '#0066FF' },
  'sony liv': { name: 'SonyLIV', slug: 'sonyliv', color: '#000000' },
  'sonyliv': { name: 'SonyLIV', slug: 'sonyliv', color: '#000000' },
  'hbo max': { name: 'HBO Max', slug: 'hbo-max', color: '#5822B4' },
  'max': { name: 'Max', slug: 'max', color: '#002BE7' },
  'apple tv+': { name: 'Apple TV+', slug: 'apple-tv-plus', color: '#000000' },
  'apple tv': { name: 'Apple TV+', slug: 'apple-tv-plus', color: '#000000' },
  'peacock': { name: 'Peacock', slug: 'peacock', color: '#000000' },
  'paramount+': { name: 'Paramount+', slug: 'paramount-plus', color: '#0064FF' },
  'hulu': { name: 'Hulu', slug: 'hulu', color: '#1CE783' },
  'mubi': { name: 'MUBI', slug: 'mubi', color: '#000000' },
};

/**
 * Auto-link actor names in text content
 * @param {string} content - The text content to process
 * @param {Object} options - Options for linking
 * @returns {string} - Content with actor names linked
 */
export async function autoLinkActors(content, options = {}) {
  if (!content || typeof content !== 'string') return content;

  const { maxLinks = 10, excludeNames = [] } = options;
  const actors = await loadActorCache();
  
  let linkedCount = 0;
  let processedContent = content;
  const linkedNames = new Set();

  // Sort actors by name length (descending) to avoid partial matches
  const sortedActors = Array.from(actors.entries())
    .sort((a, b) => b[1].name.length - a[1].name.length);

  for (const [key, actor] of sortedActors) {
    if (linkedCount >= maxLinks) break;
    if (excludeNames.includes(actor.name)) continue;
    if (linkedNames.has(actor.name.toLowerCase())) continue;

    // Create a regex that matches whole words only
    const namePattern = new RegExp(
      `\\b(${escapeRegex(actor.name)})\\b(?![^<]*>|[^<>]*<\\/a>)`,
      'gi'
    );

    // Only link first occurrence
    let hasMatched = false;
    processedContent = processedContent.replace(namePattern, (match) => {
      if (hasMatched) return match;
      hasMatched = true;
      linkedCount++;
      linkedNames.add(actor.name.toLowerCase());
      return `<a href="/celebrity/${actor.slug}" class="text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-400 transition-colors font-medium">${match}</a>`;
    });
  }

  return processedContent;
}

/**
 * Auto-link movie titles in text content
 * @param {string} content - The text content to process
 * @param {Object} options - Options for linking
 * @returns {string} - Content with movie titles linked
 */
export async function autoLinkMovies(content, options = {}) {
  if (!content || typeof content !== 'string') return content;

  const { maxLinks = 5, excludeTitles = [] } = options;
  const movies = await loadMovieCache();
  
  let linkedCount = 0;
  let processedContent = content;
  const linkedTitles = new Set();

  // Sort movies by title length (descending) to avoid partial matches
  const sortedMovies = Array.from(movies.entries())
    .sort((a, b) => b[1].title.length - a[1].title.length);

  for (const [key, movie] of sortedMovies) {
    if (linkedCount >= maxLinks) break;
    if (excludeTitles.includes(movie.title)) continue;
    if (linkedTitles.has(movie.title.toLowerCase())) continue;

    const titlePattern = new RegExp(
      `\\b(${escapeRegex(movie.title)})\\b(?![^<]*>|[^<>]*<\\/a>)`,
      'gi'
    );

    let hasMatched = false;
    processedContent = processedContent.replace(titlePattern, (match) => {
      if (hasMatched) return match;
      hasMatched = true;
      linkedCount++;
      linkedTitles.add(movie.title.toLowerCase());
      return `<a href="/category/${movie.category?.toLowerCase() || 'hollywood'}/${movie.slug}" class="text-red-400 hover:text-red-300 underline decoration-red-500/30 hover:decoration-red-400 transition-colors font-medium">${match}</a>`;
    });
  }

  return processedContent;
}

/**
 * Auto-link OTT platform names in text content
 * @param {string} content - The text content to process
 * @returns {string} - Content with OTT platforms linked
 */
export function autoLinkOTTPlatforms(content) {
  if (!content || typeof content !== 'string') return content;

  let processedContent = content;
  const linkedPlatforms = new Set();

  // Sort platforms by name length (descending)
  const sortedPlatforms = Object.entries(OTT_PLATFORMS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [key, platform] of sortedPlatforms) {
    if (linkedPlatforms.has(platform.slug)) continue;

    const platformPattern = new RegExp(
      `\\b(${escapeRegex(key)})\\b(?![^<]*>|[^<>]*<\\/a>)`,
      'gi'
    );

    let hasMatched = false;
    processedContent = processedContent.replace(platformPattern, (match) => {
      if (hasMatched) return match;
      hasMatched = true;
      linkedPlatforms.add(platform.slug);
      return `<a href="/ott/${platform.slug}" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-white font-bold text-sm" style="background-color: ${platform.color}">${platform.name}</a>`;
    });
  }

  return processedContent;
}

/**
 * Process all auto-linking on content
 * @param {string} content - The text content to process
 * @param {Object} options - Options for linking
 * @returns {string} - Fully processed content with all links
 */
export async function processAutoLinking(content, options = {}) {
  if (!content || typeof content !== 'string') return content;

  let processedContent = content;

  // 1. Link OTT platforms first (shortest names, highest priority)
  processedContent = autoLinkOTTPlatforms(processedContent);

  // 2. Link movie titles
  processedContent = await autoLinkMovies(processedContent, options);

  // 3. Link actor names
  processedContent = await autoLinkActors(processedContent, options);

  return processedContent;
}

/**
 * Process sections array with auto-linking
 * @param {Array} sections - Array of {heading, content} objects
 * @param {Object} options - Options for linking
 * @returns {Array} - Sections with auto-linked content
 */
export async function processContentSections(sections, options = {}) {
  if (!sections || !Array.isArray(sections)) return sections;

  const processedSections = [];

  for (const section of sections) {
    const processedContent = await processAutoLinking(section.content, options);
    processedSections.push({
      ...section,
      content: processedContent,
      hasAutoLinks: processedContent !== section.content
    });
  }

  return processedSections;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clear the caches (useful for testing or manual refresh)
 */
export function clearAutoLinkCaches() {
  actorCache = null;
  movieCache = null;
  cacheTimestamp = null;
  console.log('🗑️ Auto-link caches cleared');
}

/**
 * Get cache stats
 */
export function getAutoLinkCacheStats() {
  return {
    actorCount: actorCache?.size || 0,
    movieCount: movieCache?.size || 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    isStale: cacheTimestamp ? Date.now() - cacheTimestamp > CACHE_TTL : true
  };
}
