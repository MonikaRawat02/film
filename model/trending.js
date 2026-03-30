import mongoose from "mongoose";

const TrendingTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['movie', 'actor', 'topic'], default: 'topic' },
  score: { type: Number, default: 0 },
  source: { type: String, default: 'google' }, // google, youtube
  region: { type: String, default: 'IN' },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-clean after 24h
});

const TrendingMovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true },
  title: String,
  poster: String,
  backdrop: String,
  releaseDate: String,
  rating: Number,
  trendingScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 172800 } // Keep for 48h
});

const TrendingActorSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true },
  name: String,
  image: String,
  profession: [String],
  trendingScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 172800 } // Keep for 48h
});

export const TrendingTopic = mongoose.models.TrendingTopic || mongoose.model("TrendingTopic", TrendingTopicSchema);
export const TrendingMovie = mongoose.models.TrendingMovie || mongoose.model("TrendingMovie", TrendingMovieSchema);
export const TrendingActor = mongoose.models.TrendingActor || mongoose.model("TrendingActor", TrendingActorSchema);
