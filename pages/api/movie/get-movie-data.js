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
          heading: `${article.movieTitle}: A Complete Analysis`,
          content: article.summary
        },
        {
          type: "plot",
          heading: "Story Overview",
          content: article.sections?.find(s => s.heading.toLowerCase().includes('plot'))?.content || article.summary
        },
        {
          type: "box-office-preview",
          heading: "Box Office Performance",
          content: `The film grossed ${article.stats?.worldwide || article.boxOffice?.worldwide || 'N/A'} worldwide.`
        }
      );
      break;

    case "ending-explained":
      sections.push(
        {
          type: "ending-summary",
          heading: "Ending Explained: What Happened?",
          content: article.sections?.find(s => s.heading.toLowerCase().includes('ending') || s.heading.toLowerCase().includes('conclusion'))?.content || "The film concludes with a dramatic resolution that ties together the main storylines."
        },
        {
          type: "analysis",
          heading: "Hidden Meanings & Symbolism",
          content: "The ending carries deeper thematic significance, exploring themes of sacrifice, redemption, and the consequences of choices."
        },
        {
          type: "sequel-tease",
          heading: "Sequel Possibilities",
          content: "While no official sequel has been announced, the ending leaves room for future exploration of the storyline."
        }
      );
      break;

    case "box-office":
      sections.push(
        {
          type: "box-office-performance",
          heading: "Worldwide Box Office Collection",
          content: `The film collected approximately ${article.stats?.worldwide || article.boxOffice?.worldwide || 'N/A'} globally, with strong performances in key markets.`
        },
        {
          type: "territorial-breakdown",
          heading: "Territorial Breakdown",
          content: `${article.movieTitle} performed well across domestic and international markets.`
        },
        {
          type: "verdict",
          heading: "Hit or Flop Verdict",
          content: getVerdict(article)
        }
      );
      break;

    case "budget":
      sections.push(
        {
          type: "budget-breakdown",
          heading: "Production Budget Analysis",
          content: `${article.movieTitle} was made on an estimated budget of ${article.budget || 'N/A'}. This includes production costs, VFX expenses, marketing, and distribution charges.`
        },
        {
          type: "cost-breakdown",
          heading: "Cost Distribution",
          content: "The budget allocation reflects the film's ambitious scale and production quality."
        },
        {
          type: "roi",
          heading: "Return on Investment",
          content: `The film's ROI analysis shows ${article.boxOffice?.roi || 'strong commercial performance'}.`
        }
      );
      break;

    case "cast":
      sections.push(
        {
          type: "lead-cast",
          heading: "Main Cast & Characters",
          content: `The film stars ${article.cast?.slice(0, 5).map(c => c.name).join(', ')} in pivotal roles.`
        },
        {
          type: "performances",
          heading: "Standout Performances",
          content: "The cast delivers powerful performances that elevate the material, bringing depth and authenticity to their characters."
        },
        {
          type: "cameos",
          heading: "Special Appearances",
          content: "The film also features several cameo appearances that add excitement and surprise value."
        }
      );
      break;

    case "ott-release":
      sections.push(
        {
          type: "streaming-info",
          heading: "OTT Platform & Release Date",
          content: `${article.movieTitle} is available for streaming on ${article.ott?.platform || 'N/A'} starting ${article.ott?.releaseDate ? new Date(article.ott.releaseDate).toLocaleDateString() : 'the digital release date'}.`
        },
        {
          type: "digital-rights",
          heading: "Digital Streaming Rights",
          content: "The OTT rights were acquired in a competitive deal, making it one of the most anticipated digital releases."
        },
        {
          type: "where-to-watch",
          heading: "How to Watch",
          content: `Viewers can stream ${article.movieTitle} exclusively on ${article.ott?.platform || 'the platform'} with a subscription.`
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
