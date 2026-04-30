// //film/lib/redis.js
// import Redis from "ioredis";

// const REDIS_URL = process.env.REDIS_URL;

// let redis;
// let isRedisAvailable = false;

// if (REDIS_URL) {
//   redis = new Redis(REDIS_URL, {
//     maxRetriesPerRequest: 1,
//     connectTimeout: 5000,
//     tls: {}, // important for rediss://
//   });

//   redis.on("connect", () => {
//     console.log("✅ Redis Connected");
//   });

//   redis.on("ready", () => {
//     isRedisAvailable = true;
//     console.log("✅ Redis Ready");
//   });

//   redis.on("error", (err) => {
//     isRedisAvailable = false;
//     console.warn("Redis Error:", err.message);
//   });
// } else {
//   console.warn("⚠️ REDIS_URL missing");
// }

// export async function cacheManager(key, ttl = 3600, fetchFn) {
//   if (!isRedisAvailable || !redis) {
//     return await fetchFn();
//   }

//   try {
//     const cached = await redis.get(key);
//     if (cached) return JSON.parse(cached);

//     const fresh = await fetchFn();
//     await redis.setex(key, ttl, JSON.stringify(fresh));
//     return fresh;
//   } catch {
//     return await fetchFn();
//   }
// }

// export default redis;

// film/lib/redis.js
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "";

const redisOptions = {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false, // Required for BullMQ
  keepAlive: 10000,
  connectTimeout: 10000,
  lazyConnect: false,
  enableAutoPipelining: true,

  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },

  reconnectOnError(err) {
    const targetErrors = [
      "ECONNRESET",
      "ECONNABORTED",
      "ETIMEDOUT",
      "EADDRNOTAVAIL",
    ];

    if (
      targetErrors.some((code) => err.message.includes(code)) ||
      targetErrors.includes(err.code)
    ) {
      console.log(`Redis reconnecting due to: ${err.message}`);
      return true;
    }

    return false;
  },
};

let isRedisAvailable = false;
let isReadOnlyMode = false; // Track if Redis is in read-only mode

// Singleton Redis Client
function getRedisClient() {
  if (!global.redis) {
    const maskedUrl = REDIS_URL
      ? REDIS_URL.replace(/:[^:@]+@/, ":****@")
      : "localhost:6379";

    console.log(
      `Creating Redis connection (${process.env.NODE_ENV === "production" ? "Prod" : "Dev"}): ${maskedUrl}`
    );

    global.redis = new Redis(REDIS_URL, redisOptions);

    global.redis.on("connect", () => {
      console.log("✅ Redis Connected");
    });

    global.redis.on("ready", () => {
      isRedisAvailable = true;
      console.log("✅ Redis Ready");
    });

    global.redis.on("error", (err) => {
      isRedisAvailable = false;
      
      // Check if this is a permission error (read-only mode)
      if (err.message.includes("NOPERM")) {
        isReadOnlyMode = true;
        isRedisAvailable = true; // Still available for reads
        console.warn("⚠️ Redis running in READ-ONLY mode (no write permissions)");
      } else {
        console.error("❌ Redis Error:", err.message);
      }
    });

    global.redis.on("reconnecting", (time) => {
      console.log(`♻️ Redis reconnecting in ${time}ms`);
    });

    global.redis.on("close", () => {
      isRedisAvailable = false;
      console.log("⚠️ Redis Connection Closed");
    });
  }

  return global.redis;
}

const redis = getRedisClient();

/**
 * Universal Cache Manager
 * Supports read-only mode for restricted Redis users
 * @param {string} key
 * @param {number} ttl Seconds
 * @param {Function} fetchFn
 * @returns {Promise<any>}
 */
export async function cacheManager(key, ttl = 3600, fetchFn) {
  try {
    if (!redis || !isRedisAvailable) {
      return await fetchFn();
    }

    // Try to read from cache
    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - fetch fresh data
    const freshData = await fetchFn();

    // Try to write to cache (skip if read-only mode)
    if (freshData !== undefined && freshData !== null) {
      if (!isReadOnlyMode) {
        try {
          await redis.setex(key, ttl, JSON.stringify(freshData));
        } catch (writeError) {
          // If write fails due to permissions, switch to read-only mode
          if (writeError.message.includes("NOPERM")) {
            isReadOnlyMode = true;
            console.warn("⚠️ Redis switched to READ-ONLY mode (cache writes disabled)");
          } else {
            console.warn("⚠️ Cache write failed:", writeError.message);
          }
          // Continue - don't throw, data is still returned
        }
      }
    }

    return freshData;
  } catch (error) {
    console.error("Cache Manager Error:", error.message);
    // Don't retry if it's a temporal dead zone or initialization error
    if (error.message.includes("before initialization") || 
        error.message.includes("Cannot access") ||
        error.message.includes("ReferenceError")) {
      throw error; // Re-throw initialization errors
    }
    // Fallback to direct fetch for other errors
    try {
      return await fetchFn();
    } catch (fallbackError) {
      console.error("Cache Manager Fallback Error:", fallbackError.message);
      throw fallbackError;
    }
  }
}

export const redisClient = redis;
export default redis;