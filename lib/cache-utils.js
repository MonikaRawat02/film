import redis, { cacheManager, redisClient } from './redis.js';

/**
 * Cache TTL Presets (in seconds)
 */
export const TTL = {
  SHORT: 300,        // 5 minutes - frequently changing data
  MEDIUM: 1800,      // 30 minutes - semi-static data
  LONG: 3600,        // 1 hour - relatively static data
  VERY_LONG: 21600,  // 6 hours - rarely changing data
  EXTREME: 86400,    // 24 hours - static content
};

/**
 * Cache a GET API response
 * @param {object} req - Next.js request object
 * @param {object} res - Next.js response object
 * @param {Function} fetchFn - Function to execute if cache miss
 * @param {string} cacheKey - Custom cache key (optional)
 * @param {number} ttl - Cache TTL in seconds (default: 1 hour)
 * @returns {Promise<void>}
 */
export async function cacheAPIResponse(req, res, fetchFn, cacheKey = null, ttl = TTL.LONG) {
  // Generate cache key from URL and query params
  const key = cacheKey || `api:${req.url}`;

  try {
    const cachedData = await cacheManager(key, ttl, async () => {
      // Execute the fetch function to get fresh data
      return await fetchFn();
    });

    // Check if response already sent by fetchFn
    if (res.headersSent) {
      return;
    }

    // Send cached/fresh data
    if (cachedData) {
      return res.status(200).json(cachedData);
    } else {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
  } catch (error) {
    console.error(`Cache API Error for ${key}:`, error.message);
    // Fallback: execute fetchFn directly
    try {
      return await fetchFn();
    } catch (fallbackError) {
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: fallbackError.message 
      });
    }
  }
}

/**
 * Invalidate specific cache keys or patterns
 * @param {string|string[]} keys - Cache key(s) to invalidate
 * @returns {Promise<void>}
 */
export async function invalidateCache(keys) {
  try {
    if (!redisClient || !redisClient.status === 'ready') {
      console.warn('Redis not available for cache invalidation');
      return;
    }

    const keyArray = Array.isArray(keys) ? keys : [keys];
    
    for (const key of keyArray) {
      if (key.includes('*')) {
        // Pattern-based invalidation
        const keysToDelete = await redisClient.keys(key);
        if (keysToDelete.length > 0) {
          await redisClient.del(keysToDelete);
          console.log(`🗑️ Invalidated ${keysToDelete.length} keys matching: ${key}`);
        }
      } else {
        await redisClient.del(key);
        console.log(`🗑️ Invalidated cache: ${key}`);
      }
    }
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
  }
}

/**
 * Invalidate all API cache
 * @returns {Promise<void>}
 */
export async function invalidateAllCache() {
  await invalidateCache('api:*');
}

/**
 * Get cache statistics
 * @returns {Promise<object>}
 */
export async function getCacheStats() {
  try {
    if (!redisClient || redisClient.status !== 'ready') {
      return { available: false };
    }

    const info = await redisClient.info('memory');
    const keys = await redisClient.keys('api:*');
    
    return {
      available: true,
      keyCount: keys.length,
      memoryInfo: info,
    };
  } catch (error) {
    console.error('Cache stats error:', error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Middleware to add caching to API routes
 * Usage: wrap your API handler with this
 */
export function withCache(handler, ttl = TTL.LONG, keyGenerator = null) {
  return async (req, res) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req, res);
    }

    const cacheKey = keyGenerator 
      ? `api:${keyGenerator(req)}` 
      : `api:${req.url}`;

    return cacheAPIResponse(req, res, () => handler(req, res), cacheKey, ttl);
  };
}

export default {
  cacheAPIResponse,
  invalidateCache,
  invalidateAllCache,
  getCacheStats,
  withCache,
  TTL,
};
