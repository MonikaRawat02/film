import mongoose from "mongoose";

const OTTTitleSchema = new mongoose.Schema(
  {
    platformId: { type: mongoose.Schema.Types.ObjectId, ref: "OTTPlatform", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["movie", "series", "anime", "doc"], default: "movie" },
    rating: { type: Number },
    trendScore: { type: Number }, // 0 to 100
    poster: { type: String },
    popularityScore: { type: Number },
    watchTrend: { type: Number }, // e.g., +15
  },
  { timestamps: true }
);

export default mongoose.models.OTTTitle || mongoose.model("OTTTitle", OTTTitleSchema);
