import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import jwt from "jsonwebtoken";

function toMoney(v, currency = "USD") {
  if (v == null || Number.isNaN(Number(v))) return "N/A";
  const n = Number(v);
  if (n >= 1_000_000_000) return `$${Math.round(n / 1_000_000_0) / 100}B`;
  if (n >= 1_000_000) return `$${Math.round(n / 10_000) / 100}M`;
  if (n >= 1_000) return `$${Math.round(n)}`;
  return `$${n}`;
}

function verdictFromROI(roi) {
  if (roi == null || Number.isNaN(Number(roi))) return "UNKNOWN";
  const r = Number(roi);
  if (r >= 400) return "BLOCKBUSTER";
  if (r >= 200) return "SUPER HIT";
  if (r >= 100) return "HIT";
  if (r <= 0) return "FLOP";
  return "AVERAGE";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (payload.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    await dbConnect();

    const { slug, q, page = 1, limit = 20 } = req.query;
    const lim = Math.min(Number(limit) || 20, 100);
    const pg = Math.max(Number(page) || 1, 1);

    let docs = [];
    if (slug) {
      const one = await Celebrity.findOne({ "heroSection.slug": slug });
      if (one) docs = [one];
    } else {
      const filter = q ? { "heroSection.name": { $regex: q, $options: "i" } } : {};
      docs = await Celebrity.find(filter).skip((pg - 1) * lim).limit(lim).sort({ createdAt: -1 });
    }

    const items = docs.map((c) => {
      const usd = c?.netWorth?.netWorthUSD || {};
      const budget = usd.min;
      const collection = usd.max;
      let roi;
      if (c?.heroSection?.growthPercentage != null) {
        roi = Number(c.heroSection.growthPercentage);
      } else if (budget != null && collection != null && Number(budget) !== 0) {
        roi = ((Number(collection) - Number(budget)) / Number(budget)) * 100;
      } else {
        roi = null;
      }
      return {
        title: c?.heroSection?.name || "Unknown",
        verdict: verdictFromROI(roi),
        budgetDisplay: toMoney(budget),
        collectionDisplay: toMoney(collection),
        roiDisplay: roi == null || Number.isNaN(roi) ? "N/A" : `${Math.round(roi)}%`,
        analysisLink: "#",
        slug: c?.heroSection?.slug || null,
      };
    });

    return res.status(200).json({
      data: {
        title: "Box Office Truth",
        subtitle: "Real numbers, real verdicts",
        items,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
