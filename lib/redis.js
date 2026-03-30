import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis;
let isRedisAvailable = false;

try {
  if (process.env.NODE_ENV === "production") {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      retryStrategy: (times) => {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 100, 2000);
      }
    });
  } else {
    if (!global.redis) {
      global.redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: (times) => {
          if (times > 2) return null; // stop retrying in dev
          return 500;
        }
      });
    }
    redis = global.redis;
  }

  redis.on("connect", () => {
    isRedisAvailable = true;
    console.log("✅ Redis Connected");
  });

  redis.on("error", (err) => {
    isRedisAvailable = false;
    // Only log connection errors once or less frequently to avoid spamming
    if (err.code === 'ECONNREFUSED') {
      // Quietly handle connection refused
    } else {
      console.warn("⚠️ Redis Warning:", err.message);
    }
  });
} catch (e) {
  console.warn("⚠️ Redis initialization failed, caching disabled.");
}

/**
 * Get data from cache or fetch and set if not exists
 */
export async function cacheManager(key, ttl = 3600, fetchFn) {
  if (!isRedisAvailable) {
    return await fetchFn();
  }

  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const freshData = await fetchFn();
    if (freshData) {
      // Don't await setex to speed up response
      redis.setex(key, ttl, JSON.stringify(freshData)).catch(e => {
        console.warn(`Failed to set cache for ${key}`);
      });
    }
    return freshData;
  } catch (error) {
    return await fetchFn();
  }
}

export default redis;
