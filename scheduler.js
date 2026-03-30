require('dotenv').config();
const cron = require('node-cron');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const NEXTJS_URL = process.env.NEXTJS_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const SCRAPE_INTERVAL = process.env.SCRAPE_INTERVAL || '* 11 * * *'; // Default: running daily at 11:00 AM
const HEARTBEAT_INTERVAL = '* 11 * * *'; // Running daily at 11:00 AM
const BATCH_LIMIT = parseInt(process.env.BATCH_LIMIT || '10');
const CRON_SECRET = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
const LOG_FILE = path.join(__dirname, 'scheduler.log');

const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${level}] ${message}`;
  console.log(logMsg);
  
  // Also write to a log file for persistent tracking
  try {
    fs.appendFileSync(LOG_FILE, logMsg + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
};

const errorLog = (message, error) => {
  const timestamp = new Date().toISOString();
  const errMsg = `[${timestamp}] [ERROR] ${message} ${error ? error.message : ''}`;
  console.error(errMsg);
  try {
    fs.appendFileSync(LOG_FILE, errMsg + '\n');
  } catch (err) {
    // ignore
  }
};

log('Cron job scheduler background service initiated (Target: ' + NEXTJS_URL + ').');
log('Log file location: ' + LOG_FILE);

// --- Automation Tasks ---

/**
 * Task 1: Comprehensive Daily Sync
 * Scrapes new movies, celebrities, and triggers AI content generation
 */
const runDailySync = async () => {
  log('🕒 CRON START: Comprehensive Daily Sync');
  try {
    const response = await fetch(`${NEXTJS_URL}/api/admin/automation/run-daily-sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET
      },
      timeout: 300000, // 5 min timeout for heavy sync
    });

    if (!response.ok) {
      errorLog(`Daily Sync returned status ${response.status}`);
      const text = await response.text();
      errorLog(`Response: ${text}`);
    } else {
      const data = await response.json();
      log(`✅ CRON SUCCESS: Daily Sync - ${data.message || 'Success'}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('⚠️ CRON SKIP: Next.js server not reachable (ECONNREFUSED).', 'WARN');
    } else {
      errorLog('❌ CRON FATAL (Daily Sync):', error);
    }
  }
};

/**
 * Task 2: Specific Movie Scraper (Fallback/Targeted)
 */
const runMovieScraper = async () => {
  log('🕒 CRON START: Wikipedia Movie Scraper');
  try {
    const response = await fetch(`${NEXTJS_URL}/api/admin/automation/scrape-wikipedia`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET
      },
      body: JSON.stringify({
        year: new Date().getFullYear(),
        category: 'Bollywood',
        limit: BATCH_LIMIT,
      }),
      timeout: 60000,
    });

    if (!response.ok) {
      errorLog(`Wikipedia Movie Scraper returned status ${response.status}`);
    } else {
      const data = await response.json();
      log(`✅ CRON SUCCESS: Movie Scraper - ${data.message || 'Success'}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('⚠️ CRON SKIP: Next.js server not reachable.', 'WARN');
    } else {
      errorLog('❌ CRON FATAL (Movie):', error);
    }
  }
};

/**
 * Task 3: Celebrity Scraper
 */
const runCelebrityScraper = async () => {
  log('🕒 CRON START: Celebrity Scraper');
  try {
    const response = await fetch(`${NEXTJS_URL}/api/admin/automation/scrape-celebrity`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET
      },
      body: JSON.stringify({
        industry: 'Bollywood',
        limit: BATCH_LIMIT,
      }),
      timeout: 120000, // Increased timeout for celebrity scraping
    });

    if (!response.ok) {
      errorLog(`Bollywood Celebrity Scraper returned status ${response.status}`);
    } else {
      const data = await response.json();
      log(`✅ CRON SUCCESS: Bollywood Celebrity Scraper - ${data.message || 'Success'}`);
    }

    // Also sync Hollywood celebrities
    const hollywoodResponse = await fetch(`${NEXTJS_URL}/api/admin/automation/scrape-celebrity`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET
      },
      body: JSON.stringify({
        industry: 'Hollywood',
        limit: BATCH_LIMIT,
      }),
      timeout: 120000,
    });

    if (!hollywoodResponse.ok) {
      errorLog(`Hollywood Celebrity Scraper returned status ${hollywoodResponse.status}`);
    } else {
      const data = await hollywoodResponse.json();
      log(`✅ CRON SUCCESS: Hollywood Celebrity Scraper - ${data.message || 'Success'}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('⚠️ CRON SKIP: Next.js server not reachable for celebrities.', 'WARN');
    } else {
      errorLog('❌ CRON FATAL (Celebrity):', error);
    }
  }
};

// --- Scheduling ---

/**
 * Wait for the Next.js server to be ready before starting initial run
 */
const waitForServer = async (maxRetries = 20, delay = 5000) => {
  log(`Waiting for Next.js server at ${NEXTJS_URL} to be ready...`);
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${NEXTJS_URL}/api/health`, { timeout: 2000 });
      if (response.ok) {
        log('✅ Next.js server is ready. Starting automation.');
        return true;
      }
    } catch (error) {
      // Ignore connection errors during wait
    }
    log(`Next.js server not ready yet (attempt ${i + 1}/${maxRetries})...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  log('⚠️ Server wait timed out. Starting scheduler anyway, initial run may fail.', 'WARN');
  return false;
};

/**
 * Task 4: Trending Data Sync
 * Fetches Google Trends, YouTube Trends, and enriches with TMDB
 */
const runTrendingSync = async () => {
  log('🕒 CRON START: Trending Data Sync');
  try {
    const response = await fetch(`${NEXTJS_URL}/api/trending/sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET
      },
      timeout: 120000,
    });

    if (!response.ok) {
      errorLog(`Trending Sync returned status ${response.status}`);
    } else {
      log('✅ CRON SUCCESS: Trending Data Updated');
    }
  } catch (error) {
    errorLog('❌ CRON FATAL (Trending Sync):', error);
  }
};

// --- Schedule Jobs ---

// 1. Daily Sync (11:00 AM)
cron.schedule(SCRAPE_INTERVAL, runDailySync);

// 2. Wikipedia Scraper (11:05 AM)
cron.schedule('5 11 * * *', runMovieScraper);

// 3. Trending Sync (Every 1 hour)
cron.schedule('0 * * * *', runTrendingSync);

// Heartbeat (Daily 11:00 AM)
cron.schedule(HEARTBEAT_INTERVAL, () => {
  log('💓 Scheduler Heartbeat: Service is active and monitoring.');
});

// Initial run on startup
const start = async () => {
  log('🚀 Executing initial automation run...');
  const isReady = await waitForServer();
  if (isReady) {
    Promise.allSettled([runDailySync(), runCelebrityScraper()]);
  }
};

start();

// --- Process Management ---

process.on('uncaughtException', (err) => {
  errorLog('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  errorLog('UNHANDLED REJECTION at:', promise);
  errorLog('Reason:', reason);
});

const gracefulShutdown = () => {
  log('Received kill signal, shutting down gracefully...');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

log(`All cron schedules active. Automation interval: ${SCRAPE_INTERVAL}`);
