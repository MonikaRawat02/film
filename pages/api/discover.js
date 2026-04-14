import dbConnect from "../../lib/mongodb";
import Article from "../../model/article";

/**
 * Discovery API: Find movies based on genres, keywords, or similarity
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { type, value, limit = 20 } = req.query;

  try {
    await dbConnect();

    let query = { contentType: "movie", status: "published" };
    let pageTitle = "Discover Movies";

    switch (type) {
      case "genre":
        query.genres = { $regex: new RegExp(value, "i") };
        pageTitle = `Best ${value.charAt(0).toUpperCase() + value.slice(1)} Movies`;
        break;
      case "year":
        query.releaseYear = parseInt(value);
        pageTitle = `Top Movies of ${value}`;
        break;
      case "similar-to":
        // Find the source movie to get its genres
        const sourceMovie = await Article.findOne({ slug: value });
        if (sourceMovie) {
          query.genres = { $in: sourceMovie.genres };
          query.slug = { $ne: value }; // Exclude the source movie itself
          pageTitle = `Movies Like ${sourceMovie.movieTitle}`;
        } else {
          return res.status(404).json({ message: "Source movie for similarity not found" });
        }
        break;
      default:
        // No specific type, return latest published movies
        pageTitle = "Latest Published Movies";
        break;
    }

    const movies = await Article.find(query)
      .sort({ "stats.rating": -1, publishedAt: -1 })
      .limit(parseInt(limit))
      .select("movieTitle releaseYear slug coverImage summary genres stats.rating");

    return res.status(200).json({
      success: true,
      data: {
        pageTitle,
        movies,
      },
    });

  } catch (error) {
    console.error("Discovery API error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
