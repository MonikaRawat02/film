import dbConnect from "../../../lib/mongodb";
import { TrendingTopic, TrendingMovie, TrendingActor } from "../../../model/trending";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { type = 'all', limit = 10 } = req.query;

    let data = {};

    if (type === 'all' || type === 'topics') {
      data.topics = await TrendingTopic.find()
        .sort({ score: -1, createdAt: -1 })
        .limit(parseInt(limit));
    }

    if (type === 'all' || type === 'movies') {
      data.movies = await TrendingMovie.find()
        .sort({ trendingScore: -1, createdAt: -1 })
        .limit(parseInt(limit));
    }

    if (type === 'all' || type === 'actors') {
      data.actors = await TrendingActor.find()
        .sort({ trendingScore: -1, createdAt: -1 })
        .limit(parseInt(limit));
    }

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error("API Trending Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
