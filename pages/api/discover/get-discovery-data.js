// import dbConnect from "../../../lib/mongodb";
// import Article from "../../../model/article";
// import { slugify } from "../../../lib/slugify";
// import { cacheManager } from "../../../lib/redis";

// export default async function handler(req, res) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   const { type, value } = req.query;
//   const cacheKey = `discovery:${type}:${value || 'all'}`;

//   try {
//     const discoveryData = await cacheManager(cacheKey, 3600, async () => {
//       await dbConnect();

//       let query = { contentType: "movie", status: "published" };
//       let title = "Movie Intelligence Hub";
//       let description = "Explore deep-dive analysis and box office reports for your favorite movies.";

//       if (type === "genre" && value) {
//         const genre = value.charAt(0).toUpperCase() + value.slice(1);
//         query.genres = { $in: [new RegExp(genre, 'i')] };
//         title = `Best ${genre} Movies - Full Analysis & Reviews`;
//         description = `Discover the top-rated ${genre} movies. Includes plot summaries, ending explained, and box office collection reports.`;
//       } else if (type === "year" && value) {
//         const yearInt = parseInt(value);
//         if (isNaN(yearInt)) {
//           throw new Error(`Invalid year value: ${value}`);
//         }
//         query.releaseYear = yearInt;
//         title = `Top Movies of ${value} - Intelligence Reports`;
//         description = `A complete guide to all major movie releases in ${value}. Explore budgets, verdicts, and critical analysis.`;
//       } else if (type === "similar" && value) {
//         const sourceMovie = await Article.findOne({ slug: value });
//         if (sourceMovie) {
//           query.genres = { $in: sourceMovie.genres };
//           query.slug = { $ne: value };
//           title = `Movies Like ${sourceMovie.movieTitle} - Recommendation Engine`;
//           description = `Loved ${sourceMovie.movieTitle}? Check out these similar movies with deep analysis and character breakdowns.`;
//         }
//       }

//       console.log("Discovery Query:", JSON.stringify(query));
      
//       const movies = await Article.find(query)
//         .sort({ releaseYear: -1, "stats.views": -1 })
//         .limit(20)
//         .select("movieTitle slug releaseYear summary coverImage category stats");

//       console.log(`Found ${movies.length} movies for ${type}:${value}`);

//       return {
//         meta: { title, description },
//         movies
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       meta: discoveryData.meta,
//       data: discoveryData.movies
//     });

//   } catch (error) {
//     console.error("Discovery Engine Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// }
import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { slugify } from "../../../lib/slugify";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { type, value } = req.query;
  const cacheKey = `discovery:${type}:${value || 'all'}`;

  try {
    const discoveryData = await cacheManager(cacheKey, 3600, async () => {
      await dbConnect();

      let query = { contentType: "movie", status: "published" };
      let title = "Movie Intelligence Hub";
      let description = "Explore deep-dive analysis and box office reports for your favorite movies.";

      if (type === "genre" && value) {
        const genre = value.charAt(0).toUpperCase() + value.slice(1);
        query.genres = { $in: [new RegExp(genre, 'i')] };
        title = `Best ${genre} Movies - Full Analysis & Reviews`;
        description = `Discover the top-rated ${genre} movies. Includes plot summaries, ending explained, and box office collection reports.`;
      } else if (type === "year" && value) {
        const yearInt = parseInt(value);
        if (isNaN(yearInt)) {
          throw new Error(`Invalid year value: ${value}`);
        }
        query.releaseYear = yearInt;
        title = `Top Movies of ${value} - Intelligence Reports`;
        description = `A complete guide to all major movie releases in ${value}. Explore budgets, verdicts, and critical analysis.`;
      } else if (type === "similar" && value) {
        const sourceMovie = await Article.findOne({ slug: value });
        if (sourceMovie) {
          query.genres = { $in: sourceMovie.genres };
          query.slug = { $ne: value };
          title = `Movies Like ${sourceMovie.movieTitle} - Recommendation Engine`;
          description = `Loved ${sourceMovie.movieTitle}? Check out these similar movies with deep analysis and character breakdowns.`;
        }
      }

      console.log("Discovery Query:", JSON.stringify(query));
      
      const movies = await Article.find(query)
        .sort({ releaseYear: -1, "stats.views": -1 })
        .limit(20)
        .select("movieTitle slug releaseYear summary coverImage category stats");

      // Filter out movies without valid slugs
      const validMovies = movies.filter(movie => movie.slug && movie.movieTitle);

      console.log(`Found ${validMovies.length} valid movies for ${type}:${value}`);

      return {
        meta: { title, description },
        movies: validMovies
      };
    });

    return res.status(200).json({
      success: true,
      meta: discoveryData.meta,
      data: discoveryData.movies
    });

  } catch (error) {
    console.error("Discovery Engine Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}