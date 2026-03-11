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
  },
  { timestamps: true }
);

export default mongoose.models.BoxOffice || mongoose.model("BoxOffice", BoxOfficeSchema);
