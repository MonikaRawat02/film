import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const logPath = path.join(process.cwd(), 'scheduler.log');
  let lastLogs = [];

  if (fs.existsSync(logPath)) {
    try {
      const logs = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
      lastLogs = logs.slice(-10).reverse(); // Get last 10 entries, newest first
    } catch (err) {
      lastLogs = ["Error reading logs: " + err.message];
    }
  }

  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    scheduler: {
      logFile: logPath,
      exists: fs.existsSync(logPath),
      recentActivity: lastLogs
    }
  });
}
