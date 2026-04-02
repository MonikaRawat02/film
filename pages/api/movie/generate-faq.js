// /api/movie/generate-faq
// Dynamically generates FAQs using Gemini AI based on movie data
import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

async function generateFAQsWithAI(movieData, pageType) {
  if (!genAI) throw new Error("Gemini API key not configured");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

  const prompt = `You are a movie FAQ generator for FilmyFire, a film intelligence platform. 

Generate exactly 5-6 frequently asked questions (FAQs) about the movie "${movieTitle}" (${releaseYear}).

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

**Instructions:**
1. Generate 5-6 unique questions that people actually search for
2. Questions should be specific to this movie and page type (${pageType})
3. Answers must be 2-4 sentences, informative, and SEO-friendly
4. Include keywords naturally: "${movieTitle}", "${genres?.[0] || 'movie'}", "${pageType.replace('-', ' ')}"
5. Make answers sound professional and authoritative
6. Focus on the page type:
   - For "budget": Ask about production costs, ROI, comparisons
   - For "box-office": Ask about collections, hit/flop verdict, regional performance
   - For "overview": Ask about streaming, ratings, general info
   - For "ending-explained": Ask about sequel possibilities, themes
   - For "ott-release": Ask about platform availability, release dates
   - For "cast": Ask about actors, performances, cameos
   - For "review-analysis": Ask about critic reception, worth watching

Respond ONLY with a valid JSON array in this exact format:
[
  {
    "question": "What was the budget of [Movie Name]?",
    "answer": "[Movie Name] was made on an estimated budget of ₹XXX crore. This includes production costs, VFX expenses, and marketing. The film recovered its budget through theatrical collections and digital rights."
  },
  {
    "question": "Did [Movie Name] recover its investment?",
    "answer": "Yes, [Movie Name] successfully recovered its budget through box office collections of ₹XXX crore worldwide. The film's OTT deal and satellite rights also contributed significantly to profitability."
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or explanations.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

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
