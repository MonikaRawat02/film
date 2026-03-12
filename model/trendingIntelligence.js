import mongoose from "mongoose";

const TrendingIntelligenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    movieName: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Explained", "Box Office", "OTT"],
      required: true,
    },
    readTime: {
      type: String,
      default: "5 min",
    },
    views: {
      type: String,
      default: "0K",
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

export default mongoose.models.TrendingIntelligence || 
  mongoose.model("TrendingIntelligence", TrendingIntelligenceSchema);
