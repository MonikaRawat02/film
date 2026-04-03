// /api/celebrity/extract-details
// Uses Gemini AI to extract structured celebrity data from Wikipedia biography
import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

async function extractCelebrityDetailsWithAI(celebrity) {
  if (!genAI) throw new Error("Gemini API key not configured");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const name = celebrity.heroSection?.name || "Unknown";
  const biography = celebrity.heroSection?.biography || "";
  const existingIndustry = celebrity.heroSection?.industry || "Bollywood";

  const prompt = `You are an expert data extractor for celebrity information. Analyze the following Wikipedia biography and extract structured data.

**Celebrity Name:** ${name}
**Current Industry:** ${existingIndustry}

**Wikipedia Biography:**
${biography.slice(0, 8000)}

**Your Task:**
Extract the following information accurately from the biography:

1. **Net Worth**: Look for any mention of net worth, wealth, earnings, fortune (in USD or INR)
2. **Age**: Current age or birth date to calculate age
3. **Height**: Physical height in feet/inches or cm
4. **Birth Date**: Exact date of birth
5. **Nationality**: Country of citizenship
6. **Industry**: Based on their work (Bollywood, Hollywood, Web Series, Music, Sports, etc.)
7. **Profession**: All their professions (Actor, Producer, Singer, Director, etc.)
8. **Active Since**: Year they started their career
9. **Spouse**: Marriage information
10. **Children**: Number and names of children
11. **Awards**: Major awards won
12. **Notable Works**: Famous movies/shows

Respond ONLY with a valid JSON object in this exact format:
{
  "netWorth": {
    "minUSD": 5,
    "maxUSD": 11,
    "displayUSD": "$5-11M",
    "minINR": 474,
    "maxINR": 1043,
    "displayINR": "₹474-1043 Cr",
    "source": "Quote from biography mentioning net worth"
  },
  "age": 61,
  "birthDate": "1965-11-02",
  "height": "5'8\" (173 cm)",
  "nationality": "Indian",
  "industry": "Bollywood",
  "profession": ["Actor", "Film Producer", "Television Presenter"],
  "activeSince": 1988,
  "spouse": "Gauri Khan (m. 1991)",
  "children": "3 (Aryan, Suhana, AbRam)",
  "awards": ["Filmfare Awards", "National Film Award", "Padma Shri"],
  "notableWorks": ["Deewana", "Darr", "DDLJ", "Pathaan", "Jawan"]
}

If any field is not found in the biography, set it to null. Be accurate and only extract what's actually mentioned.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON object found in AI response");

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate and clean data
  const cleaned = {
    netWorth: parsed.netWorth || null,
    age: parsed.age || null,
    birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
    height: parsed.height || "N/A",
    nationality: parsed.nationality || "N/A",
    industry: parsed.industry || existingIndustry,
    profession: Array.isArray(parsed.profession) ? parsed.profession : [],
    activeSince: parsed.activeSince || null,
    spouse: parsed.spouse || null,
    children: parsed.children || null,
    awards: Array.isArray(parsed.awards) ? parsed.awards : [],
    notableWorks: Array.isArray(parsed.notableWorks) ? parsed.notableWorks : []
  };

  return cleaned;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug, refresh } = req.body;

  if (!slug) {
    return res.status(400).json({ message: "Celebrity slug is required" });
  }

  try {
    await dbConnect();

    const celebrity = await Celebrity.findOne({
      $or: [
        { "heroSection.slug": new RegExp(`^${slug}$`, "i") },
        { "heroSection.slug": new RegExp(`^${slug.replace(/-/g, " ")}$`, "i") }
      ]
    });

    if (!celebrity) {
      return res.status(404).json({ message: "Celebrity not found" });
    }

    // Check if we already have AI-extracted data
    const existingExtracted = celebrity.aiExtractedData;
    
    if (existingExtracted && existingExtracted.age && refresh !== true) {
      return res.status(200).json({
        success: true,
        source: "cached",
        data: existingExtracted
      });
    }

    // Extract data with AI
    let extractedData;
    try {
      extractedData = await extractCelebrityDetailsWithAI(celebrity);
    } catch (aiError) {
      console.error("AI extraction failed:", aiError.message);
      return res.status(500).json({
        success: false,
        message: `AI extraction failed: ${aiError.message}`
      });
    }

    // Save extracted data back to database
    await Celebrity.updateOne(
      { _id: celebrity._id },
      { 
        $set: { 
          aiExtractedData: extractedData,
          // Update heroSection with extracted data
          "heroSection.nationality": extractedData.nationality !== "N/A" ? extractedData.nationality : celebrity.heroSection.nationality,
          "heroSection.industry": extractedData.industry || celebrity.heroSection.industry,
          "heroSection.profession": extractedData.profession.length > 0 ? extractedData.profession : celebrity.heroSection.profession,
          "heroSection.activeSince": extractedData.activeSince || celebrity.heroSection.activeSince,
          "heroSection.height": extractedData.height !== "N/A" ? extractedData.height : celebrity.heroSection.height,
          // Update quickFacts
          "quickFacts.age": extractedData.age || celebrity.quickFacts.age,
          "quickFacts.birthDate": extractedData.birthDate || celebrity.quickFacts.birthDate,
          "quickFacts.profession": extractedData.profession.length > 0 ? extractedData.profession : celebrity.quickFacts.profession,
          "quickFacts.activeSince": extractedData.activeSince || celebrity.quickFacts.activeSince,
          "quickFacts.spouse": extractedData.spouse || celebrity.quickFacts.spouse,
          "quickFacts.children": extractedData.children || celebrity.quickFacts.children,
          // Update netWorth if found
          ...(extractedData.netWorth && {
            "netWorth.netWorthUSD": {
              min: extractedData.netWorth.minUSD,
              max: extractedData.netWorth.maxUSD,
              display: extractedData.netWorth.displayUSD
            },
            "netWorth.netWorthINR": {
              min: extractedData.netWorth.minINR,
              max: extractedData.netWorth.maxINR,
              display: extractedData.netWorth.displayINR
            },
            "netWorthAnalysis.estimatedRange": {
              min: extractedData.netWorth.minUSD,
              max: extractedData.netWorth.maxUSD
            },
            "netWorthAnalysis.displayRange": extractedData.netWorth.displayUSD
          })
        }
      }
    );

    return res.status(200).json({
      success: true,
      source: "ai-extracted",
      data: extractedData
    });

  } catch (error) {
    console.error("Celebrity Details Extraction Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
