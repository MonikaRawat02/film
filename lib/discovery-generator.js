/**
 * Discovery Page Generator
 * Automatically generates discovery pages like:
 * - /best-thriller-movies
 * - /top-netflix-movies
 * - /movies-like-inception
 * - /highest-grossing-2024-movies
 */

import dbConnect from "./mongodb";
import Article from "../model/article";
import DiscoveryPage from "../model/discoveryPage";

// Predefined discovery page templates
export const DISCOVERY_TEMPLATES = [
  // Genre-based pages
  { slug: "best-thriller-movies", type: "best-genre", genre: "Thriller", title: "Best Thriller Movies", category: "All" },
  { slug: "best-action-movies", type: "best-genre", genre: "Action", title: "Best Action Movies", category: "All" },
  { slug: "best-horror-movies", type: "best-genre", genre: "Horror", title: "Best Horror Movies", category: "All" },
  { slug: "best-comedy-movies", type: "best-genre", genre: "Comedy", title: "Best Comedy Movies", category: "All" },
  { slug: "best-drama-movies", type: "best-genre", genre: "Drama", title: "Best Drama Movies", category: "All" },
  { slug: "best-romance-movies", type: "best-genre", genre: "Romance", title: "Best Romance Movies", category: "All" },
  { slug: "best-sci-fi-movies", type: "best-genre", genre: "Science Fiction", title: "Best Sci-Fi Movies", category: "All" },
  { slug: "best-crime-movies", type: "best-genre", genre: "Crime", title: "Best Crime Movies", category: "All" },
  { slug: "best-mystery-movies", type: "best-genre", genre: "Mystery", title: "Best Mystery Movies", category: "All" },
  { slug: "best-adventure-movies", type: "best-genre", genre: "Adventure", title: "Best Adventure Movies", category: "All" },
  
  // Bollywood genre pages
  { slug: "best-bollywood-thriller-movies", type: "best-genre", genre: "Thriller", title: "Best Bollywood Thriller Movies", category: "Bollywood" },
  { slug: "best-bollywood-action-movies", type: "best-genre", genre: "Action", title: "Best Bollywood Action Movies", category: "Bollywood" },
  { slug: "best-bollywood-comedy-movies", type: "best-genre", genre: "Comedy", title: "Best Bollywood Comedy Movies", category: "Bollywood" },
  { slug: "best-bollywood-romance-movies", type: "best-genre", genre: "Romance", title: "Best Bollywood Romance Movies", category: "Bollywood" },
  
  // Hollywood genre pages
  { slug: "best-hollywood-thriller-movies", type: "best-genre", genre: "Thriller", title: "Best Hollywood Thriller Movies", category: "Hollywood" },
  { slug: "best-hollywood-action-movies", type: "best-genre", genre: "Action", title: "Best Hollywood Action Movies", category: "Hollywood" },
  { slug: "best-hollywood-horror-movies", type: "best-genre", genre: "Horror", title: "Best Hollywood Horror Movies", category: "Hollywood" },
  { slug: "best-hollywood-sci-fi-movies", type: "best-genre", genre: "Science Fiction", title: "Best Hollywood Sci-Fi Movies", category: "Hollywood" },
  
  // OTT Platform pages
  { slug: "top-netflix-movies", type: "top-platform", platform: "Netflix", title: "Top Netflix Movies", category: "All" },
  { slug: "top-amazon-prime-movies", type: "top-platform", platform: "Amazon Prime", title: "Top Amazon Prime Movies", category: "All" },
  { slug: "top-disney-plus-movies", type: "top-platform", platform: "Disney+", title: "Top Disney+ Movies", category: "All" },
  { slug: "top-hotstar-movies", type: "top-platform", platform: "Hotstar", title: "Top Hotstar Movies", category: "All" },
  { slug: "top-zee5-movies", type: "top-platform", platform: "ZEE5", title: "Top ZEE5 Movies", category: "All" },
  { slug: "top-jiocinema-movies", type: "top-platform", platform: "JioCinema", title: "Top JioCinema Movies", category: "All" },
  
  // Year-based pages (dynamic - current year and previous years)
  { slug: "best-movies-2026", type: "year-best", year: 2026, title: "Best Movies of 2026", category: "All" },
  { slug: "best-movies-2025", type: "year-best", year: 2025, title: "Best Movies of 2025", category: "All" },
  { slug: "best-movies-2024", type: "year-best", year: 2024, title: "Best Movies of 2024", category: "All" },
  { slug: "best-movies-2023", type: "year-best", year: 2023, title: "Best Movies of 2023", category: "All" },
  
  // Highest grossing pages
  { slug: "highest-grossing-movies", type: "highest-grossing", title: "Highest Grossing Movies of All Time", category: "All" },
  { slug: "highest-grossing-bollywood-movies", type: "highest-grossing", title: "Highest Grossing Bollywood Movies", category: "Bollywood" },
  { slug: "highest-grossing-hollywood-movies", type: "highest-grossing", title: "Highest Grossing Hollywood Movies", category: "Hollywood" },
  
  // Trending pages
  { slug: "trending-movies-this-week", type: "trending", title: "Trending Movies This Week", category: "All" },
  { slug: "trending-bollywood-movies", type: "trending", title: "Trending Bollywood Movies", category: "Bollywood" },
  { slug: "trending-hollywood-movies", type: "trending", title: "Trending Hollywood Movies", category: "Hollywood" },
];

/**
 * Generate description for a discovery page
 */
function generateDescription(template) {
  const { type, genre, platform, year, title, category } = template;
  
  switch (type) {
    case "best-genre":
      return `Discover the top-rated ${genre.toLowerCase()} movies${category !== "All" ? ` from ${category}` : ""}. Our curated list includes detailed analysis, box office reports, and ending explanations for each film.`;
    
    case "top-platform":
      return `Explore the best movies streaming on ${platform} right now. We've analyzed ratings, reviews, and viewer preferences to bring you the top picks with full intelligence reports.`;
    
    case "year-best":
      return `The definitive guide to the best movies released in ${year}. From blockbusters to indie gems, explore comprehensive analysis and box office performance for each film.`;
    
    case "highest-grossing":
      return `The biggest box office hits${category !== "All" ? ` in ${category}` : " of all time"}. Explore detailed financial analysis, worldwide collections, and what made these movies commercial successes.`;
    
    case "trending":
      return `What's hot right now in ${category !== "All" ? category : "cinema"}. These are the most talked-about movies with real-time trending data and full intelligence reports.`;
    
    default:
      return `Explore our curated selection of ${title.toLowerCase()}. Each movie includes detailed analysis, reviews, and intelligence reports.`;
  }
}

/**
 * Build MongoDB query based on template
 */
function buildQuery(template) {
  const { type, genre, platform, year, category } = template;
  const query = {};
  
  // Category filter
  if (category && category !== "All") {
    query.category = category;
  }
  
  // Type-specific filters
  switch (type) {
    case "best-genre":
      if (genre) {
        query.genres = { $in: [new RegExp(genre, 'i')] };
      }
      break;
    
    case "top-platform":
      if (platform) {
        query["ott.platform"] = { $regex: new RegExp(platform, 'i') };
      }
      break;
    
    case "year-best":
      if (year) {
        query.releaseYear = year;
      }
      break;
    
    case "highest-grossing":
      query["boxOffice.worldwide"] = { $exists: true, $ne: "" };
      break;
    
    case "trending":
      query.trendingScore = { $gt: 0 };
      break;
  }
  
  return query;
}

/**
 * Get sort order based on page type
 */
function getSortOrder(type) {
  switch (type) {
    case "highest-grossing":
      return { "boxOffice.worldwide": -1 };
    case "trending":
      return { trendingScore: -1 };
    case "year-best":
      return { rating: -1, "stats.views": -1 };
    default:
      return { rating: -1, releaseYear: -1 };
  }
}

/**
 * Generate a single discovery page
 */
export async function generateDiscoveryPage(template) {
  try {
    await dbConnect();
    
    const query = buildQuery(template);
    const sort = getSortOrder(template.type);
    
    // Fetch movies matching the criteria
    const movies = await Article.find(query)
      .sort(sort)
      .limit(template.limit || 20)
      .select("_id movieTitle slug releaseYear coverImage backdropImage rating genres summary")
      .lean();
    
    if (movies.length === 0) {
      console.log(`⚠️ No movies found for ${template.slug}`);
      return null;
    }
    
    const description = generateDescription(template);
    
    // Generate FAQ
    const faq = generateFAQ(template, movies);
    
    // Create or update the discovery page
    const pageData = {
      slug: template.slug,
      title: template.title,
      description,
      pageType: template.type,
      category: template.category || "All",
      queryParams: {
        genre: template.genre,
        platform: template.platform,
        year: template.year,
        sortBy: template.type === "highest-grossing" ? "boxOffice" : "rating",
        limit: template.limit || 20,
      },
      movies: movies.map(m => ({
        _id: m._id.toString(),
        slug: m.slug,
        movieTitle: m.movieTitle,
        releaseYear: m.releaseYear,
        coverImage: m.coverImage,
        backdropImage: m.backdropImage,
        rating: m.rating,
        genres: m.genres,
        summary: m.summary,
      })),
      seo: {
        metaTitle: `${template.title} - FilmyFire Intelligence`,
        metaDescription: description.substring(0, 160),
        keywords: [
          template.title.toLowerCase(),
          template.genre?.toLowerCase(),
          template.platform?.toLowerCase(),
          template.category?.toLowerCase(),
          "movies",
          "films",
          "streaming",
        ].filter(Boolean),
        ogImage: movies[0]?.backdropImage || movies[0]?.coverImage,
      },
      faq,
      status: "published",
      isAutoGenerated: true,
      lastRefreshed: new Date(),
    };
    
    // Upsert the page
    await DiscoveryPage.findOneAndUpdate(
      { slug: template.slug },
      pageData,
      { upsert: true, new: true }
    );
    
    console.log(`✅ Generated discovery page: ${template.slug} (${movies.length} movies)`);
    return pageData;
    
  } catch (error) {
    console.error(`❌ Error generating ${template.slug}:`, error.message);
    return null;
  }
}

/**
 * Generate FAQ for a discovery page
 */
function generateFAQ(template, movies) {
  const { type, genre, platform, year, title, category } = template;
  const faq = [];
  
  // Common questions based on page type
  switch (type) {
    case "best-genre":
      faq.push({
        question: `What are the best ${genre?.toLowerCase()} movies to watch?`,
        answer: `Our list features the top-rated ${genre?.toLowerCase()} movies${category !== "All" ? ` from ${category}` : ""} including ${movies.slice(0, 3).map(m => m.movieTitle).join(", ")}. Each film has been analyzed for plot quality, performances, and audience reception.`
      });
      faq.push({
        question: `How are these ${genre?.toLowerCase()} movies ranked?`,
        answer: `We rank movies based on a combination of critic ratings, audience scores, box office performance, and our proprietary intelligence analysis. This ensures a balanced and comprehensive ranking.`
      });
      break;
    
    case "top-platform":
      faq.push({
        question: `What are the best movies on ${platform} right now?`,
        answer: `The top movies on ${platform} include ${movies.slice(0, 3).map(m => m.movieTitle).join(", ")}. Our list is updated regularly based on viewer ratings and trending data.`
      });
      faq.push({
        question: `Is ${platform} worth subscribing for these movies?`,
        answer: `${platform} offers a strong selection of quality content. With movies like ${movies[0]?.movieTitle} and ${movies[1]?.movieTitle}, it provides excellent value for movie enthusiasts.`
      });
      break;
    
    case "year-best":
      faq.push({
        question: `What were the best movies released in ${year}?`,
        answer: `${year} saw several outstanding releases including ${movies.slice(0, 3).map(m => m.movieTitle).join(", ")}. Our list covers both commercial hits and critically acclaimed films.`
      });
      faq.push({
        question: `Which ${year} movie has the highest rating?`,
        answer: `Among ${year} releases, ${movies[0]?.movieTitle} stands out with exceptional reviews. You can find detailed analysis and ending explanations for all these films on FilmyFire.`
      });
      break;
    
    case "highest-grossing":
      faq.push({
        question: `What is the highest grossing ${category !== "All" ? category : ""} movie?`,
        answer: `${movies[0]?.movieTitle} holds a top position among highest grossing ${category !== "All" ? category : ""} movies. Visit our detailed box office analysis for complete financial breakdowns.`
      });
      break;
    
    case "trending":
      faq.push({
        question: `What movies are trending this week?`,
        answer: `Current trending movies include ${movies.slice(0, 3).map(m => m.movieTitle).join(", ")}. Our trending list is updated in real-time based on search volume and social media buzz.`
      });
      break;
  }
  
  // Add generic questions
  faq.push({
    question: `Where can I watch these movies?`,
    answer: `Most of these movies are available on popular streaming platforms. Check individual movie pages on FilmyFire for specific OTT availability and streaming links.`
  });
  
  return faq;
}

/**
 * Generate all discovery pages
 */
export async function generateAllDiscoveryPages() {
  console.log("🚀 Starting discovery page generation...\n");
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const template of DISCOVERY_TEMPLATES) {
    try {
      const result = await generateDiscoveryPage(template);
      if (result) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Add small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to generate ${template.slug}:`, error.message);
      errorCount++;
    }
  }
  
  console.log("\n===========================================");
  console.log("📊 DISCOVERY PAGE GENERATION COMPLETE:");
  console.log(`   Total Templates: ${DISCOVERY_TEMPLATES.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
  console.log("===========================================\n");
  
  return { successCount, errorCount, total: DISCOVERY_TEMPLATES.length };
}

/**
 * Generate "Movies Like X" pages for top movies
 */
export async function generateMoviesLikePages(limit = 20) {
  try {
    await dbConnect();
    
    // Get top-rated movies to create "Movies Like X" pages
    const topMovies = await Article.find({ rating: { $gte: "7" } })
      .sort({ "stats.views": -1, rating: -1 })
      .limit(limit)
      .select("movieTitle slug genres releaseYear")
      .lean();
    
    let successCount = 0;
    
    for (const movie of topMovies) {
      const template = {
        slug: `movies-like-${movie.slug}`,
        type: "movies-like",
        title: `Movies Like ${movie.movieTitle}`,
        genre: movie.genres?.[0],
        category: "All",
        sourceMovie: movie.slug,
      };
      
      // Find similar movies
      const similarMovies = await Article.find({
        slug: { $ne: movie.slug },
        genres: { $in: movie.genres },
      })
        .sort({ rating: -1 })
        .limit(15)
        .select("_id movieTitle slug releaseYear coverImage backdropImage rating genres summary")
        .lean();
      
      if (similarMovies.length < 5) continue;
      
      const description = `Love ${movie.movieTitle}? Discover similar movies with the same thrilling experience. Our recommendation engine has curated films that match the style, genre, and appeal of ${movie.movieTitle}.`;
      
      const pageData = {
        slug: template.slug,
        title: template.title,
        description,
        pageType: "movies-like",
        category: "All",
        queryParams: {
          genre: movie.genres?.[0],
          sortBy: "rating",
          limit: 15,
        },
        movies: similarMovies.map(m => ({
          _id: m._id.toString(),
          slug: m.slug,
          movieTitle: m.movieTitle,
          releaseYear: m.releaseYear,
          coverImage: m.coverImage,
          backdropImage: m.backdropImage,
          rating: m.rating,
          genres: m.genres,
          summary: m.summary,
        })),
        seo: {
          metaTitle: `${template.title} - FilmyFire Intelligence`,
          metaDescription: description.substring(0, 160),
          keywords: [movie.movieTitle.toLowerCase(), "similar movies", "recommendations", ...movie.genres.map(g => g.toLowerCase())],
          ogImage: similarMovies[0]?.backdropImage,
        },
        faq: [
          {
            question: `What movies are similar to ${movie.movieTitle}?`,
            answer: `If you enjoyed ${movie.movieTitle}, you'll love ${similarMovies.slice(0, 3).map(m => m.movieTitle).join(", ")}. These films share similar themes, genres, and cinematic styles.`
          },
          {
            question: `Why should I watch movies like ${movie.movieTitle}?`,
            answer: `Fans of ${movie.movieTitle} appreciate its ${movie.genres.join(", ").toLowerCase()} elements. Our recommendations capture that same essence while offering fresh storylines and experiences.`
          }
        ],
        status: "published",
        isAutoGenerated: true,
        lastRefreshed: new Date(),
      };
      
      await DiscoveryPage.findOneAndUpdate(
        { slug: template.slug },
        pageData,
        { upsert: true, new: true }
      );
      
      console.log(`✅ Generated: ${template.slug}`);
      successCount++;
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return { successCount, total: topMovies.length };
    
  } catch (error) {
    console.error("Error generating Movies Like pages:", error);
    return { successCount: 0, total: 0 };
  }
}
