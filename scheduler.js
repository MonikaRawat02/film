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

/**
 * Task 5: Weekly Recommendation Engine Update
 * Calculates similar movies for all movies in database
 */
const runRecommendationUpdate = async () => {
  log('🕒 CRON START: Weekly Recommendation Engine Update');
  try {
    // First, get all movie slugs
    const articlesResponse = await fetch(`${NEXTJS_URL}/api/articles/list?limit=10000&includeDrafts=true`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET
      },
      timeout: 30000,
    });

    if (!articlesResponse.ok) {
      errorLog(`Failed to fetch article list: ${articlesResponse.status}`);
      return;
    }

    const articlesData = await articlesResponse.json();
    if (!articlesData.success || !articlesData.data) {
      errorLog('No articles found in database');
      return;
    }

    const allSlugs = articlesData.data.map(article => article.slug);
    log(`📊 Found ${allSlugs.length} movies to process`);

    // Process in batches of 50
    const BATCH_SIZE = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allSlugs.length; i += BATCH_SIZE) {
      const batch = allSlugs.slice(i, i + BATCH_SIZE);
      
      try {
        const response = await fetch(`${NEXTJS_URL}/api/admin/batch-calculate-recommendations`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-cron-secret': CRON_SECRET
          },
          body: JSON.stringify({
            slugs: batch,
            limitPerMovie: 8
          }),
          timeout: 120000,
        });

        const result = await response.json();

        if (result.success) {
          successCount += result.count;
          log(`✅ Batch ${Math.floor(i/BATCH_SIZE) + 1}: Updated ${result.count} movies`);
        } else {
          errorCount++;
          errorLog(`Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, new Error(result.message));
        }
      } catch (error) {
        errorCount++;
        errorLog(`Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error);
      }

      // Add delay between batches
      if (i < allSlugs.length - BATCH_SIZE) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    log(`✅ CRON COMPLETE: Recommendation Update - ${successCount}/${allSlugs.length} movies updated successfully`);
    if (errorCount > 0) {
      log(`⚠️ Failed batches: ${errorCount}`, 'WARN');
    }
  } catch (error) {
    errorLog('❌ CRON FATAL (Recommendation Update):', error);
  }
};

/**
 * Task 6: Weekly Discovery Page Generation
 * Auto-generates discovery pages like /best-thriller-movies, /top-netflix-movies
 */
const runDiscoveryPageGeneration = async () => {
  log('🕒 CRON START: Weekly Discovery Page Generation');
  try {
    const response = await fetch(`${NEXTJS_URL}/api/admin/automation/generate-discovery-pages?type=all`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET
      },
      timeout: 300000, // 5 minutes timeout for heavy generation
    });

    if (!response.ok) {
      errorLog(`Discovery Page Generation returned status ${response.status}`);
    } else {
      const data = await response.json();
      log(`✅ CRON SUCCESS: Discovery Page Generation - ${data.message}`);
    }
  } catch (error) {
    errorLog('❌ CRON FATAL (Discovery Pages):', error);
  }
};

// --- Schedule Jobs ---

// 1. Daily Sync (11:00 AM)
cron.schedule(SCRAPE_INTERVAL, runDailySync);

// 2. Wikipedia Scraper (11:05 AM)
cron.schedule('5 11 * * *', runMovieScraper);

// 3. Trending Sync (Every 30 minutes)
cron.schedule('*/30 * * * *', runTrendingSync);

// 4. Weekly Recommendation Update (Every Sunday at 2:00 AM)
cron.schedule('0 2 * * 0', runRecommendationUpdate);

// 5. Weekly Discovery Page Generation (Every Sunday at 3:00 AM)
cron.schedule('0 3 * * 0', runDiscoveryPageGeneration);

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
