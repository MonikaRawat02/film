// /api/movie/generate-faq
// Dynamically generates FAQs using Gemini AI based on movie data
import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { generateContent } from "../../../lib/openai-helper";

async function generateFAQsWithAI(movieData, pageType) {
  const { 
    movieTitle, 
    releaseYear, 
    director, 
    cast, 
    genres, 
    budget, 
    boxOffice, 
    ott, 
    rating,
    summary 
  } = movieData;

  const prompt = `Generate exactly 5-6 frequently asked questions (FAQs) about the movie "${movieTitle}" (${releaseYear}).

**Movie Details:**
- Title: ${movieTitle}
- Release Year: ${releaseYear}
- Director: ${director?.join(", ") || "N/A"}
- Cast: ${cast?.slice(0, 3).map(c => c.name).join(", ") || "N/A"}
- Genres: ${genres?.join(", ") || "N/A"}
- Budget: ${budget || "N/A"}
- Box Office: ${boxOffice?.worldwide || "N/A"}
- OTT Platform: ${ott?.platform || "N/A"}
- Rating: ${rating || "N/A"}
- Summary: ${summary?.substring(0, 300) || "N/A"}
- Page Type: ${pageType}

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "question": "What was the budget of [Movie Name]?",
    "answer": "[Movie Name] was made on an estimated budget of ₹XXX crore. This includes production costs, VFX expenses, and marketing. The film recovered its budget through theatrical collections and digital rights."
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or explanations.`;

  const text = await generateContent(prompt);
  if (!text) throw new Error("OpenAI failed to generate FAQs");

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  } else {
    // Remove markdown code block syntax if present
    jsonText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  }

  try {
    const parsed = JSON.parse(jsonText);
    
    // Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    // Ensure each item has question and answer
    const validated = parsed.map(item => ({
      question: String(item.question || ""),
      answer: String(item.answer || "")
    })).filter(item => item.question && item.answer);

    if (validated.length < 5) {
      console.warn(`Only ${validated.length} valid FAQs generated, expected 5-6`);
    }

    return validated.slice(0, 6); // Return max 6 FAQs
  } catch (parseError) {
    console.error("FAQ JSON parsing error:", parseError, "Raw response:", text);
    throw new Error("Failed to parse AI-generated FAQs");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug, pageType } = req.body;

  if (!slug) {
    return res.status(400).json({ message: "Movie slug is required" });
  }

  try {
    await dbConnect();

    // Find the movie article
    const article = await Article.findOne({ 
      $or: [
        { slug: new RegExp(`^${slug}$`, 'i') },
        { slug: new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') }
      ]
    }).select('movieTitle releaseYear director cast genres budget boxOffice ott rating summary');

    if (!article) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check if we already have cached FAQs for this movie+pageType
    const cacheKey = `faq:${slug}:${pageType}`;
    
    // Try to get from Redis cache (optional, can be added later)
    // For now, always generate fresh

    // Generate FAQs with AI
    let faqs;
    try {
      faqs = await generateFAQsWithAI(article.toObject(), pageType);
    } catch (aiError) {
      console.error("AI FAQ generation failed, using fallback:", aiError.message);
      
      // Fallback to basic FAQs if AI fails
      faqs = [
        {
          question: `When was ${article.movieTitle} released?`,
          answer: `${article.movieTitle} was released in ${article.releaseYear}.`
        },
        {
          question: `Who directed ${article.movieTitle}?`,
          answer: `${article.movieTitle} was directed by ${article.director?.[0] || 'the director'}.`
        },
        {
          question: `What is ${article.movieTitle} about?`,
          answer: article.summary || `${article.movieTitle} is a ${article.genres?.[0] || 'film'}.`
        },
        {
          question: `Where can I watch ${article.movieTitle}?`,
          answer: `${article.movieTitle} is available on ${article.ott?.platform || 'streaming platforms'}.`
        },
        {
          question: `What is the rating of ${article.movieTitle}?`,
          answer: `${article.movieTitle} has a rating of ${article.rating || 'N/A'}.`
        }
      ];
    }

    // Optionally save FAQs back to the article for future use
    // await Article.updateOne(
    //   { _id: article._id },
    //   { $set: { [`meta.faq.${pageType}`]: faqs } }
    // );

    return res.status(200).json({
      success: true,
      data: faqs,
      source: "ai-generated",
      count: faqs.length
    });

  } catch (error) {
    console.error("FAQ Generation Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
