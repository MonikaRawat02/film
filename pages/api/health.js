import fs from "fs";
import path from "path";
import redis from "@/lib/redis";

export default async function handler(req, res) {
  const logPath = path.join(process.cwd(), "scheduler.log");
  let lastLogs = [];

  // Read scheduler logs
  if (fs.existsSync(logPath)) {
    try {
      const logs = fs
        .readFileSync(logPath, "utf8")
        .split("\n")
        .filter(Boolean);

      lastLogs = logs.slice(-10).reverse();
    } catch (err) {
      lastLogs = ["Error reading logs: " + err.message];
    }
  }

  // Redis health check
  let redisStatus = "disconnected";
  let redisPing = null;
  let redisError = null;

  try {
    if (redis) {
      redisPing = await redis.ping();
      redisStatus = redisPing === "PONG" ? "connected" : "unknown";
    }
  } catch (error) {
    redisStatus = "error";
    redisError = error.message;
  }

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),

    redis: {
      status: redisStatus,
      ping: redisPing,
      error: redisError,
    },

    scheduler: {
      logFile: logPath,
      exists: fs.existsSync(logPath),
      recentActivity: lastLogs,
    },
  });
}