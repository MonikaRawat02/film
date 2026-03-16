import mongoose from "mongoose";

const BoxOfficeSchema = new mongoose.Schema(
  {
    movieName: { type: String, required: true },
    budget: { type: String, required: true }, // e.g., "$350M"
    collection: { type: String, required: true }, // e.g., "$2.3B"
    roi: { type: String, required: true }, // e.g., "+562%"
    verdict: { 
      type: String, 
      required: true, 
      enum: ["BLOCKBUSTER", "SUPER HIT", "HIT", "AVERAGE", "FLOP"] 
    },
    analysisLink: { type: String },
    movieDNA: {
      emotionalIntensity: { type: Number, default: 0, min: 0, max: 100 },
      violenceLevel: { type: Number, default: 0, min: 0, max: 100 },
      psychologicalDepth: { type: Number, default: 0, min: 0, max: 100 },
      familyFriendliness: { type: Number, default: 0, min: 0, max: 100 },
      complexityLevel: { type: Number, default: 0, min: 0, max: 100 },
    },
  }, 
  { timestamps: true }
);

// Delete the model if it exists to ensure schema updates take effect
if (mongoose.models.BoxOffice) {
  delete mongoose.models.BoxOffice;
}

export default mongoose.model("BoxOffice", BoxOfficeSchema);
