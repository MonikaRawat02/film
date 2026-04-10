import dbConnect from "@/lib/mongodb";
import Article from "@/model/article";
import Celebrity from "@/model/celebrity";
import BoxOffice from "@/model/boxOffice";
import OTTIntelligence from "@/model/ottIntelligence";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { q } = req.query;
  const trimmedQ = q?.trim();

  if (!trimmedQ || trimmedQ.length < 2) {
    return res.status(200).json({ success: true, data: [] });
  }

  try {
    await dbConnect();

    // Nickname mappings for smarter search
    const nicknames = {
      'srk': 'Shah Rukh Khan',
      'sk': 'Salman Khan',
      'ak': 'Akshay Kumar',
      'rk': 'Ranbir Kapoor',
      'dp': 'Deepika Padukone',
      'pc': 'Priyanka Chopra',
    };

    // Pre-process query for nicknames
    let expandedQ = trimmedQ;
    const words = trimmedQ.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (nicknames[word]) {
        expandedQ = expandedQ.replace(new RegExp(`\\b${word}\\b`, 'gi'), nicknames[word]);
      }
    });

    // Final words for regex building
    const searchWords = expandedQ.split(/\s+/).filter(w => w.length > 0);
    const escapedWords = searchWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // 1. AND Regex: All words must be present
    const allWordsRegex = new RegExp(escapedWords.map(w => `(?=.*${w})`).join(''), 'i');
    
    // 2. Simple OR Regex for broad fallback
    const simpleOrRegex = new RegExp(escapedWords.join('|'), 'i');

    // Search Celebrities first (highest priority)
    const celebrities = await Celebrity.find({
      $or: [
        { "heroSection.name": allWordsRegex },
        { "heroSection.name": simpleOrRegex }
      ]
    })
      .limit(5)
      .select("heroSection.name heroSection.slug heroSection.profileImage heroSection.profession");

    // Search Articles
    const articles = await Article.find({
      $or: [
        { title: allWordsRegex },
        { movieTitle: allWordsRegex },
        { tags: { $in: searchWords.map(w => new RegExp(w, 'i')) } }
      ]
    })
      .limit(7)
      .select("title slug category movieTitle coverImage summary ott");

    // Search Box Office
    const boxOffice = await BoxOffice.find({
      $or: [
        { movieName: allWordsRegex }
      ]
    })
      .limit(4)
      .select("movieName verdict collection");

    // Search OTT Intelligence
    const ott = await OTTIntelligence.find({
      platformName: simpleOrRegex
    })
      .limit(3)
      .select("platformName marketShare statusLabel");

    const results = [
      ...celebrities.map(c => ({
        id: c._id,
        title: c.heroSection.name,
        type: "Celebrity",
        image: c.heroSection.profileImage,
        description: c.heroSection.profession?.join(", "),
        href: `/celebrity/${c.heroSection.slug}/profile`
      })),
      ...articles.map(a => {
        let href = `/category/${a.category?.toLowerCase() || "bollywood"}/${a.slug}`;
        
        // Custom redirection logic based on requirements
        if (a.category === "Bollywood" || a.category === "Hollywood") {
          href = `/movie/${a.slug}`;
        } else if (a.category === "OTT" || a.category === "WebSeries") {
          const platform = a.ott?.platform?.toLowerCase()?.replace(/\s+/g, "-") || "netflix";
          href = `/ott/${platform}/${a.slug}`;
        }

        return {
          id: a._id,
          title: a.title,
          type: "Article",
          category: a.category,
          image: a.coverImage,
          description: a.summary || a.movieTitle,
          href
        };
      }),
      ...boxOffice.map(b => ({
        id: b._id,
        title: b.movieName,
        type: "Box Office",
        description: `${b.verdict} - ${b.collection}`,
        href: `/box-office?search=${encodeURIComponent(b.movieName)}`
      })),
      ...ott.map(o => ({
        id: o._id,
        title: o.platformName,
        type: "OTT",
        description: `Market Share: ${o.marketShare}% - ${o.statusLabel}`,
        href: `/ott-insights`
      }))
    ];

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
