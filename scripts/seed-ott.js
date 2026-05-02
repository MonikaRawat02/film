const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

const platforms = [
  {
    name: "Netflix",
    slug: "netflix",
    tagline: "Premium Global Streaming Leader",
    launchYear: 2016,
    countries: 190,
    rank: 1,
    subscribers: 280000000,
    monthlyVisits: 1800000000,
    marketShare: 31,
    growthRate: 12,
    avgDealValue: "$25M+",
    indiaRank: 2,
    appRating: 4.4,
    pricing: [
      { plan: "Mobile", price: "₹149" },
      { plan: "Basic", price: "₹199" },
      { plan: "Standard", price: "₹499" },
      { plan: "Premium", price: "₹649" }
    ],
    contentLibrary: {
      movies: 5800,
      series: 2300,
      anime: 600,
      docs: 900,
      indianTitles: 480
    },
    genreStrength: [
      { genre: "Thriller", score: 92 },
      { genre: "Crime", score: 84 },
      { genre: "Comedy", score: 71 },
      { genre: "Romance", score: 61 },
      { genre: "Horror", score: 54 }
    ],
    regions: [
      { region: "USA", strength: "High" },
      { region: "India", strength: "Medium" },
      { region: "UK", strength: "High" },
      { region: "Brazil", strength: "High" }
    ],
    revenue: {
      monthly: "$3.5B",
      arpu: "$11",
      growthYoY: "+10%"
    },
    demographics: [
      { group: "18–24", share: 28 },
      { group: "25–34", share: 34 },
      { group: "35–44", share: 21 },
      { group: "45+", share: 17 }
    ],
    producerInsights: [
      "Dark Crime Series",
      "Premium Thriller Films",
      "International Dramas",
      "Big Budget Originals"
    ],
    risks: [
      "High competition",
      "Subscription fatigue",
      "Expensive production costs"
    ],
    comparisonStats: {
      originals: 9,
      movies: 8,
      price: 6,
      indiaReach: 7
    }
  },
  {
    name: "Amazon Prime Video",
    slug: "prime-video",
    tagline: "Affordable + Bundled + Strong India",
    launchYear: 2016,
    countries: 200,
    rank: 2,
    subscribers: 220000000,
    monthlyVisits: 1200000000,
    marketShare: 24,
    growthRate: 15,
    avgDealValue: "$20M+",
    indiaRank: 1,
    appRating: 4.3,
    pricing: [
      { plan: "Monthly", price: "₹299" },
      { plan: "Annual", price: "₹1499" },
      { plan: "Lite (Annual)", price: "₹799" }
    ],
    contentLibrary: {
      movies: 9500,
      series: 1800,
      anime: 200,
      docs: 400,
      indianTitles: 1200
    },
    genreStrength: [
      { genre: "Action", score: 88 },
      { genre: "Drama", score: 85 },
      { genre: "Comedy", score: 78 },
      { genre: "Regional", score: 90 }
    ],
    regions: [
      { region: "USA", strength: "High" },
      { region: "India", strength: "High" },
      { region: "Germany", strength: "High" }
    ],
    revenue: {
      monthly: "$2.8B",
      arpu: "$9",
      growthYoY: "+15%"
    },
    demographics: [
      { group: "18–24", share: 22 },
      { group: "25–34", share: 38 },
      { group: "35–44", share: 25 },
      { group: "45+", share: 15 }
    ],
    producerInsights: [
      "Mass Masala Entertainers",
      "Regional Blockbusters",
      "Reality Shows",
      "Family Dramas"
    ],
    risks: [
      "Fragmented user base",
      "Heavy reliance on retail bundle",
      "Interface complexity"
    ],
    comparisonStats: {
      originals: 8,
      movies: 9,
      price: 9,
      indiaReach: 9
    }
  },
  {
    name: "Disney+ Hotstar",
    slug: "disney-hotstar",
    tagline: "Sports + Family + Indian Content",
    launchYear: 2015,
    countries: 100,
    rank: 3,
    subscribers: 75000000,
    monthlyVisits: 900000000,
    marketShare: 18,
    growthRate: 8,
    avgDealValue: "$15M+",
    indiaRank: 3,
    appRating: 4.2,
    pricing: [
      { plan: "Super", price: "₹299" },
      { plan: "Premium", price: "1499" }
    ],
    contentLibrary: {
      movies: 4500,
      series: 1200,
      anime: 100,
      docs: 300,
      indianTitles: 1800
    },
    genreStrength: [
      { genre: "Sports", score: 98 },
      { genre: "Family", score: 85 },
      { genre: "Kids", score: 90 },
      { genre: "Hollywood", score: 82 }
    ],
    regions: [
      { region: "India", strength: "High" },
      { region: "Southeast Asia", strength: "Medium" }
    ],
    revenue: {
      monthly: "$1.2B",
      arpu: "$7",
      growthYoY: "+8%"
    },
    demographics: [
      { group: "18–24", share: 20 },
      { group: "25–34", share: 35 },
      { group: "35–44", share: 28 },
      { group: "45+", share: 17 }
    ],
    producerInsights: [
      "Cricket Streaming Rights",
      "Marvel/Disney Content",
      "Family Movies",
      "Kids Animation"
    ],
    risks: [
      "IPL rights competition",
      "Content cost inflation",
      "Netflix/Prime pressure"
    ],
    comparisonStats: {
      originals: 6,
      movies: 7,
      price: 8,
      indiaReach: 10
    }
  }
];

async function seedOTTData() {
  console.log('🚀 Starting OTT Data Seed...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import models after connection
    const OTTPlatform = require('../model/OTTPlatform.js').default;
    const OTTTitle = require('../model/OTTTitle.js').default;
    const OTTAcquisition = require('../model/OTTAcquisition.js').default;

    // Clear existing data
    console.log('️  Clearing existing OTT data...');
    await OTTPlatform.deleteMany({});
    await OTTTitle.deleteMany({});
    await OTTAcquisition.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed platforms
    console.log('📺 Seeding OTT Platforms...');
    for (const p of platforms) {
      console.log(`   → Creating ${p.name}...`);
      const created = await OTTPlatform.create(p);
      console.log(`   ✅ ${p.name} created (ID: ${created._id})`);

      // Seed some titles
      await OTTTitle.create([
        { 
          platformId: created._id, 
          title: "Top Series 1", 
          type: "series", 
          rating: 8.5, 
          trendScore: 90, 
          popularityScore: 95, 
          watchTrend: 12 
        },
        { 
          platformId: created._id, 
          title: "Hit Movie 1", 
          type: "movie", 
          rating: 7.8, 
          trendScore: 85, 
          popularityScore: 88, 
          watchTrend: 8 
        }
      ]);
      console.log(`   → Added 2 titles for ${p.name}`);

      // Seed some acquisitions
      await OTTAcquisition.create([
        { 
          platformId: created._id, 
          title: "Blockbuster 1", 
          language: "Hindi", 
          dealValue: "$15M",
          dealType: "Exclusive"
        },
        { 
          platformId: created._id, 
          title: "Regional Hit 1", 
          language: "Telugu", 
          dealValue: "$10M",
          dealType: "Post-Theatrical"
        }
      ]);
      console.log(`   → Added 2 acquisitions for ${p.name}\n`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SEED SUMMARY:');
    console.log('='.repeat(50));
    console.log(`   ✅ Platforms: ${platforms.length}`);
    console.log(`   ✅ Titles: ${platforms.length * 2}`);
    console.log(`   ✅ Acquisitions: ${platforms.length * 2}`);
    console.log('='.repeat(50));
    console.log('\n🎉 OTT Data Seeded Successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your dev server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/ott');
    console.log('   3. Check platform intelligence data\n');

  } catch (error) {
    console.error('\n❌ Seed Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log(' Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed
seedOTTData();
