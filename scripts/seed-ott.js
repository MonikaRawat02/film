import dbConnect from "../lib/mongodb";
import OTTPlatform from "../model/OTTPlatform";
import OTTTitle from "../model/OTTTitle";
import OTTAcquisition from "../model/OTTAcquisition";

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
  }
];

export default async function seedOTT() {
  try {
    await dbConnect();
    
    // Clear existing
    await OTTPlatform.deleteMany({});
    await OTTTitle.deleteMany({});
    await OTTAcquisition.deleteMany({});
    
    for (const p of platforms) {
      const created = await OTTPlatform.create(p);
      
      // Seed some titles
      await OTTTitle.create([
        { platformId: created._id, title: "Title 1", type: "series", rating: 8.5, trendScore: 90, popularityScore: 95, watchTrend: 12 },
        { platformId: created._id, title: "Title 2", type: "movie", rating: 7.8, trendScore: 85, popularityScore: 88, watchTrend: 8 }
      ]);
      
      // Seed some acquisitions
      await OTTAcquisition.create([
        { platformId: created._id, title: "Acquired Title 1", language: "Hindi", dealValue: "$15M" },
        { platformId: created._id, title: "Acquired Title 2", language: "Telugu", dealValue: "$10M" }
      ]);
    }
    
    console.log("OTT Data Seeded Successfully!");
  } catch (error) {
    console.error("Seed Error:", error);
  }
}
