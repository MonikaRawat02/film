// film/pages/api/admin/automation/backfill-celebrities.js
import dbConnect from "../../../../lib/mongodb";
import Celebrity from "../../../../model/celebrity";
import { generateContent } from "../../../../lib/openai-helper"; // Assuming this is used for AI data generation

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const celebrities = await Celebrity.find({});
    const updatedCelebrities = [];
    const totalCelebrities = celebrities.length;
    let processedCount = 0;

    console.log(`[Backfill] Starting backfill process for ${totalCelebrities} celebrities...`);

    for (const celeb of celebrities) {
      processedCount++;
      console.log(`[Backfill] Processing ${processedCount}/${totalCelebrities}: ${celeb.heroSection?.name}...`);
      // Here, you would integrate your logic to fetch or generate the data
      // for Networth, Primary Income, Age, Height, Industry, Nationality, Birthdate, Profession.
      // For demonstration, I'll use placeholder logic.
      // You might use an external API, a scraping tool, or an AI model (like generateContent)
      // to get this data.

      // Example: Using generateContent for some fields (assuming it can generate structured data)
      // This part needs to be adapted based on how you actually backfill the data.
      // For a real implementation, you'd likely have a more sophisticated data source.

      const prompt = `Generate updated data for celebrity ${celeb.heroSection.name}.
Return ONLY a valid JSON object with the following structure:
{
  "netWorth": {
    "netWorthUSD": {
      "min": 4500000,
      "max": 5000000,
      "display": "$5 Million"
    },
    "netWorthINR": {
      "min": 370000000,
      "max": 415000000,
      "display": "₹41.5 Crores"
    }
  },
  "primaryIncome": "Acting",
  "age": 45, // MUST be a number. If deceased, calculate age at death or set to null
  "height": "5'10\\"",
  "industry": "Hollywood",
  "nationality": "American",
  "birthdate": "1980-01-01",
  "profession": ["Actor", "Producer"]
}
If any data is unknown, use null.`;

      let aiDataText = await generateContent(prompt);
      
      // Parse aiData and update celeb object
      let parsedAiData = {};
      try {
        // Strip markdown formatting if AI returned it
        aiDataText = aiDataText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        parsedAiData = JSON.parse(aiDataText);
      } catch (e) {
        console.error(`[Backfill] Failed to parse AI data for celebrity: ${celeb.heroSection.name} (${processedCount}/${totalCelebrities})`, e);
        continue; 
      }

      if (parsedAiData.netWorth) {
        // Ensure we don't accidentally set netWorthINR or netWorthUSD to undefined/null 
        // which causes Mongoose validation errors
        const currentNetWorth = celeb.netWorth || {};
        celeb.netWorth = {
          ...currentNetWorth,
          ...parsedAiData.netWorth,
          netWorthUSD: parsedAiData.netWorth.netWorthUSD || currentNetWorth.netWorthUSD || { min: 0, max: 0, display: "N/A" },
          netWorthINR: parsedAiData.netWorth.netWorthINR || currentNetWorth.netWorthINR || { min: 0, max: 0, display: "N/A" }
        };
      }
      if (parsedAiData.primaryIncome) {
        if (!celeb.netWorthCalculation) celeb.netWorthCalculation = {};
        if (!celeb.netWorthCalculation.incomeSources) celeb.netWorthCalculation.incomeSources = [];
        const primaryIncomeSource = celeb.netWorthCalculation.incomeSources.find(source => source.sourceName === "Primary Income");
        if (primaryIncomeSource) {
          primaryIncomeSource.description = parsedAiData.primaryIncome;
        } else {
          celeb.netWorthCalculation.incomeSources.push({ sourceName: "Primary Income", description: parsedAiData.primaryIncome, percentage: 0 });
        }
      }
      if (parsedAiData.age !== undefined && parsedAiData.age !== null) {
        if (!celeb.quickFacts) celeb.quickFacts = {};
        const ageNum = parseInt(parsedAiData.age, 10);
        if (!isNaN(ageNum)) {
          celeb.quickFacts.age = ageNum;
        }
      }
      if (parsedAiData.height) {
        if (!celeb.heroSection) celeb.heroSection = {};
        celeb.heroSection.height = parsedAiData.height;
      }
      if (parsedAiData.industry) {
        if (!celeb.heroSection) celeb.heroSection = {};
        celeb.heroSection.industry = parsedAiData.industry;
      }
      if (parsedAiData.nationality) {
        if (!celeb.heroSection) celeb.heroSection = {};
        celeb.heroSection.nationality = parsedAiData.nationality;
      }
      if (parsedAiData.birthdate) {
        if (!celeb.quickFacts) celeb.quickFacts = {};
        celeb.quickFacts.birthDate = new Date(parsedAiData.birthdate); // Assuming birthdate is in a parseable format
      }
      if (parsedAiData.profession) {
        if (!celeb.heroSection) celeb.heroSection = {};
        celeb.heroSection.profession = Array.isArray(parsedAiData.profession) ? parsedAiData.profession : [parsedAiData.profession];
      }

      await celeb.save();
      updatedCelebrities.push(celeb.heroSection.name);
      console.log(`[Backfill] Successfully updated: ${celeb.heroSection?.name} (${processedCount}/${totalCelebrities})`);
    }

    console.log(`[Backfill] Finished! Successfully updated ${updatedCelebrities.length} out of ${totalCelebrities} celebrities.`);
    return res.status(200).json({
      success: true,
      message: `Successfully backfilled data for ${updatedCelebrities.length} celebrities.`,
      updatedCelebrities,
    });
  } catch (error) {
    console.error("Backfill API error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
