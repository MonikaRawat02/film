import mongoose from "mongoose";

const OTTPlatformSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String },
    tagline: { type: String },
    description: { type: String },
    website: { type: String },
    launchYear: { type: Number },
    countries: { type: Number },
    rank: { type: Number },
    subscribers: { type: Number },
    monthlyVisits: { type: Number },
    marketShare: { type: Number },
    growthRate: { type: Number },
    avgDealValue: { type: String },
    indiaRank: { type: Number },
    appRating: { type: Number },
    pricing: [
      {
        plan: { type: String },
        price: { type: String },
      },
    ],
    contentLibrary: {
      movies: { type: Number },
      series: { type: Number },
      anime: { type: Number },
      docs: { type: Number },
      indianTitles: { type: Number },
    },
    genreStrength: [
      {
        genre: { type: String },
        score: { type: Number }, // 0 to 100
      },
    ],
    regions: [
      {
        region: { type: String },
        strength: { type: String }, // High, Medium, Low
      },
    ],
    revenue: {
      monthly: { type: String },
      arpu: { type: String },
      growthYoY: { type: String },
    },
    demographics: [
      {
        group: { type: String },
        share: { type: Number }, // 0 to 100
      },
    ],
    producerInsights: [String],
    risks: [String],
    comparisonStats: {
      originals: { type: Number }, // 1 to 10
      movies: { type: Number },
      price: { type: Number },
      indiaReach: { type: Number },
    },
    statsUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.OTTPlatform || mongoose.model("OTTPlatform", OTTPlatformSchema);
