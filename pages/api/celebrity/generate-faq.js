// film/pages/api/celebrity/generate-faq.js
import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";
import { generateContent } from "../../../lib/openai-helper";

async function generateCelebrityFAQsWithAI(celebrityData) {
  const {
    name,
    profession,
    nationality,
    industry,
    age,
    birthDate,
    netWorth,
    analysisSummary
  } = celebrityData;

  const prompt = `Generate exactly 5-6 frequently asked questions (FAQs) about the celebrity "${name}".

**Celebrity Details:**
- Name: ${name}
- Profession: ${Array.isArray(profession) ? profession.join(", ") : profession || "N/A"}
- Nationality: ${nationality || "N/A"}
- Industry: ${industry || "N/A"}
- Age: ${age || "N/A"}
- Birth Date: ${birthDate ? new Date(birthDate).toLocaleDateString() : "N/A"}
- Net Worth: ${netWorth?.netWorthUSD?.display || "N/A"}
- Net Worth Analysis: ${analysisSummary || "N/A"}

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "question": "What is [Celebrity Name]'s net worth?",
    "answer": "[Celebrity Name]'s net worth is estimated to be [Net Worth Value]. This comes from various sources including [Primary Income Source] and [Other Income Source]."
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or explanations.`;

  const text = await generateContent(prompt);
  if (!text) throw new Error("AI failed to generate FAQs");

  let jsonText = text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  } else {
    jsonText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  }

  try {
    const parsed = JSON.parse(jsonText);
    
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    const validated = parsed.map(item => ({
      question: String(item.question || ""),
      answer: String(item.answer || "")
    })).filter(item => item.question && item.answer);

    if (validated.length < 5) {
      console.warn(`Only ${validated.length} valid FAQs generated, expected 5-6`);
    }

    return validated.slice(0, 6);
  } catch (parseError) {
    console.error("Celebrity FAQ JSON parsing error:", parseError, "Raw response:", text);
    throw new Error("Failed to parse AI-generated Celebrity FAQs");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ message: "Celebrity slug is required" });
  }

  try {
    await dbConnect();

    const celebrity = await Celebrity.findOne({ slug }).select(
      'heroSection.name heroSection.profession heroSection.nationality heroSection.industry ' +
      'quickFacts.age quickFacts.birthDate ' +
      'netWorth.netWorthUSD.display netWorth.analysisSummary'
    );

    if (!celebrity) {
      return res.status(404).json({ message: "Celebrity not found" });
    }

    let faqs;
    try {
      faqs = await generateCelebrityFAQsWithAI({
        name: celebrity.heroSection?.name,
        profession: celebrity.heroSection?.profession,
        nationality: celebrity.heroSection?.nationality,
        industry: celebrity.heroSection?.industry,
        age: celebrity.quickFacts?.age,
        birthDate: celebrity.quickFacts?.birthDate,
        netWorth: celebrity.netWorth,
        analysisSummary: celebrity.netWorth?.analysisSummary
      });
    } catch (aiError) {
      console.error("AI Celebrity FAQ generation failed, using fallback:", aiError.message);
      faqs = [
        {
          question: `Who is ${celebrity.heroSection?.name}?`,
          answer: `${celebrity.heroSection?.name} is a prominent figure in the ${celebrity.heroSection?.industry || 'entertainment'} industry, known for ${Array.isArray(celebrity.heroSection?.profession) ? celebrity.heroSection.profession.join(", ") : celebrity.heroSection?.profession || 'their work'}.`
        },
        {
          question: `What is ${celebrity.heroSection?.name}'s net worth?`,
          answer: `While exact figures vary, ${celebrity.heroSection?.name}'s net worth is estimated to be around ${celebrity.netWorth?.netWorthUSD?.display || 'a significant amount'}.`
        },
        {
          question: `When was ${celebrity.heroSection?.name} born?`,
          answer: `${celebrity.heroSection?.name} was born on ${celebrity.quickFacts?.birthDate ? new Date(celebrity.quickFacts.birthDate).toLocaleDateString() : 'an unknown date'}.`
        },
        {
          question: `What is ${celebrity.heroSection?.name}'s nationality?`,
          answer: `${celebrity.heroSection?.name} is of ${celebrity.heroSection?.nationality || 'unknown'} nationality.`
        },
        {
          question: `What are some of ${celebrity.heroSection?.name}'s notable professions?`,
          answer: `${celebrity.heroSection?.name} is primarily known for ${Array.isArray(celebrity.heroSection?.profession) ? celebrity.heroSection.profession.join(" and ") : celebrity.heroSection?.profession || 'their professional endeavors'}.`
        }
      ];
    }

    return res.status(200).json({
      success: true,
      data: faqs,
      source: "ai-generated",
      count: faqs.length
    });

  } catch (error) {
    console.error("Celebrity FAQ Generation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
