// /api/celebrity/wealth-breakdown
// Dynamically generates real wealth breakdown using celebrity biography + Gemini AI
import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const STATIC_DEFAULTS = ["Acting", "Endorsements", "Business Ventures"];

function isStaticDefault(incomeSources = []) {
  if (!incomeSources || incomeSources.length === 0) return true;
  const names = incomeSources.map((s) => s.sourceName);
  return (
    names.length === 3 &&
    STATIC_DEFAULTS.every((d) => names.includes(d)) &&
    incomeSources[0]?.percentage === 65 &&
    incomeSources[1]?.percentage === 25 &&
    incomeSources[2]?.percentage === 10
  );
}

async function generateWealthBreakdownWithAI(celebrity) {
  if (!genAI) throw new Error("Gemini API key not configured");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const name = celebrity.heroSection?.name || "Unknown";
  const industry = celebrity.heroSection?.industry || "Bollywood";
  const profession = (celebrity.heroSection?.profession || []).join(", ");
  const biography = celebrity.heroSection?.biography || celebrity.netWorth?.analysisSummary || "";
  const netWorthDisplay =
    celebrity.netWorth?.netWorthUSD?.display ||
    celebrity.netWorthAnalysis?.displayRange ||
    "Unknown";
  const activeSince = celebrity.quickFacts?.activeSince || "Unknown";

  const prompt = `You are a celebrity wealth analyst. Based on the following real information about ${name}, generate a realistic and accurate income source breakdown.

**Celebrity Profile:**
- Name: ${name}
- Industry: ${industry}
- Profession: ${profession || "Actor"}
- Net Worth: ${netWorthDisplay}
- Active Since: ${activeSince}
- Biography: ${biography.slice(0, 1500)}

**Your Task:**
Analyze the biography and career to determine their REAL income sources and percentages. Consider:
- Primary career (acting, directing, producing, singing, etc.)
- Brand endorsements if mentioned
- Business ventures, production companies
- Investments, real estate, other income

Generate 3-5 income sources that are SPECIFIC to this celebrity's actual career.
Total percentages MUST add up to exactly 100.

Respond ONLY with a valid JSON array like this:
[
  {
    "sourceName": "Film Acting",
    "percentage": 55,
    "description": "Primary income from lead roles in Bollywood films spanning 3 decades."
  },
  {
    "sourceName": "Music & Playback Singing",
    "percentage": 30,
    "description": "Significant earnings from legendary singing career with 185+ recorded songs."
  },
  {
    "sourceName": "Endorsements",
    "percentage": 10,
    "description": "Brand partnerships and commercial appearances."
  },
  {
    "sourceName": "Royalties",
    "percentage": 5,
    "description": "Ongoing royalties from music catalog and film reruns."
  }
]

IMPORTANT: Make it realistic and specific to ${name}'s actual career. Do NOT use generic 65/25/10 split.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array found in AI response");

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate total is 100
  const total = parsed.reduce((sum, s) => sum + (s.percentage || 0), 0);
  if (Math.abs(total - 100) > 5) {
    // Normalize percentages to sum to 100
    const factor = 100 / total;
    let runningTotal = 0;
    parsed.forEach((s, i) => {
      if (i === parsed.length - 1) {
        s.percentage = Math.round(100 - runningTotal);
      } else {
        s.percentage = Math.round(s.percentage * factor);
        runningTotal += s.percentage;
      }
    });
  }

  return parsed;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug, refresh } = req.query;

  if (!slug) {
    return res.status(400).json({ message: "Slug is required" });
  }

  try {
    await dbConnect();

    const celebrity = await Celebrity.findOne({
      $or: [
        { "heroSection.slug": new RegExp(`^${slug}$`, "i") },
        { "heroSection.slug": new RegExp(`^${slug.replace(/-/g, " ")}$`, "i") },
      ],
    });

    if (!celebrity) {
      return res.status(404).json({ message: "Celebrity not found" });
    }

    const existingSources = celebrity.netWorthCalculation?.incomeSources || [];

    // Use cached data if it's real (not static defaults) and refresh not requested
    if (!isStaticDefault(existingSources) && refresh !== "true") {
      return res.status(200).json({
        success: true,
        source: "database",
        data: {
          incomeSources: existingSources,
          totalNetWorth: celebrity.netWorth?.netWorthUSD?.max || celebrity.netWorth?.netWorthUSD?.min || 0,
          netWorthDisplay: celebrity.netWorth?.netWorthUSD?.display || "N/A",
          name: celebrity.heroSection?.name,
        },
      });
    }

    // Generate real breakdown with AI
    let incomeSources;
    try {
      incomeSources = await generateWealthBreakdownWithAI(celebrity);
    } catch (aiError) {
      console.error("AI generation failed:", aiError.message);
      // Return existing data if AI fails
      return res.status(200).json({
        success: true,
        source: "fallback",
        data: {
          incomeSources: existingSources,
          totalNetWorth: celebrity.netWorth?.netWorthUSD?.max || 0,
          netWorthDisplay: celebrity.netWorth?.netWorthUSD?.display || "N/A",
          name: celebrity.heroSection?.name,
        },
      });
    }

    // Save real data back to DB so future requests are fast
    await Celebrity.updateOne(
      { _id: celebrity._id },
      { $set: { "netWorthCalculation.incomeSources": incomeSources } }
    );

    return res.status(200).json({
      success: true,
      source: "ai-generated",
      data: {
        incomeSources,
        totalNetWorth: celebrity.netWorth?.netWorthUSD?.max || celebrity.netWorth?.netWorthUSD?.min || 0,
        netWorthDisplay: celebrity.netWorth?.netWorthUSD?.display || "N/A",
        name: celebrity.heroSection?.name,
      },
    });
  } catch (error) {
    console.error("Wealth breakdown API error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
