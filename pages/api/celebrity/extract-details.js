// /api/celebrity/extract-details
// Uses Gemini AI to extract structured celebrity data from Wikipedia biography
import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";
import { generateContent } from "../../../lib/openai-helper";

async function extractCelebrityDetailsWithAI(celebrity) {
  const name = celebrity.heroSection?.name || "Unknown";
  const existingIndustry = celebrity.heroSection?.industry || "Bollywood";

  const prompt = `Provide detailed and accurate information about the celebrity "${name}" (${existingIndustry} industry) based on your extensive knowledge base. Do not rely solely on their Wikipedia biography; provide the most accurate, up-to-date, and commonly accepted public data.

Please provide the following specific information:
1. **Net Worth**: Estimated net worth in USD and INR for 2026.
2. **Primary Income**: Their main source of income (e.g., Acting, Brand Endorsements, Production).
3. **Age**: Current age.
4. **Height**: Physical height in feet/inches and cm.
5. **Industry**: The primary entertainment industry they work in (e.g., Bollywood, Hollywood).
6. **Nationality**: Country of citizenship.
7. **Birth Date**: Exact date of birth (YYYY-MM-DD).
8. **Profession**: List of their professions.
9. **FAQs**: Provide 3-5 Frequently Asked Questions with detailed answers about their life, career, or wealth.

Respond ONLY with a valid JSON object in this exact format (replace values with real data):
{
  "netWorth": {
    "minUSD": 10,
    "maxUSD": 20,
    "displayUSD": "$10-20M",
    "minINR": 800,
    "maxINR": 1600,
    "displayINR": "₹800-1600 Cr",
    "source": "String explaining the source"
  },
  "primaryIncome": "String",
  "age": 45,
  "birthDate": "YYYY-MM-DD",
  "height": "String",
  "nationality": "String",
  "industry": "String",
  "profession": ["String"],
  "faqs": [
    {
      "question": "String",
      "answer": "String"
    }
  ]
}

If any field is not found, set it to null. Return ONLY the JSON object.`;

  const text = await generateContent(prompt);
  if (!text) throw new Error("OpenAI failed to extract details");

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("AI Response was:", text);
    throw new Error("No JSON object found in AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate and clean data
  const cleaned = {
    netWorth: parsed.netWorth || null,
    primaryIncome: parsed.primaryIncome || null,
    age: parsed.age || null,
    birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
    height: parsed.height || "N/A",
    nationality: parsed.nationality || "N/A",
    industry: parsed.industry || existingIndustry,
    profession: Array.isArray(parsed.profession) ? parsed.profession : [],
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
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
          "quickFacts.primaryIncome": extractedData.primaryIncome || celebrity.quickFacts.primaryIncome,
          // Update FAQs if generated
          ...(extractedData.faqs.length > 0 && {
            faqs: extractedData.faqs
          }),
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
