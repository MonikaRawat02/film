import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { generateMovieContent } from "../../../../lib/ai-generator";

export default async function handler(req, res) {
  // Security check for production
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug, pageType = "overview" } = req.body;

  if (!slug) {
    return res.status(400).json({ message: "Movie slug is required" });
  }

  try {
    await dbConnect();

    // 1. Fetch the movie article from the database
    const movie = await Article.findOne({ slug });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found in database" });
    }

    // 2. Generate long-form AI content
    console.log(`🚀 Generating AI content for ${movie.movieTitle} (${pageType})...`);
    let aiResponse;
    try {
      aiResponse = await generateMovieContent(movie, pageType);
    } catch (aiErr) {
      console.error(`❌ AI Generation Failed for ${movie.movieTitle}:`, aiErr.message);
      return res.status(500).json({ 
        success: false, 
        message: `AI generation failed: ${aiErr.message}`,
        error: aiErr.message?.includes('429') ? "AI Quota Exceeded. Please check your provider limits." : aiErr.message
      });
    }

    if (!aiResponse || !aiResponse.sections || aiResponse.sections.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to generate AI content. The AI returned an empty response." 
      });
    }

    const { sections: aiSections, isAI } = aiResponse;

    // 3. Update the article with AI-generated sections
    const updateData = {
      isAIContent: isAI
    };
    
    // Map pageType to specific pSEO content field
    const contentFieldMap = {
      "overview": "pSEO_Content_overview",
      "ending-explained": "pSEO_Content_ending_explained",
      "box-office": "pSEO_Content_box_office",
      "budget": "pSEO_Content_budget",
      "ott-release": "pSEO_Content_ott_release",
      "cast": "pSEO_Content_cast",
      "review-analysis": "pSEO_Content_review_analysis",
      "hit-or-flop": "pSEO_Content_hit_or_flop"
    };

    const contentField = contentFieldMap[pageType];
    if (contentField) {
      updateData[contentField] = aiSections;
      
      // Also update main sections if it's the overview
      if (pageType === "overview") {
        updateData.sections = aiSections;
      }
    }
    
    // Mark sub-page as active in the schema
    const subPageKey = pageType === "ending-explained" ? "endingExplained" : 
                       pageType === "box-office" ? "boxOffice" : 
                       pageType === "budget" ? "budget" : 
                       pageType === "ott-release" ? "ottRelease" : 
                       pageType === "cast" ? "cast" : 
                       pageType === "review-analysis" ? "reviewAnalysis" : 
                       pageType === "hit-or-flop" ? "hitOrFlop" : null;
    
    if (subPageKey) {
      updateData[`subPages.${subPageKey}`] = true;
      
      // Update SEO metadata for the sub-page
      updateData[`subPagesSEO.${subPageKey}`] = {
        title: `${movie.movieTitle} (${movie.releaseYear}) – ${pageType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
        description: aiSections[0]?.content.slice(0, 160) || movie.summary,
        faq: aiSections.find(s => s.heading.toLowerCase().includes('faq'))?.content
          .split('\n\n')
          .filter(q => q.includes('?'))
          .map(q => ({
            question: q.split('?')[0] + '?',
            answer: q.split('?')[1]?.trim() || "Information coming soon."
          })) || []
      };
    }

    await Article.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: isAI ? `Successfully generated AI ${pageType} content` : `Generated template fallback ${pageType} content (Quota Exceeded)`,
      movie: movie.movieTitle,
      isAIContent: isAI,
      sectionsCount: aiSections.length
    });

  } catch (error) {
    console.error("AI Content Automation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
