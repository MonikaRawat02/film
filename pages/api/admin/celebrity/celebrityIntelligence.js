import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import jwt from "jsonwebtoken";

function toMoneyShort(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const v = Number(n);
  if (v >= 1_000_000_000) return `$${Math.round(v / 10_000_000) / 100}B`;
  if (v >= 1_000_000) return `$${Math.round(v / 10_000) / 100}M`;
  if (v >= 1_000) return `$${Math.round(v)}`;
  return `$${v}`;
}

function getDisplayNetWorth(c) {
  const usd = c?.netWorth?.netWorthUSD;
  const inr = c?.netWorth?.netWorthINR;
  if (usd?.display) return usd.display;
  if (inr?.display) return inr.display;
  if (usd?.max != null) return toMoneyShort(usd.max);
  if (usd?.min != null) return toMoneyShort(usd.min);
  if (inr?.max != null) return inr.max?.toString();
  if (inr?.min != null) return inr.min?.toString();
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    await dbConnect();

    const { slug, q, industry, page = 1, limit = 20 } = req.query;
    const lim = Math.min(Number(limit) || 20, 100);
    const pg = Math.max(Number(page) || 1, 1);

    if (slug) {
      const c = await Celebrity.findOne({ "heroSection.slug": slug });
      if (!c) return res.status(404).json({ message: "Not found" });
      return res.status(200).json({
        data: {
          name: c?.heroSection?.name || null,
          netWorth: getDisplayNetWorth(c),
          filmsCount: c?.heroSection?.filmsCount ?? null,
          awardsCount: c?.heroSection?.awardsCount ?? null,
          trendingPercentage: c?.heroSection?.growthPercentage ?? null,
          slug: c?.heroSection?.slug || null,
          profileImage: c?.heroSection?.profileImage || null,
          industry: c?.heroSection?.industry || null,
          profession: Array.isArray(c?.heroSection?.profession) 
            ? c.heroSection.profession.join(", ") 
            : c?.heroSection?.profession || null
        }
      });
    }

    const filter = {};
    if (q) {
      const words = q.trim().split(/\s+/).filter(w => w.length > 0);
      const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      
      // All words present regex
      const allWordsRegex = new RegExp(escapedWords.map(w => `(?=.*${w})`).join(''), 'i');
      
      // Super flex regex (handles "shahru" for "Shah Rukh")
      const rawQueryNoSpace = words.join('');
      const superFlexQuery = rawQueryNoSpace
        .split('')
        .map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*')
        .join('');
      const superFlexRegex = new RegExp(superFlexQuery, 'i');

      filter["$or"] = [
        { "heroSection.name": allWordsRegex },
        { "heroSection.name": superFlexRegex },
        { "heroSection.slug": { $regex: q, $options: "i" } }
      ];
    }
    if (industry) {
      filter["heroSection.industry"] = industry;
    }

    const total = await Celebrity.countDocuments(filter);
    const docs = await Celebrity.find(filter)
      .skip((pg - 1) * lim)
      .limit(lim)
      .sort({ createdAt: -1 });

    const data = docs.map((c) => ({
      name: c?.heroSection?.name || null,
      netWorth: getDisplayNetWorth(c),
      filmsCount: c?.heroSection?.filmsCount ?? null,
      awardsCount: c?.heroSection?.awardsCount ?? null,
      trendingPercentage: c?.heroSection?.growthPercentage ?? null,
      slug: c?.heroSection?.slug || null,
      profileImage: c?.heroSection?.profileImage || null,
      industry: c?.heroSection?.industry || null,
      profession: Array.isArray(c?.heroSection?.profession) 
        ? c.heroSection.profession.join(", ") 
        : c?.heroSection?.profession || null
    }));

    return res.status(200).json({
      data,
      pagination: {
        page: pg,
        limit: lim,
        total,
        pages: Math.ceil(total / lim) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
