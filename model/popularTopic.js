import mongoose from "mongoose";

const PopularTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: String,
      default: "0",
    },
    readTime: {
      type: String,
      default: "5 min",
    },
    trending: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

export default mongoose.models.PopularTopic || 
  mongoose.model("PopularTopic", PopularTopicSchema);
