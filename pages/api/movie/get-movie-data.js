// /api/movie/get-movie-data
// Fetches complete movie data for pSEO pages
import dbConnect from "../../../lib/mongodb";
import Article from "../../../model/article";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug, type = "overview" } = req.query;

  if (!slug) {
    return res.status(400).json({ message: "Movie slug is required" });
  }

  const cacheKey = `movie:${slug}:${type}`;

  try {
    const movieData = await cacheManager(cacheKey, 3600, async () => {
      await dbConnect();

      // Find the movie article
      const article = await Article.findOne({
        $or: [
          { slug: new RegExp(`^${slug}$`, 'i') },
          { slug: new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') }
        ]
      }).lean();

      if (!article) {
        throw new Error("Movie not found");
      }

      // Determine if this is a valid page type
      const validTypes = [
        "overview",
        "ending-explained",
        "box-office",
        "budget",
        "ott-release",
        "cast",
        "review-analysis",
        "hit-or-flop"
      ];

      const pageType = validTypes.includes(type) ? type : "overview";

      // Generate page-specific content sections
      const contentSections = generateContentSections(article, pageType);

      // Generate meta data
      const metaData = generateMetaData(article, pageType);

      return {
        ...article,
        pageType,
        contentSections,
        metaData,
        relatedMovies: article.relatedMovies || []
      };
    });

    return res.status(200).json({
      success: true,
      data: movieData
    });

  } catch (error) {
    console.error("Movie Data API Error:", error);
    return res.status(error.message === "Movie not found" ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
}

// Generate content sections based on page type
function generateContentSections(article, pageType) {
  const sections = [];

  switch (pageType) {
    case "overview":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} (${article.releaseYear}) – Full Analysis, Box Office & OTT Details`,
          content: article.summary
        },
        {
          type: "overview",
          heading: `${article.movieTitle} Overview`,
          content: article.summary
        },
        {
          type: "plot",
          heading: "Plot Summary",
          content: article.sections?.find(s => s.heading.toLowerCase().includes('plot'))?.content || article.summary
        },
        {
          type: "ending",
          heading: "Ending Explained",
          content: article.sections?.find(s => s.heading.toLowerCase().includes('ending'))?.content || "Click the 'Ending Explained' sub-page for a deep-dive analysis of the conclusion."
        },
        {
          type: "box-office-preview",
          heading: "Box Office Collection",
          content: `The film grossed ${article.stats?.worldwide || article.boxOffice?.worldwide || 'N/A'} worldwide.`
        },
        {
          type: "budget",
          heading: "Budget & Profit",
          content: `${article.movieTitle} was made on a budget of ${article.budget || 'N/A'}.`
        },
        {
          type: "ott",
          heading: "OTT Release Details",
          content: `${article.movieTitle} is available on ${article.ott?.platform || 'streaming platforms'}.`
        },
        {
          type: "cast",
          heading: "Cast & Characters",
          content: `The film features ${article.cast?.slice(0, 5).map(c => c.name).join(', ')}.`
        },
        {
          type: "reaction",
          heading: "Audience Reaction",
          content: "The film received mixed to positive reactions from the audience."
        }
      );
      break;

    case "ending-explained":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} Ending Explained – Deep Analysis & Hidden Meanings`,
          content: `A comprehensive breakdown of the ${article.movieTitle} ending and what it means for the characters.`
        },
        {
          type: "ending-summary",
          heading: "The Final Sequence Breakdown",
          content: article.sections?.find(s => s.heading.toLowerCase().includes('ending') || s.heading.toLowerCase().includes('conclusion'))?.content || "The film concludes with a dramatic resolution that ties together the main storylines."
        },
        {
          type: "analysis",
          heading: "Themes and Symbolism",
          content: "The ending carries deeper thematic significance, exploring themes of sacrifice, redemption, and the consequences of choices."
        },
        {
          type: "character-resolutions",
          heading: "Character Resolutions",
          content: "Each character's journey reaches a definitive point by the end of the film."
        },
        {
          type: "unanswered-questions",
          heading: "Unanswered Questions",
          content: "While many arcs are resolved, some questions remain for the audience to interpret."
        }
      );
      break;

    case "box-office":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} Box Office Collection – Worldwide Revenue & Verdict`,
          content: `A detailed report on the commercial performance of ${article.movieTitle}.`
        },
        {
          type: "theatrical-timeline",
          heading: "Theatrical Run Timeline",
          content: "The film had an extensive run in theaters worldwide."
        },
        {
          type: "performance",
          heading: "Domestic vs International Performance",
          content: `The film collected approximately ${article.stats?.worldwide || article.boxOffice?.worldwide || 'N/A'} globally, with strong performances in key markets.`
        },
        {
          type: "budget-analysis",
          heading: "Budget vs Collection Analysis",
          content: `With a budget of ${article.budget}, the film's collections are being analyzed for profitability.`
        },
        {
          type: "verdict",
          heading: "Final Verdict (Hit/Flop)",
          content: getVerdict(article)
        }
      );
      break;

    case "budget":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} Movie Budget – Production Costs & Profit Analysis`,
          content: `An in-depth look at the financial aspects of ${article.movieTitle}.`
        },
        {
          type: "budget-breakdown",
          heading: "Production Cost Breakdown",
          content: `${article.movieTitle} was made on an estimated budget of ${article.budget || 'N/A'}. This includes production costs, VFX expenses, marketing, and distribution charges.`
        },
        {
          type: "salaries",
          heading: "Cast & Crew Salaries",
          content: "A significant portion of the budget was allocated to the lead cast and technical crew."
        },
        {
          type: "marketing",
          heading: "Marketing & Distribution Costs",
          content: "The film's marketing campaign spanned multiple platforms and territories."
        },
        {
          type: "roi",
          heading: "Profitability Analysis",
          content: `The film's ROI analysis shows ${article.boxOffice?.roi || 'strong commercial performance'}.`
        }
      );
      break;

    case "ott-release":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} OTT Release Date – Streaming Platform & Rights`,
          content: `Everything you need to know about where to stream ${article.movieTitle}.`
        },
        {
          type: "streaming-info",
          heading: "Digital Rights and Platform",
          content: `${article.movieTitle} is available for streaming on ${article.ott?.platform || 'N/A'} starting ${article.ott?.releaseDate ? new Date(article.ott.releaseDate).toLocaleDateString() : 'the digital release date'}.`
        },
        {
          type: "theatrical-window",
          heading: "Theatrical to OTT Window",
          content: "The film followed the standard industry window for its digital premiere."
        },
        {
          type: "satellite",
          heading: "Satellite Rights Details",
          content: "The television broadcasting rights were sold to a major network."
        },
        {
          type: "response",
          heading: "Audience Response on OTT",
          content: `Viewers have been streaming ${article.movieTitle} extensively since its digital debut.`
        }
      );
      break;

    case "cast":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} Cast & Characters – Performance Analysis`,
          content: "A deep dive into the performances and characters of the film."
        },
        {
          type: "lead-cast",
          heading: "Lead Performances Breakdown",
          content: `The film stars ${article.cast?.slice(0, 5).map(c => c.name).join(', ')} in pivotal roles.`
        },
        {
          type: "supporting",
          heading: "Supporting Cast Highlights",
          content: "The supporting cast provides excellent backup to the main leads."
        },
        {
          type: "arc",
          heading: "Character Arc Analysis",
          content: "The characters undergo significant emotional and narrative development."
        },
        {
          type: "impact",
          heading: "Casting Decisions and Impact",
          content: "The casting was instrumental in bringing the director's vision to life."
        }
      );
      break;

    case "review-analysis":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} Review Analysis – Critical Response & Audience Reaction`,
          content: "A summary of how the film was received by critics and fans."
        },
        {
          type: "critical",
          heading: "Critical Consensus",
          content: "Critics praised the film for its technical aspects and performances."
        },
        {
          type: "audience",
          heading: "Audience Reception",
          content: "The general public responded positively to the emotional core of the story."
        },
        {
          type: "technical",
          heading: "Technical Aspects (Direction, Cinematography)",
          content: "The direction and cinematography were highlighted as major strengths."
        },
        {
          type: "score",
          heading: "Final Score & Recommendation",
          content: `With a rating of ${article.rating || 'N/A'}, the film is a recommended watch.`
        }
      );
      break;

    case "hit-or-flop":
      sections.push(
        {
          type: "introduction",
          heading: `${article.movieTitle} Hit or Flop – Final Verdict & Performance Analysis`,
          content: "The definitive verdict on the film's commercial status."
        },
        {
          type: "expectations",
          heading: "Commercial Expectations",
          content: "The film carried high expectations due to its star cast and director."
        },
        {
          type: "comparison",
          heading: "Box Office vs Budget Comparison",
          content: `The film's collections of ${article.stats?.worldwide || 'N/A'} are compared against its ${article.budget} budget.`
        },
        {
          type: "recovery",
          heading: "Recovery and Profit Analysis",
          content: "The film successfully recovered its costs through theatrical and non-theatrical rights."
        },
        {
          type: "verdict",
          heading: "Final Industry Verdict",
          content: getVerdict(article)
        }
      );
      break;

    default:
      sections.push({
        type: "general",
        heading: `${article.movieTitle} - ${pageType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        content: article.summary
      });
  }

  return sections;
}

// Generate SEO metadata
function generateMetaData(article, pageType) {
  const title = article.movieTitle;
  const year = article.releaseYear;
  const category = article.category;

  const pageTypeTitles = {
    overview: `${title} (${year}) - Full Analysis, Box Office & OTT Details | FilmyFire`,
    "ending-explained": `${title} (${year}) Ending Explained - Hidden Meanings & Conclusion | FilmyFire`,
    "box-office": `${title} Box Office Collection Report | FilmyFire`,
    "budget": `${title} Budget & Production Costs | FilmyFire`,
    "ott-release": `${title} OTT Release Date & Streaming Platform | FilmyFire`,
    "cast": `${title} Cast & Characters - Complete Analysis | FilmyFire`,
    "review-analysis": `${title} Review - Critics & Audience Reaction | FilmyFire`,
    "hit-or-flop": `${title} Hit or Flop? Box Office Verdict | FilmyFire`
  };

  const descriptions = {
    overview: `Complete analysis of ${title} (${year}). Get detailed box office collection, budget breakdown, OTT release info, and expert reviews.`,
    "ending-explained": `Confused about ${title}'s ending? We explain the conclusion, hidden meanings, and what it all means for potential sequels.`,
    "box-office": `Discover ${title}'s worldwide box office collection. Was it a hit or flop? Find out the verdict here.`,
    "budget": `Discover ${title}'s production budget, costs, and profit analysis. Get detailed financial breakdown.`,
    "ott-release": `When and where to watch ${title}? Get OTT release date, streaming platform details, and digital availability info.`,
    "cast": `Meet the cast of ${title}. Complete analysis of actors, characters, performances, and special appearances.`,
    "review-analysis": `What are critics saying about ${title}? Read comprehensive review analysis and audience reactions.`,
    "hit-or-flop": `Was ${title} a commercial success? Get the definitive hit or flop verdict based on box office performance.`
  };

  return {
    title: pageTypeTitles[pageType] || pageTypeTitles.overview,
    description: descriptions[pageType] || descriptions.overview,
    keywords: [
      title,
      `${title} ${pageType.replace('-', ' ')}`,
      `${title} ${year}`,
      `${category} movies`,
      article.genres?.[0] || 'movie',
      pageType.replace('-', ' ')
    ].filter(Boolean),
    canonical: `/movie/${article.slug}${pageType !== 'overview' ? `-${pageType}` : ''}`,
    openGraph: {
      title: pageTypeTitles[pageType],
      description: descriptions[pageType],
      image: article.coverImage,
      type: 'article'
    }
  };
}

// Get box office verdict
function getVerdict(article) {
  const budget = parseInt(article.budget) || 0;
  const ww = parseInt(article.stats?.worldwide) || parseInt(article.boxOffice?.worldwide) || 0;

  if (ww >= budget * 3) {
    return "Blockbuster! The film exceeded all expectations with phenomenal collections.";
  } else if (ww >= budget * 2) {
    return "Hit! The film was commercially successful and profitable.";
  } else if (ww >= budget * 1.5) {
    return "Above Average. The film recovered costs and made moderate profits.";
  } else if (ww >= budget) {
    return "Average. The film managed to recover its investment.";
  } else {
    return "Flop. The film failed to recover its production and marketing costs.";
  }
}
