import mongoose from "mongoose";

const OTTTrendSchema = new mongoose.Schema(
  {
    week: { type: String, required: true }, // Format: "2026-W18"
    topMovie: { 
      title: String,
      platform: String,
      imdbRating: Number,
      buzzScore: Number
    },
    topSeries: { 
      title: String,
      platform: String,
      imdbRating: Number,
      buzzScore: Number
    },
    topActor: {
      name: String,
      reason: String,
      buzzScore: Number
    },
    highestBuzzFilm: {
      title: String,
      platform: String,
      buzzScore: Number
    },
    fastestGrowingPlatform: {
      name: String,
      growthRate: Number,
      reason: String
    },
    insights: [String],
    audienceTrends: [
      {
        trend: String,
        category: String,
        growth: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.OTTTrend || mongoose.model("OTTTrend", OTTTrendSchema);
