import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // 1. Bollywood Movie Explanations (Articles in Bollywood category)
    const bollywoodCount = await Article.countDocuments({ category: "Bollywood", status: "published" });

    // 2. Bollywood Box Office Reports
    // We'll count articles in BoxOffice category that mention Bollywood or are likely Bollywood
    // For now, let's count all BoxOffice articles as they are usually grouped together
    const boxOfficeCount = await Article.countDocuments({ category: "BoxOffice", status: "published" });

    // 3. Bollywood Celebrity Intelligence
    const bollywoodCelebCount = await Celebrity.countDocuments({ "heroSection.industry": "Bollywood" });

    // 4. Bollywood OTT Analysis
    const ottCount = await Article.countDocuments({ category: "OTT", status: "published" });

    return res.status(200).json({
      success: true,
      data: [
        {
          title: "Bollywood Movie Explanations",
          count: `${bollywoodCount}+ Articles`,
          realCount: bollywoodCount,
          href: "/category/bollywood",
          icon: "Film"
        },
        {
          title: "Bollywood Box Office Reports",
          count: `${boxOfficeCount}+ Articles`,
          realCount: boxOfficeCount,
          href: "/category/box-office",
          icon: "Trophy"
        },
        {
          title: "Bollywood Celebrity Intelligence",
          count: `${bollywoodCelebCount}+ Profiles`,
          realCount: bollywoodCelebCount,
          href: "/celebrities",
          icon: "Users"
        },
        {
          title: "Bollywood OTT Analysis",
          count: `${ottCount}+ Articles`,
          realCount: ottCount,
          href: "/category/ott",
          icon: "Calendar"
        }
      ]
    });
  } catch (error) {
    console.error("Error fetching bollywood explore stats:", error);
    return res.status(500).json({ message: error.message });
  }
}
