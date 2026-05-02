import mongoose from "mongoose";

const IndustryInsightSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    readTime: {
      type: String,
      default: "5 min read"
    },
    icon: {
      type: String,
      default: "AlertCircle"
    },
    content: {
      type: [
        {
          heading: String,
          content: String
        }
      ],
      default: []
    },
    faqs: {
      type: [
        {
          question: String,
          answer: String
        }
      ],
      default: []
    },
    relatedTopics: {
      type: [String],
      default: []
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    author: {
      type: String,
      default: "FilmyFire Intelligence"
    }
  },
  { timestamps: true }
);

delete mongoose.models.IndustryInsight;
export default mongoose.models.IndustryInsight || mongoose.model("IndustryInsight", IndustryInsightSchema);
