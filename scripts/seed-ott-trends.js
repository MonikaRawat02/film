/**
 * Seed OTT Weekly Trends Data
 * Creates initial trend reports for the current and recent weeks
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const OTTTrend = require('../model/OTTTrend.js').default;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Generate week identifier
function getWeekIdentifier(date) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Sample trend data
const sampleTrends = [
  {
    week: getWeekIdentifier(new Date()),
    topMovie: {
      title: "Oppenheimer",
      platform: "Netflix",
      imdbRating: 8.5,
      buzzScore: 95
    },
    topSeries: {
      title: "The Last of Us",
      platform: "Amazon Prime Video",
      imdbRating: 8.8,
      buzzScore: 98
    },
    topActor: {
      name: "Cillian Murphy",
      reason: "Oscar buzz for Oppenheimer performance",
      buzzScore: 97
    },
    highestBuzzFilm: {
      title: "Dune: Part Two",
      platform: "Netflix",
      buzzScore: 92
    },
    fastestGrowingPlatform: {
      name: "Amazon Prime Video",
      growthRate: 15,
      reason: "Strong regional content and competitive pricing"
    },
    insights: [
      "Crime thrillers dominating OTT viewership in India",
      "Korean dramas seeing 300% growth in engagement",
      "Regional cinema outperforming Hindi films on streaming",
      "Mini-series format showing highest retention rates",
      "Family dramas increasing average watch time by 40%"
    ],
    audienceTrends: [
      { trend: "Korean Dramas", category: "International", growth: 300 },
      { trend: "Crime Thrillers", category: "Genre", growth: 150 },
      { trend: "Regional Content", category: "Language", growth: 200 },
      { trend: "Mini-Series", category: "Format", growth: 180 }
    ]
  },
  {
    week: getWeekIdentifier(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    topMovie: {
      title: "Barbie",
      platform: "Disney+ Hotstar",
      imdbRating: 7.2,
      buzzScore: 94
    },
    topSeries: {
      title: "Succession",
      platform: "Amazon Prime Video",
      imdbRating: 8.9,
      buzzScore: 96
    },
    topActor: {
      name: "Margot Robbie",
      reason: "Barbie movie phenomenon and cultural impact",
      buzzScore: 98
    },
    highestBuzzFilm: {
      title: "The Super Mario Bros. Movie",
      platform: "Netflix",
      buzzScore: 88
    },
    fastestGrowingPlatform: {
      name: "Netflix",
      growthRate: 12,
      reason: "Password sharing crackdown driving new subscriptions"
    },
    insights: [
      "Animation genre showing strong family viewing patterns",
      "Drama series maintaining high completion rates",
      "Live sports driving Disney+ Hotstar growth",
      "True crime documentaries gaining popularity",
      "International content consumption up 250%"
    ],
    audienceTrends: [
      { trend: "Animation", category: "Genre", growth: 120 },
      { trend: "Drama Series", category: "Format", growth: 140 },
      { trend: "Sports Streaming", category: "Live", growth: 220 },
      { trend: "Documentaries", category: "Genre", growth: 95 }
    ]
  },
  {
    week: getWeekIdentifier(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    topMovie: {
      title: "Avatar: The Way of Water",
      platform: "Disney+ Hotstar",
      imdbRating: 7.6,
      buzzScore: 90
    },
    topSeries: {
      title: "The Bear",
      platform: "Disney+ Hotstar",
      imdbRating: 8.6,
      buzzScore: 92
    },
    topActor: {
      name: "Jeremy Allen White",
      reason: "The Bear Season 2 critical acclaim",
      buzzScore: 89
    },
    highestBuzzFilm: {
      title: "John Wick: Chapter 4",
      platform: "Amazon Prime Video",
      buzzScore: 91
    },
    fastestGrowingPlatform: {
      name: "Disney+ Hotstar",
      growthRate: 18,
      reason: "IPL streaming and Marvel content"
    },
    insights: [
      "Action franchises driving platform subscriptions",
      "Comedy series seeing increased engagement",
      "South Indian content gaining pan-India appeal",
      "Premium tier subscriptions growing faster than basic",
      "Mobile-first viewing patterns emerging in tier 2/3 cities"
    ],
    audienceTrends: [
      { trend: "Action Franchises", category: "Genre", growth: 110 },
      { trend: "Comedy", category: "Genre", growth: 85 },
      { trend: "South Indian Films", category: "Regional", growth: 175 },
      { trend: "Mobile Viewing", category: "Device", growth: 130 }
    ]
  }
];

async function seedOTTTrends() {
  console.log('🚀 Starting OTT Trends Seed...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing trends
    console.log('️  Clearing existing trend data...');
    await OTTTrend.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert new trends
    console.log('📊 Seeding weekly trend reports...');
    for (const trend of sampleTrends) {
      console.log(`   → Creating trend for ${trend.week}...`);
      const created = await OTTTrend.create(trend);
      console.log(`   ✅ ${trend.week} created\n`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SEED SUMMARY:');
    console.log('='.repeat(50));
    console.log(`   ✅ Trend Reports: ${sampleTrends.length}`);
    console.log('='.repeat(50));
    console.log('\n🎉 OTT Trends Seeded Successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Visit admin panel: http://localhost:3000/admin/ott-management');
    console.log('   2. View trends tab to see weekly reports');
    console.log('   3. Add new trend reports weekly\n');

  } catch (error) {
    console.error('\n❌ Seed Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log(' Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed
seedOTTTrends();
