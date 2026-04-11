import dbConnect from "../../../../lib/mongodb";
import Article from "../../../../model/article";
import { generateMovieContent } from "../../../../lib/ai-generator";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  if (req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ message: "Movie slug is required" });
  }

  try {
    await dbConnect();
    const movie = await Article.findOne({ slug });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const subPageTypes = [
      "overview", // Added overview to the generation list
      "ending-explained",
      "box-office",
      "budget",
      "ott-release",
      "cast",
      "review-analysis",
      "hit-or-flop",
    ];

    // If content is empty for a page type, try to populate it from existing sections as a baseline
    const populateFromSections = (keywords, contentField) => {
      if (!movie[contentField] || movie[contentField].length === 0) {
        const relevant = (movie.sections || []).filter(s => 
          keywords.some(k => s.heading.toLowerCase().includes(k))
        );
        if (relevant.length > 0) movie[contentField] = relevant;
      }
    };

    populateFromSections(["overview", "plot", "introduction"], "pSEO_Content_overview");
    populateFromSections(["ending", "climax", "plot"], "pSEO_Content_ending_explained");
    populateFromSections(["box office", "commercial", "budget"], "pSEO_Content_box_office");
    populateFromSections(["production", "budget", "cost"], "pSEO_Content_budget");
    populateFromSections(["release", "distribution", "streaming"], "pSEO_Content_ott_release");
    populateFromSections(["cast", "starring", "characters"], "pSEO_Content_cast");
    populateFromSections(["reception", "critical", "review"], "pSEO_Content_review_analysis");
    populateFromSections(["verdict", "box office"], "pSEO_Content_hit_or_flop");

    let generatedCount = 0;
    for (const pageType of subPageTypes) {
      try {
        const subPageKey = pageType.replace(/-/g, "").replace("explained", "Explained").replace("release", "Release").replace("analysis", "Analysis").replace("flop", "Flop").replace("office", "Office");
        
        // 1. Strict check: Skip if subPages flag is already true (for everything except overview)
        if (pageType !== "overview" && movie.subPages && movie.subPages[subPageKey]) {
          console.log(`⏩ Skipping [${pageType}] for ${slug}: Flag 'subPages.${subPageKey}' is already true.`);
          continue;
        }

        // 2. Overview check: Skip if overview content exists
        if (pageType === "overview" && movie.pSEO_Content_overview && movie.pSEO_Content_overview.length > 0) {
          console.log(`⏩ Skipping [${pageType}] for ${slug}: Overview content already exists.`);
          continue;
        }

        // 3. Data existence check: Skip if content array already has data
        const updateField = `pSEO_Content_${pageType.replace(/-/g, "_")}`;
        if (movie[updateField] && movie[updateField].length > 0) {
          console.log(`⏩ Skipping [${pageType}] for ${slug}: Data already exists in ${updateField}.`);
          continue;
        }

        // Defensive check: Ensure we have at least a movie title to proceed
        if (!movie.movieTitle && !movie.title) {
          console.warn(`⚠️ Skipping [${pageType}] for ${slug}: Missing movie title.`);
          continue;
        }

        console.log(`🤖 Generating [${pageType}] content for ${movie.movieTitle || movie.title}...`);
        const aiResponse = await generateMovieContent(movie, pageType);
        
        if (aiResponse && aiResponse.sections && aiResponse.sections.length > 0) {
          const { sections, isAI } = aiResponse;
          
          const updateData = {
            [updateField]: sections,
            isAIContent: isAI,
          };

          // Mark subPage as active if it's not the overview
          if (pageType !== "overview") {
            updateData[`subPages.${pageType.replace(/-/g, "_")}`] = true;
          } else {
            // For overview, also update the main sections array for compatibility
            updateData.sections = sections;
          }
          
          await Article.updateOne(
            { _id: movie._id },
            { $set: updateData }
          );
          generatedCount++;
        }
      } catch (err) {
        console.error(`❌ Failed to generate [${pageType}] for ${slug}:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${generatedCount}/${subPageTypes.length} sub-pages for ${movie.movieTitle}`,
    });

  } catch (error) {
    console.error(`Sub-page generation error for ${slug}:`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
