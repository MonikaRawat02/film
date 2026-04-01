/**
 * Database Index Creation Script
 * Run this script to create optimized indexes for faster queries
 * 
 * Usage: node scripts/create-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function createIndexes() {
  console.log('🚀 Starting database index creation...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // ============================================
    // ARTICLES COLLECTION INDEXES
    // ============================================
    console.log('📚 Creating indexes for ARTICLES collection...');
    
    const articlesIndexes = [
      // Primary lookup indexes
      { key: { slug: 1 }, options: { unique: true, name: 'idx_slug_unique' } },
      { key: { category: 1 }, options: { name: 'idx_category' } },
      { key: { contentType: 1 }, options: { name: 'idx_content_type' } },
      { key: { status: 1 }, options: { name: 'idx_status' } },
      
      // Compound indexes for common queries
      { key: { category: 1, status: 1 }, options: { name: 'idx_category_status' } },
      { key: { contentType: 1, status: 1 }, options: { name: 'idx_contenttype_status' } },
      { key: { category: 1, releaseYear: -1 }, options: { name: 'idx_category_year' } },
      { key: { genres: 1, rating: -1 }, options: { name: 'idx_genres_rating' } },
      
      // Search and sorting indexes
      { key: { releaseYear: -1 }, options: { name: 'idx_release_year_desc' } },
      { key: { rating: -1 }, options: { name: 'idx_rating_desc' } },
      { key: { 'stats.views': -1 }, options: { name: 'idx_views_desc' } },
      { key: { trendingScore: -1 }, options: { name: 'idx_trending_desc' } },
      { key: { createdAt: -1 }, options: { name: 'idx_created_desc' } },
      { key: { updatedAt: -1 }, options: { name: 'idx_updated_desc' } },
      
      // OTT and Box Office indexes
      { key: { 'ott.platform': 1 }, options: { name: 'idx_ott_platform', sparse: true } },
      { key: { 'boxOffice.worldwide': -1 }, options: { name: 'idx_boxoffice_worldwide', sparse: true } },
      
      // Full-text search index
      { key: { movieTitle: 'text', title: 'text', summary: 'text' }, options: { name: 'idx_fulltext_search', default_language: 'english' } },
      
      // Related content indexes
      { key: { 'relatedMovies.slug': 1 }, options: { name: 'idx_related_movies', sparse: true } },
      { key: { lastRecommendationUpdate: 1 }, options: { name: 'idx_recommendation_update', sparse: true } },
    ];

    for (const idx of articlesIndexes) {
      try {
        await db.collection('articles').createIndex(idx.key, idx.options);
        console.log(`  ✅ Created index: ${idx.options.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`  ⚠️ Index ${idx.options.name} already exists (different options)`);
        } else if (error.code === 11000) {
          console.log(`  ⚠️ Index ${idx.options.name} already exists`);
        } else {
          console.error(`  ❌ Failed to create ${idx.options.name}:`, error.message);
        }
      }
    }

    // ============================================
    // CELEBRITIES COLLECTION INDEXES
    // ============================================
    console.log('\n👤 Creating indexes for CELEBRITIES collection...');
    
    const celebritiesIndexes = [
      { key: { slug: 1 }, options: { unique: true, name: 'idx_slug_unique' } },
      { key: { name: 1 }, options: { name: 'idx_name' } },
      { key: { industry: 1 }, options: { name: 'idx_industry' } },
      { key: { status: 1 }, options: { name: 'idx_status' } },
      { key: { 'netWorth.estimatedTotal': -1 }, options: { name: 'idx_networth_desc', sparse: true } },
      { key: { name: 'text', biography: 'text' }, options: { name: 'idx_fulltext_search' } },
    ];

    for (const idx of celebritiesIndexes) {
      try {
        await db.collection('celebrities').createIndex(idx.key, idx.options);
        console.log(`  ✅ Created index: ${idx.options.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 11000) {
          console.log(`  ⚠️ Index ${idx.options.name} already exists`);
        } else {
          console.error(`  ❌ Failed to create ${idx.options.name}:`, error.message);
        }
      }
    }

    // ============================================
    // DISCOVERY PAGES COLLECTION INDEXES
    // ============================================
    console.log('\n🔍 Creating indexes for DISCOVERYPAGES collection...');
    
    const discoveryIndexes = [
      { key: { slug: 1 }, options: { unique: true, name: 'idx_slug_unique' } },
      { key: { pageType: 1 }, options: { name: 'idx_page_type' } },
      { key: { status: 1 }, options: { name: 'idx_status' } },
      { key: { 'queryParams.genre': 1 }, options: { name: 'idx_query_genre', sparse: true } },
      { key: { 'queryParams.platform': 1 }, options: { name: 'idx_query_platform', sparse: true } },
      { key: { lastRefreshed: -1 }, options: { name: 'idx_last_refreshed' } },
    ];

    for (const idx of discoveryIndexes) {
      try {
        await db.collection('discoverypages').createIndex(idx.key, idx.options);
        console.log(`  ✅ Created index: ${idx.options.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 11000) {
          console.log(`  ⚠️ Index ${idx.options.name} already exists`);
        } else {
          console.error(`  ❌ Failed to create ${idx.options.name}:`, error.message);
        }
      }
    }

    // ============================================
    // TRENDING COLLECTION INDEXES
    // ============================================
    console.log('\n📈 Creating indexes for TRENDING collection...');
    
    const trendingIndexes = [
      { key: { slug: 1 }, options: { unique: true, name: 'idx_slug_unique' } },
      { key: { category: 1 }, options: { name: 'idx_category' } },
      { key: { trendingScore: -1 }, options: { name: 'idx_trending_score_desc' } },
      { key: { lastUpdated: -1 }, options: { name: 'idx_last_updated' } },
    ];

    for (const idx of trendingIndexes) {
      try {
        await db.collection('trendings').createIndex(idx.key, idx.options);
        console.log(`  ✅ Created index: ${idx.options.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 11000) {
          console.log(`  ⚠️ Index ${idx.options.name} already exists`);
        } else {
          console.error(`  ❌ Failed to create ${idx.options.name}:`, error.message);
        }
      }
    }

    // ============================================
    // BOX OFFICE COLLECTION INDEXES
    // ============================================
    console.log('\n💰 Creating indexes for BOXOFFICE collection...');
    
    const boxOfficeIndexes = [
      { key: { movieSlug: 1 }, options: { name: 'idx_movie_slug' } },
      { key: { weekendDate: -1 }, options: { name: 'idx_weekend_date' } },
      { key: { totalWorldwide: -1 }, options: { name: 'idx_total_worldwide' } },
    ];

    for (const idx of boxOfficeIndexes) {
      try {
        await db.collection('boxoffices').createIndex(idx.key, idx.options);
        console.log(`  ✅ Created index: ${idx.options.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 11000) {
          console.log(`  ⚠️ Index ${idx.options.name} already exists`);
        } else {
          console.error(`  ❌ Failed to create ${idx.options.name}:`, error.message);
        }
      }
    }

    // ============================================
    // PRINT INDEX STATISTICS
    // ============================================
    console.log('\n📊 INDEX CREATION SUMMARY:');
    console.log('='.repeat(50));
    
    const collections = ['articles', 'celebrities', 'discoverypages', 'trendings', 'boxoffices'];
    
    for (const collName of collections) {
      try {
        const indexes = await db.collection(collName).indexes();
        console.log(`\n${collName.toUpperCase()}: ${indexes.length} indexes`);
        indexes.forEach(idx => {
          const keys = Object.keys(idx.key).join(', ');
          console.log(`  - ${idx.name}: {${keys}}`);
        });
      } catch (error) {
        console.log(`\n${collName.toUpperCase()}: Collection not found or no indexes`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database index creation complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createIndexes();
