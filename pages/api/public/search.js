import dbConnect from "@/lib/mongodb";
import Article from "@/model/article";
import Celebrity from "@/model/celebrity";
import BoxOffice from "@/model/boxOffice";
import OTTIntelligence from "@/model/ottIntelligence";
import TrendingIntelligence from "@/model/trendingIntelligence";

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

    // Split raw query into words for flexible searching
    const words = trimmedQ.split(/\s+/).filter(w => w.length > 0);
    
    // 1. Regex that matches if all words are present in any order
    // We escape each word to be safe in regex
    const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const allWordsRegex = new RegExp(escapedWords.map(w => `(?=.*${w})`).join(''), 'i');
    
    // 2. Regex that allows optional spaces between EVERY character (super flexible)
    // "Shahrukh" -> "S\s*h\s*a\s*h\s*r\s*u\s*k\s*h"
    const rawQueryNoSpace = words.join('');
    const superFlexQuery = rawQueryNoSpace
      .split('')
      .map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*')
      .join('');
    const superFlexRegex = new RegExp(superFlexQuery, 'i');

    // 3. Simple word-by-word matching (OR instead of AND)
    const simpleOrRegex = new RegExp(escapedWords.join('|'), 'i');

    // 4. Exact word matching (for things like "Avengers")
    const exactRegex = new RegExp(`\\b${escapedWords.join('|')}\\b`, 'i');

    // Search Articles
    const articles = await Article.find({
      $or: [
        { title: allWordsRegex },
        { title: superFlexRegex },
        { summary: simpleOrRegex },
        { movieTitle: allWordsRegex },
        { tags: { $in: words.map(w => new RegExp(w, 'i')) } }
      ]
    })
      .limit(7)
      .select("title slug category movieTitle coverImage summary");

    // Search Celebrities
    const celebrities = await Celebrity.find({
      $or: [
        { "heroSection.name": allWordsRegex },
        { "heroSection.name": superFlexRegex },
        { "heroSection.profession": simpleOrRegex }
      ]
    })
      .limit(5)
      .select("heroSection.name heroSection.slug heroSection.profileImage heroSection.profession");

    // Search Box Office
    const boxOffice = await BoxOffice.find({
      $or: [
        { movieName: allWordsRegex },
        { movieName: superFlexRegex }
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

    // Search Trending Intelligence
    const trending = await TrendingIntelligence.find({
      $or: [
        { title: allWordsRegex },
        { movieName: allWordsRegex }
      ]
    })
      .limit(4)
      .select("title slug category image");

    const results = [
      ...articles.map(a => ({
        id: a._id,
        title: a.title,
        type: "Article",
        category: a.category,
        image: a.coverImage,
        description: a.summary || a.movieTitle,
        href: `/category/${a.category?.toLowerCase() || "bollywood"}/${a.slug}`
      })),
      ...celebrities.map(c => ({
        id: c._id,
        title: c.heroSection.name,
        type: "Celebrity",
        image: c.heroSection.profileImage,
        description: c.heroSection.profession?.join(", "),
        href: `/celebrity/${c.heroSection.slug}/profile`
      })),
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
      })),
      ...trending.map(t => ({
        id: t._id,
        title: t.title,
        type: "Trending",
        category: t.category,
        image: t.image,
        href: `/intelligence/${t.slug}`
      }))
    ];

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
