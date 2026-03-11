import mongoose from "mongoose";

const OTTIntelligenceSchema = new mongoose.Schema(
  {
    platformName: { type: String, required: true }, // e.g., "Netflix"
    averageDealValue: { type: String, required: true }, // e.g., "$15M–$50M"
    marketShare: { type: Number, required: true }, // 0 to 100
    statusLabel: { type: String, required: true }, // e.g., "Most Active", "Growing", "Regional Focus"
    detailsLink: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.OTTIntelligence || mongoose.model("OTTIntelligence", OTTIntelligenceSchema);
