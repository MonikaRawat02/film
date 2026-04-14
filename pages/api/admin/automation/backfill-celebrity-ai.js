import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import { generateContent } from "../../../../lib/openai-helper";

async function extractCelebrityDetailsWithAI(celebrity) {
  const name = celebrity.heroSection?.name || "Unknown";
  const existingIndustry = celebrity.heroSection?.industry || "Bollywood";

  const prompt = `Provide the most accurate and up-to-date (2025/2026) financial and career intelligence for the celebrity "${name}" (${existingIndustry} industry). 
  
CRITICAL: For high-profile stars like Shah Rukh Khan, use the absolute LATEST and most commonly cited public estimates. SRK's net worth is widely cited as around $770M to $800M+ (approx ₹6000-7000 Cr+). DO NOT provide outdated or conservative estimates below $750M for SRK.

Please provide the following specific information:
1. **Net Worth**: Estimated net worth in USD and INR for 2026.
2. **Primary Income**: Their main source of income (e.g., Film Remuneration, Brand Endorsements, Business Ventures like Red Chillies Entertainment).
3. **Age**: Current age.
4. **Height**: Physical height in feet/inches and cm.
5. **Industry**: The primary entertainment industry they work in (e.g., Bollywood, Hollywood).
6. **Nationality**: Country of citizenship.
7. **Birth Date**: Exact date of birth (YYYY-MM-DD).
8. **Profession**: List of their professions (e.g., Actor, Producer, Entrepreneur).
9. **FAQs**: Provide 3-5 HIGH-QUALITY, detailed Frequently Asked Questions with substantial answers about their wealth, career, and global impact.

Respond ONLY with a valid JSON object in this exact format (replace values with real data):
{
  "netWorth": {
    "minUSD": 770,
    "maxUSD": 800,
    "displayUSD": "$770-800M",
    "minINR": 6400,
    "maxINR": 6700,
    "displayINR": "₹6400-6700 Cr",
    "source": "Estimated from latest financial reports and industry benchmarks"
  },
  "primaryIncome": "Film Remuneration and Red Chillies Entertainment",
  "age": 58,
  "birthDate": "1965-11-02",
  "height": "5'8\" (173 cm)",
  "nationality": "Indian",
  "industry": "Bollywood",
  "profession": ["Actor", "Film Producer", "Entrepreneur"],
  "faqs": [
    {
      "question": "What is the secret behind ${name}'s massive net worth?",
      "answer": "Detailed answer explaining their diversified income from films, brand deals, and business ventures like production houses and sports franchises..."
    }
  ]
}

If any field is not found, set it to null. Return ONLY the JSON object.`;

  const text = await generateContent(prompt);
  if (!text) throw new Error("OpenAI failed to extract details");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    netWorth: parsed.netWorth || null,
    primaryIncome: parsed.primaryIncome || null,
    age: parsed.age || null,
    birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
    height: parsed.height || "N/A",
    nationality: parsed.nationality || "N/A",
    industry: parsed.industry || existingIndustry,
    profession: Array.isArray(parsed.profession) ? parsed.profession : [],
    faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { limit = 10, skip = 0, slug } = req.query;

  try {
    await dbConnect();

    let query = {};
    if (slug) {
      query = { "heroSection.slug": slug };
    }

    // Fetch celebrities that need updating or we can just iterate through them
    const celebrities = await Celebrity.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    if (!celebrities || celebrities.length === 0) {
      return res.status(404).json({ message: "No celebrities found" });
    }

    const results = {
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
      updates: []
    };

    for (const celebrity of celebrities) {
      results.totalProcessed++;
      try {
        const extractedData = await extractCelebrityDetailsWithAI(celebrity);

        await Celebrity.updateOne(
          { _id: celebrity._id },
          { 
            $set: { 
              "heroSection.nationality": extractedData.nationality !== "N/A" ? extractedData.nationality : celebrity.heroSection?.nationality,
              "heroSection.industry": extractedData.industry || celebrity.heroSection?.industry,
              "heroSection.profession": extractedData.profession.length > 0 ? extractedData.profession : celebrity.heroSection?.profession,
              "heroSection.height": extractedData.height !== "N/A" ? extractedData.height : celebrity.heroSection?.height,
              
              "quickFacts.age": extractedData.age || celebrity.quickFacts?.age,
              "quickFacts.birthDate": extractedData.birthDate || celebrity.quickFacts?.birthDate,
              "quickFacts.profession": extractedData.profession.length > 0 ? extractedData.profession : celebrity.quickFacts?.profession,
              "quickFacts.primaryIncome": extractedData.primaryIncome || celebrity.quickFacts?.primaryIncome,
              
              ...(extractedData.faqs.length > 0 && {
                faqs: extractedData.faqs
              }),
              
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

        results.successCount++;
        results.updates.push(celebrity.heroSection?.name);
      } catch (error) {
        console.error(`Failed to update ${celebrity.heroSection?.name}:`, error.message);
        results.failedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${results.totalProcessed} celebrities`,
      data: results
    });

  } catch (error) {
    console.error("Backfill error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
