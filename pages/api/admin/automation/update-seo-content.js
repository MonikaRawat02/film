import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import Celebrity from "../../../../model/celebrity";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await dbConnect();

    console.log("🚀 Starting Weekly SEO Content Update...");

    // 1. Update Movie Meta Descriptions and Canonical Tags
    const movies = await Article.find({ contentType: "movie" }).limit(100);
    let movieUpdates = 0;

    for (const movie of movies) {
      const metaTitle = `${movie.movieTitle} (${movie.releaseYear}) - Box Office, Cast & Review`;
      const metaDescription = `Explore the full analysis of ${movie.movieTitle}. Includes box office, budget, cast, and more.`;
      const canonical = `/movie/${movie.slug}`;

      if (movie.meta?.title !== metaTitle || movie.meta?.description !== metaDescription) {
        await Article.updateOne(
          { _id: movie._id },
          {
            $set: {
              "meta.title": metaTitle,
              "meta.description": metaDescription,
              "meta.canonical": canonical,
              "meta.lastUpdated": new Date()
            }
          }
        );
        movieUpdates++;
      }
    }

    // 2. Update Celebrity SEO data
    const celebrities = await Celebrity.find().limit(50);
    let celebUpdates = 0;

    for (const celeb of celebrities) {
      const name = celeb.heroSection?.name;
      if (!name) continue;

      const metaTitle = `${name} Net Worth 2026: Career, Assets & Income Analysis`;
      const metaDescription = `Get the latest updates on ${name}'s net worth in 2026. Explore career milestones, luxury assets, and income sources.`;
      
      await Celebrity.updateOne(
        { _id: celeb._id },
        {
          $set: {
            "seo.metaTitle": metaTitle,
            "seo.metaDescription": metaDescription,
            "seo.lastUpdated": new Date()
          }
        }
      );
      celebUpdates++;
    }

    return res.status(200).json({
      success: true,
      message: `Weekly SEO update complete. Updated ${movieUpdates} movies and ${celebUpdates} celebrities.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("SEO Update Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
