import mongoose from "mongoose";

const trendingSchema = new mongoose.Schema({
  // Original trend data
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Mapping & Classification (User's requirement #5)
  type: {
    type: String,
    enum: ["trending_movies", "trending_actors", "viral_topics"],
    required: true
  },

  // Entity details (User's requirement #7)
  entityId: {
    type: String, // Can be TMDB ID, Celebrity ID, or null for topics
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "referenceModel"
  },

  referenceModel: {
    type: String,
    enum: ["Article", "Celebrity"],
    required: false
  },

  slug: String,

  // Metadata (User's requirement #1 & #7)
  source: {
    type: String,
    enum: ["google", "youtube", "manual"],
    required: true
  },

  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Ranking metrics (User's requirement #6)
  traffic: {
    type: Number,
    default: 0
  },

  viewCount: {
    type: Number,
    default: 0
  },

  // Keywords and classification (User's requirement #2 & #3)
  keywords: [{
    type: String
  }],

  entityType: {
    type: String,
    enum: ["movie", "actor", "topic"],
    required: true
  },

  classificationConfidence: {
    type: Number,
    default: 0.5
  },

  // Status
  status: {
    type: String,
    enum: ["active", "expired", "rejected"],
    default: "active"
  },

  // Additional metadata for display (User's requirement #1 & #7)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Timestamps (User's requirement #7)
  trendTimestamp: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying (User's requirement #8)
trendingSchema.index({ type: 1, status: 1, score: -1 });
trendingSchema.index({ entityType: 1, status: 1 });
trendingSchema.index({ source: 1, trendTimestamp: -1 });
trendingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to get trending items by type
trendingSchema.statics.getTrendingByType = async function (type, limit = 10) {
  return await this.find({
    type,
    status: "active",
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } }
    ]
  })
    .sort({ score: -1, trendTimestamp: -1 })
    .limit(limit)
    .populate("referenceId");
};

// Static method to get all trending items (User's requirement #8)
trendingSchema.statics.getAllTrending = async function (limit = 10) {
  const movies = await this.getTrendingByType("trending_movies", limit);
  const actors = await this.getTrendingByType("trending_actors", limit);
  const topics = await this.getTrendingByType("viral_topics", limit);

  return {
    trending_movies: movies,
    trending_actors: actors,
    viral_topics: topics
  };
};

const Trending = mongoose.models.Trending || mongoose.model("Trending", trendingSchema);

export default Trending;
