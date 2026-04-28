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
      console.error("❌ Redis Error:", err.message);
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

    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    const freshData = await fetchFn();

    if (freshData !== undefined && freshData !== null) {
      await redis.setex(key, ttl, JSON.stringify(freshData));
    }

    return freshData;
  } catch (error) {
    console.error("Cache Manager Error:", error.message);
    return await fetchFn();
  }
}

export const redisClient = redis;
export default redis;