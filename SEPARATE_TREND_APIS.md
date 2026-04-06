# Separate Trending APIs with 1-Hour CRON Scheduling

## Overview

You now have **separate APIs for Google Trends and YouTube data** running on a **1-hour schedule with CRON automation**. This gives you complete clarity on which data is coming from which source.

---

## API Endpoints

### 1. **Google Trends API**
```
POST /api/trending/google-trends
GET  /api/trending/google-trends
```

**What it does:**
- Fetches ONLY Google Trends data (search volume trends)
- Validates against your database
- Enriches with metadata
- Stores with `source: "google"` tag
- Scoring: 60% traffic, 30% recency, 10% confidence

**Response:**
```json
{
  "success": true,
  "message": "Google Trends synced successfully",
  "stats": {
    "processed": 37,
    "validated": 15,
    "rejected": 22,
    "movies": 3,
    "actors": 5,
    "topics": 7,
    "source": "google"
  }
}
```

### 2. **YouTube Trends API**
```
POST /api/trending/youtube-trends
GET  /api/trending/youtube-trends
```

**What it does:**
- Fetches ONLY YouTube trending data from 3 categories:
  - Film & Animation
  - Entertainment
  - Movies
- Removes duplicates
- Validates against your database
- Enriches with metadata
- Stores with `source: "youtube"` tag
- Scoring: 50% view count, 30% recency, 20% confidence

**Response:**
```json
{
  "success": true,
  "message": "YouTube trends synced successfully",
  "stats": {
    "processed": 45,
    "validated": 18,
    "rejected": 27,
    "movies": 2,
    "actors": 8,
    "topics": 8,
    "source": "youtube"
  }
}
```

---

## CRON Automation Schedule

Both APIs run automatically on a **1-hour schedule with 30-minute offset**:

```
Google Trends API:  Every hour at :00 minutes
  - 2:00 AM, 3:00 AM, 4:00 AM, etc.

YouTube API:        Every hour at :30 minutes (30 mins after Google)
  - 2:30 AM, 3:30 AM, 4:30 AM, etc.
```

**Why the offset?**
- Prevents both APIs running simultaneously
- Spreads database load over time
- Google runs first, YouTube 30 minutes later
- Ensures steady stream of trending updates

---

## Setup Instructions

### Step 1: Enable Automation in Your App

Add this to your main server file (e.g., `pages/api/init.js`, `scheduler.js`, or `_app.js`):

```javascript
import { initializeTrendAutomation } from "./lib/trending/trend-scheduler.js";

// On server startup
if (process.env.NODE_ENV === "production") {
  initializeTrendAutomation();
  console.log("Trend automation started");
}
```

### Step 2: Verify in Environment Variables

Ensure your `.env` has:
```env
CRON_SECRET=filmyfire_automation_secret_2026
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # For testing
# Or for production:
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 3: Test Each API Manually

**Test Google Trends:**
```bash
curl -X POST http://localhost:3000/api/trending/google-trends \
  -H "x-cron-secret: filmyfire_automation_secret_2026" \
  -H "Content-Type: application/json"
```

**Test YouTube Trends:**
```bash
curl -X POST http://localhost:3000/api/trending/youtube-trends \
  -H "x-cron-secret: filmyfire_automation_secret_2026" \
  -H "Content-Type: application/json"
```

---

## View Results by Source

All trends are stored in MongoDB with `source` field. You can query them:

```javascript
// Get ONLY Google Trends
db.trendings.find({ source: "google" })

// Get ONLY YouTube Trends
db.trendings.find({ source: "youtube" })

// Get combined results
db.trendings.find({ source: { $in: ["google", "youtube"] } })
```

---

## How to Use in Admin Dashboard

Update `/pages/admin/trending-intelligence.jsx` to show source filter:

```javascript
// Get trends by source
const googleTrends = await fetch("/api/trending/google-trends?limit=20");
const youtubeTrends = await fetch("/api/trending/youtube-trends?limit=20");

// Or get combined
const allTrends = await fetch("/api/trending?limit=20");
```

---

## Scheduler Functions

### Initialize Both (Recommended)
```javascript
import { initializeTrendAutomation } from "./lib/trending/trend-scheduler.js";

initializeTrendAutomation();
```

### Initialize Individual Jobs
```javascript
import { 
  initializeGoogleTrendsCron,
  initializeYouTubeTrendsCron
} from "./lib/trending/trend-scheduler.js";

initializeGoogleTrendsCron();   // Runs at :00
initializeYouTubeTrendsCron();  // Runs at :30
```

### Stop Automation
```javascript
import { stopTrendAutomation } from "./lib/trending/trend-scheduler.js";

stopTrendAutomation();
```

### Check Status
```javascript
import { getTrendAutomationStatus } from "./lib/trending/trend-scheduler.js";

const status = getTrendAutomationStatus();
console.log(status);
// Output:
// {
//   googleTrendsActive: true,
//   youtubeTrendsActive: true,
//   schedule: {
//     googleTrends: "Every hour at :00",
//     youtubeTrends: "Every hour at :30"
//   }
// }
```

---

## Console Output Example

When automation runs, you'll see:

```
[2026-04-04 14:00:00] [START] Google Trends Sync
[SUCCESS] Google Trends Sync:
   Processed: 37
   Validated: 15
   Movies: 3, Actors: 5, Topics: 7

[2026-04-04 14:30:00] [START] YouTube Trends Sync
[SUCCESS] YouTube Trends Sync:
   Processed: 45
   Validated: 18
   Movies: 2, Actors: 8, Topics: 8
```

---

## Data Clarity

### Google Trends Stored As
```javascript
{
  title: "Pathaan movie",
  source: "google",  // <-- Clear source
  traffic: 1500000,
  viewCount: 0,      // Google doesn't have views
  score: 85,
  type: "trending_movies"
}
```

### YouTube Trends Stored As
```javascript
{
  title: "Shah Rukh Khan interview",
  source: "youtube", // <-- Clear source
  traffic: 0,        // YouTube doesn't have traffic
  viewCount: 5000000,
  score: 78,
  type: "trending_actors"
}
```

---

## Monitoring

### View Real-Time Logs
```bash
# Development
npm run dev  # See logs in console

# Production
tail -f logs/trends.log  # Or wherever logs are stored
```

### Check Database Stats
```bash
# MongoDB Query
db.trendings.aggregate([
  { $group: { 
    _id: "$source", 
    count: { $sum: 1 },
    movies: { $sum: { $cond: ["$type", 1, 0] } }
  }}
])

# Result:
# { _id: "google", count: 52, movies: 15 }
# { _id: "youtube", count: 67, movies: 12 }
```

---

## Files Created

✅ `pages/api/trending/google-trends.js` - Google Trends sync endpoint
✅ `pages/api/trending/youtube-trends.js` - YouTube Trends sync endpoint
✅ `lib/trending/trend-scheduler.js` - CRON scheduling system

---

## Next Steps

1. ✅ Add `initializeTrendAutomation()` to your app startup
2. ✅ Test each API manually with curl commands
3. ✅ Verify console logs show syncing
4. ✅ Check MongoDB for data with `source` field
5. ✅ Update admin dashboard to show trends by source
6. ✅ Monitor logs and database stats

---

**Now you have complete clarity: Google Trends data flows in at :00, YouTube data at :30, and each is clearly marked with the source field!**
