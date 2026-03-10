import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import jwt from "jsonwebtoken";

function clampPercent(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function parseMoneyRange(text) {
  if (!text) return null;
  const m = text.match(/(\$?\d+(?:\.\d+)?\s*M)\s*[–-]\s*(\$?\d+(?:\.\d+)?\s*M)/i);
  if (m) return `${m[1]}–${m[2]} per title`;
  const single = text.match(/\$?\d+(?:\.\d+)?\s*M/i);
  return single ? single[0] : null;
}

function extractLabel(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("most active")) return "Most Active";
  if (lower.includes("growing")) return "Growing";
  if (lower.includes("regional")) return "Regional Focus";
  return null;
}

function extractPercent(text) {
  if (!text) return null;
  const m = text.match(/(\d{1,3})\s*%/);
  return m ? clampPercent(m[1]) : null;
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

    const { slug } = req.query;
    const c = slug
      ? await Celebrity.findOne({ "heroSection.slug": slug })
      : await Celebrity.findOne().sort({ createdAt: -1 });

    if (!c) {
      return res.status(404).json({ message: "Celebrity not found" });
    }

    const stats = c?.premiumIntelligence?.stats || {};
    const baseActivity = clampPercent((stats.monthlyReaders ?? 0) % 100 + (stats.accuracyRate ?? 0));

    const platforms = [];

    // Derive platforms from relatedIntelligence entries if present
    const rel = Array.isArray(c.relatedIntelligence) ? c.relatedIntelligence : [];
    rel.forEach((ri) => {
      const title = ri?.title || "";
      const category = (ri?.category || "").toLowerCase();
      const desc = ri?.description || "";
      const isOtt =
        category.includes("ott") ||
        category.includes("stream") ||
        /netflix|amazon|prime|hotstar|disney/i.test(title);
      if (!isOtt) return;
      platforms.push({
        name: title,
        avgDealDisplay: parseMoneyRange(desc),
        activityLabel: extractLabel(desc),
        activityPercent: extractPercent(desc) ?? baseActivity,
        detailsLink: "#",
      });
    });

    // If none found, fall back to minimal dynamic summary using stats only
    const data = {
      title: "OTT Intelligence",
      subtitle: "Streaming deals & trends",
      platforms,
      statsSummary: {
        celebrityProfiles: stats.celebrityProfiles ?? null,
        monthlyReaders: stats.monthlyReaders ?? null,
        accuracyRate: stats.accuracyRate ?? null,
      },
    };

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
