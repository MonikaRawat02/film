import mongoose from "mongoose";

const SearchAnalyticsSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, unique: true, lowercase: true, trim: true },
    count: { type: Number, default: 1 },
    category: { type: String, default: "Bollywood" },
  },
  { timestamps: true }
);

export default mongoose.models.SearchAnalytics || mongoose.model("SearchAnalytics", SearchAnalyticsSchema);
