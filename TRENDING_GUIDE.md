# Trending Intelligence - Complete Setup Guide

## ✅ What Was Implemented

### 1. **Admin Dashboard - Trending Intelligence**
- **Location**: `pages/admin/trending-intelligence.jsx`
- **URL**: `http://localhost:3000/admin/trending-intelligence`
- **Features**:
  - Display trending movies, actors, and viral topics
  - Real-time stats for each category
  - **🔥 "Sync Trends" button** - One-click sync from all sources
  - Live sync statistics (processed, validated, rejected, breakdown)
  - Search across all trends
  - Tab-based filtering (All, Movies, Actors, Topics)
  - Trend cards with posters, scores, keywords
  - Click any trend to view full profile

### 2. **Sync & Enrichment API**
- **Location**: `pages/api/trending/sync.js`
- **Method**: POST with CRON secret
- **What It Does**:
  1. Fetches from Google Trends & YouTube
  2. Preprocesses and classifies (movie/actor/topic)
  3. **Validates against your database** - Only matches are kept
  4. Enriches with full content (posters, metadata, net worth)
  5. Calculates intelligent score
  6. Stores in MongoDB with 7-day expiry
  7. Returns detailed statistics

### 3. **Trending Data API**
- **Location**: `pages/api/trending/index.js`
- **Method**: GET (public)
- **Usage**: `GET /api/trending?limit=20&type=trending_movies`
- **Returns**: All verified trends grouped by type with full metadata

---

## 🚀 Quick Start (3 Steps)

### **Step 1: Sync Trends (One Click)**
```
1. Go to: http://localhost:3000/admin/trending-intelligence
2. Click red "Sync Trends" button (top right)
3. Wait for completion (takes 1-2 minutes)
4. See results in green "Last Sync Results" card
```

**Example Output**:
```
✅ Last Sync Results
Processed: 25 | Validated: 8 | Rejected: 17
🎬 Movies: 3 | 👤 Actors: 2 | 📊 Topics: 3
```

### **Step 2: View & Search**
- Page auto-refreshes after sync
- Search by movie name, actor name, or keywords
- Filter by category (Movies, Actors, Topics)
- Click any trend to view full profile

### **Step 3: Setup Auto-Sync (Optional)**
For production, add to your scheduler/cron:
```javascript
import { initializeTrendingAutomation } from "./lib/trending/scheduler.js";
initializeTrendingAutomation(); // Runs every 30 minutes
```

---

## 📊 Complete Data Flow

```
┌─────────────────────────────────────┐
│  Google Trends + YouTube APIs       │
└──────────────┬──────────────────────┘
               ↓
      [Raw Trends: 25 items]
               ↓
    ┌──────────────────────────┐
    │  1. Preprocessing        │ Clean, normalize, extract keywords
    │  2. Classification       │ movie/actor/topic detection with AI
    └──────────────┬───────────┘
                   ↓
    ┌──────────────────────────────────────┐
    │  🔍 Database Validation              │
    │  ├─ Check TMDB Database             │
    │  ├─ Check Celebrity DB              │
    │  └─ Check entertainment relevance   │
    └──────────────┬───────────────────────┘
                   ↓ (Valid only)
      [Validated Trends: 8 items] ✅
                   ↓
    ┌──────────────────────────┐
    │  Enrichment              │ 
    │  • Movie: poster, genres │
    │  • Actor: photo, networth│
    │  • Topic: keywords       │
    └──────────────┬───────────┘
                   ↓
    ┌──────────────────────────┐
    │  Smart Scoring           │
    │  • Traffic:    40%       │
    │  • Views:      30%       │
    │  • Recency:    20%       │
    │  • Confidence: 10%       │
    └──────────────┬───────────┘
                   ↓
    ┌──────────────────────────┐
    │  MongoDB Storage         │ 7-day expiry
    └──────────────┬───────────┘
                   ↓
    ┌──────────────────────────┐
    │  GET /api/trending       │
    └──────────────┬───────────┘
                   ↓
    ┌──────────────────────────┐
    │  Admin Dashboard Display │
    └──────────────────────────┘
```

---

## 🎯 Key Features

✅ **Database-First**: Only displays verified trends from your DB
✅ **Auto-Enrichment**: Adds full metadata (posters, genres, net worth)
✅ **Smart Scoring**: Traffic (40%) + Views (30%) + Recency (20%) + Confidence (10%)
✅ **Auto-Cleanup**: Old trends expire and are removed after 7 days
✅ **Search & Filter**: Full-text search across all trends and keywords
✅ **One-Click Sync**: Manual sync button with live feedback
✅ **Real-Time Stats**: Shows breakdown of validated/rejected trends
✅ **Automated CRON**: Runs every 30 minutes (optional)
✅ **Detailed Logging**: Console shows each step for debugging
✅ **Type-Specific Filtering**: Get movies, actors, or topics separately

---

## 📋 API Responses

### **Fetch All Trends**
```
GET /api/trending?limit=20&region=IN

Response:
{
  "success": true,
  "data": {
    "trending_movies": [
      {
        "title": "Pathaan",
        "type": "trending_movies",
        "slug": "pathaan",
        "score": 92,
        "traffic": 1250000,
        "keywords": ["pathaan", "srk", "movie"],
        "metadata": {
          "coverImage": "...",
          "movieTitle": "Pathaan",
          "director": "Siddharth Anand",
          "genres": "Action, Thriller",
          "boxOffice": "$116.2M"
        }
      }
    ],
    "trending_actors": [
      {
        "title": "Shah Rukh Khan",
        "type": "trending_actors",
        "score": 85,
        "metadata": {
          "profileImage": "...",
          "industry": "Bollywood",
          "netWorth": "$900M"
        }
      }
    ],
    "viral_topics": [...]
  },
  "total": {
    "movies": 3,
    "actors": 2,
    "topics": 5,
    "all": 10
  }
}
```

### **Sync Trends (Trigger Manually)**
```
POST /api/trending/sync
Headers: x-cron-secret: filmyfire_automation_secret_2026

Response:
{
  "success": true,
  "message": "Trends synced and enriched successfully",
  "stats": {
    "processed": 25,
    "validated": 8,
    "rejected": 17,
    "movies": 3,
    "actors": 2,
    "topics": 3,
    "saved": 8
  }
}
```

---

## 🔧 Configuration

Add to `.env`:
```env
# APIs
YOUTUBE_API_KEY=your_youtube_api_key
TMDB_API_KEY=your_tmdb_api_key
GEMINI_API_KEY=your_gemini_api_key

# Trending System
CRON_SECRET=filmyfire_automation_secret_2026
TRENDING_REGION=IN
```

---

## 📁 Files Structure

**Created/Modified Files**:
- ✅ `pages/admin/trending-intelligence.jsx` - Admin dashboard with sync button
- ✅ `pages/api/trending/sync.js` - Sync & enrichment endpoint
- ✅ `pages/api/trending/index.js` - Enhanced API (improved formatting)
- ✅ `scripts/manual-trend-sync.js` - Manual sync script

**Existing Files Used**:
- ✅ `lib/trending/data-ingestion.js` - Fetch trends from sources
- ✅ `lib/trending/preprocessing.js` - Clean and classify
- ✅ `lib/trending/validation.js` - Database validation
- ✅ `model/trending.js` - Data model

---

## 🎬 Admin Page Features

### **Header Section**
- Title: "Trending Intelligence - Automated based on Google Trends and YouTube data"
- **Sync Trends Button** (Red): One-click sync with live feedback
- **Refresh Button** (Blue): Refresh currently displayed data
- Last updated timestamp

### **Statistics Cards**
- Trending Movies count
- Trending Actors count
- Viral Topics count

### **Sync Statistics Display**
After clicking sync, shows green card with:
- Processed: Total trends analyzed
- Validated: Successfully matched in database
- Rejected: Not found in database
- 🎬 Movies: Count of movie trends
- 👤 Actors: Count of actor trends
- 📊 Topics: Count of topic trends

### **Search & Filter**
- Search box to find trends by name/keywords
- Tabs: All, Movies, Actors, Topics
- Real-time filtering

### **Trend Cards**
- Poster/thumbnail image
- Title and keywords
- Score with flame icon
- Category badge (Movie/Actor/Topic)
- Source (Google/YouTube)
- View count

---

## 🏃 Usage Scenarios

### **Scenario 1: Fresh Setup**
```
1. Visit /admin/trending-intelligence
2. Click "Sync Trends"
3. Wait for sync to complete
4. See populated dashboard
5. Search for specific trends
```

### **Scenario 2: Daily Update**
```
1. Click "Sync Trends" in morning
2. Automated CRON runs every 30 minutes
3. Dashboard always shows latest
4. Expired trends removed automatically
```

### **Scenario 3: Find Specific Trend**
```
1. Use search box (type movie/actor name)
2. Use tabs to filter by type
3. Click trend to view full profile
4. Links to movie/actor pages
```

---

## 🧪 Testing

### **Test Sync Endpoint Directly**
```bash
curl -X POST http://localhost:3000/api/trending/sync \
  -H "x-cron-secret: filmyfire_automation_secret_2026" \
  -H "Content-Type: application/json"
```

### **Test API Fetch**
```bash
# All trends
curl http://localhost:3000/api/trending?limit=20

# Only movies
curl http://localhost:3000/api/trending?type=trending_movies&limit=10

# Only actors
curl http://localhost:3000/api/trending?type=trending_actors&limit=10

# Only topics
curl http://localhost:3000/api/trending?type=viral_topics&limit=10
```

---

## ✨ What's Unique

1. **Database-First** - Rejects non-matching trends automatically
2. **Full Enrichment** - Adds posters, metadata, net worth
3. **Smart Scoring** - Multi-factor ranking algorithm
4. **Auto-Cleanup** - 7-day expiry with auto-deletion
5. **Admin Integration** - One-click sync with stats
6. **Detailed Logging** - See exactly what's happening
7. **Type Flexibility** - Movies, actors, and topics
8. **Production Ready** - CRON automation included

---

## 🎓 Next Steps

1. ✅ Go to `/admin/trending-intelligence`
2. ✅ Click "Sync Trends" button
3. ✅ Wait for completion (1-2 minutes)
4. ✅ See trends displayed with stats
5. ✅ Test search and filtering
6. ✅ Optional: Setup CRON for production

---

**This system ensures only verified, enriched, high-quality trends are displayed on your platform!**
