import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Bollywood", "Hollywood", "WebSeries", "OTT", "BoxOffice", "Celebrities"],
    },
    contentType: {
      type: String,
      enum: ["movie", "webseries"],
    },
    movieTitle: String,
    releaseYear: Number,
    author: {
      name: String,
      role: String,
    },
    summary: String,
    coverImage: String,
    sections: [
      {
        heading: String,
        content: String,
      },
    ],
    highlights: [String],
    verdict: String,
    tags: [String],
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Article || mongoose.model("Article", ArticleSchema);
