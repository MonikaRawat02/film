import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Share2, Clock, User, 
  Calendar, DollarSign, Users, Play, Award,
  Check, Download, ExternalLink, ChevronRight, Eye, Briefcase
} from "lucide-react";

// Utility function to extract complete sentences without cutting mid-word
function getCompleteSentence(text, maxLength = 300) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  // Find the last sentence boundary (., !, ?) before maxLength
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  // Get the furthest sentence boundary
  const lastBoundary = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  // If we found a sentence boundary, use it; otherwise find last space
  if (lastBoundary > maxLength * 0.5) {
    return text.substring(0, lastBoundary + 1);
  }
  
  // Fallback: find last space to avoid cutting mid-word
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? text.substring(0, lastSpace) + '...' : truncated + '...';
}

export async function getServerSideProps(context) {
  const { category, slug } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/get-by-slug?slug=${slug}`);
    
    if (!res.ok) {
      console.error(`API returned ${res.status} for ${slug}`);
      return { notFound: true };
    }

    const data = await res.json();

    if (!data || !data.data) {
      return { notFound: true };
    }

    const article = data.data;

    // Fetch dynamic recommendations based on User Score (Rating) from the same category
    let dynamicRecommendations = [];
    try {
      // Use includeDrafts=true and case-insensitive category (handled by API now)
      const recRes = await fetch(`${baseUrl}/api/articles/list?category=${category}&limit=20&includeDrafts=true`);
      const recData = await recRes.json();
      
      if (recData.success && recData.data && recData.data.length > 0) {
        // Filter out current article and sort by rating
        dynamicRecommendations = recData.data
          .filter(a => a.slug !== slug)
          .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
          .slice(0, 8);
      }
      
      // Global fallback: If category is empty, fetch ANY high-rated movies
      if (dynamicRecommendations.length === 0) {
        const globalRes = await fetch(`${baseUrl}/api/articles/list?limit=10&includeDrafts=true`);
        const globalData = await globalRes.json();
        if (globalData.success && globalData.data) {
          dynamicRecommendations = globalData.data
            .filter(a => a.slug !== slug)
            .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
            .slice(0, 8);
        }
      }
    } catch (err) {
      console.error("Error fetching dynamic recommendations:", err);
    }

    let pageType = "overview";
    let contentKey = "pSEO_Content_overview";
    let seoKey = "overview";

    if (slug.endsWith("-explained") || slug.endsWith("-ending-explained")) {
      pageType = "ending-explained";
      contentKey = "pSEO_Content_ending_explained";
      seoKey = "endingExplained";
    } else if (slug.endsWith("-box-office")) {
      pageType = "box-office";
      contentKey = "pSEO_Content_box_office";
      seoKey = "boxOffice";
    } else if (slug.endsWith("-budget")) {
      pageType = "budget";
      contentKey = "pSEO_Content_budget";
      seoKey = "budget";
    } else if (slug.endsWith("-ott") || slug.endsWith("-ott-release")) {
      pageType = "ott-release";
      contentKey = "pSEO_Content_ott_release";
      seoKey = "ottRelease";
    } else if (slug.endsWith("-cast")) {
      pageType = "cast";
      contentKey = "pSEO_Content_cast";
      seoKey = "cast";
    } else if (slug.endsWith("-reviews") || slug.endsWith("-review-analysis")) {
      pageType = "review-analysis";
      contentKey = "pSEO_Content_review_analysis";
      seoKey = "reviewAnalysis";
    } else if (slug.endsWith("-hit-or-flop")) {
      pageType = "hit-or-flop";
      contentKey = "pSEO_Content_hit_or_flop";
      seoKey = "hitOrFlop";
    }

    let sections = [];

    // 1. Try to get specific content for the current page type
    if (article[contentKey] && article[contentKey].length > 0) {
      sections = article[contentKey];
    }
    // 2. If not, try a keyword-based search on the main sections array
    else if (article.sections && article.sections.length > 0) {
      const searchKeywords = {
        "overview": ["plot", "synopsis", "story"],
        "ending-explained": ["ending", "climax", "plot", "story", "synopsis"],
        "box-office": ["box office", "commercial", "budget", "collection", "reception"],
        "budget": ["production", "budget", "cost", "filming"],
        "ott-release": ["release", "distribution", "streaming", "digital", "television"],
        "cast": ["cast", "starring", "characters", "personnel"],
        "review-analysis": ["reception", "critical", "review", "consensus", "response"],
        "hit-or-flop": ["verdict", "box office", "reception", "collection"]
      };

      const keywords = searchKeywords[pageType] || [];
      const relevantSections = article.sections.filter(s => 
        keywords.some(k => s.heading.toLowerCase().includes(k))
      );

      if (relevantSections.length > 0) {
        sections = relevantSections;
      }
    }

    // 3. Special Case for Cast: if still empty, build from structured data
    if (pageType === "cast" && sections.length === 0 && article.cast && article.cast.length > 0) {
      sections.push({
        heading: "Lead Cast & Characters",
        content: article.cast.map(c => `${c.name} ${c.role ? `as ${c.role}` : ""}`).join("\n\n"),
        isStructuredCast: true
      });
    }

    // 4. Global Fallback: If STILL empty, use ALL available sections from the main article.
    // This ensures no page is ever blank if any content was scraped at all.
    if (sections.length === 0) {
      sections = article.sections || [];
    }

    // Get SEO metadata for this specific page type
    const seo = article.subPagesSEO?.[seoKey] || {
      title: `${article.movieTitle || article.title} (${article.releaseYear || ''}) – ${pageType.replace("-", " ")}`,
      description: article.summary,
      faq: article.meta?.faq || []
    };

    return {
      props: {
        article,
        sections,
        seo,
        category,
        pageType,
        slug,
        dynamicRecommendations
      },
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return { notFound: true };
  }
}

export default function ArticleDetailPage({ article, sections, seo, category, pageType, slug, dynamicRecommendations = [] }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [readingTime, setReadingTime] = useState(5);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const movieTitle = article.movieTitle || article.title;

  // Map category slug to actual page URL
  const categoryUrlMap = {
    'boxoffice': '/category/box-office',
    'bollywood': '/category/bollywood',
    'hollywood': '/category/hollywood',
    'webseries': '/category/webseries',
    'ott': '/category/ott',
    'celebrity': '/category/celebrity'
  };
  const categoryPageUrl = categoryUrlMap[category.toLowerCase()] || `/category/${category.toLowerCase()}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      setIsLiked(likedArticles.includes(article?._id));
      setIsSaved(savedArticles.includes(article?._id));
      
      const content = sections?.map(s => s.content).join(" ") || "";
      const words = content.split(/\s+/).length;
      setReadingTime(Math.max(1, Math.ceil(words / 200)));
    }
  }, [article?._id, sections]);

  if (!article) return null;

  const quickLinks = [
    { label: "Overview", slug: article.slug, active: pageType === "overview" },
    { label: "Ending", slug: `${article.slug}-explained`, active: pageType === "ending-explained" },
    { label: "Box Office", slug: `${article.slug}-box-office`, active: pageType === "box-office" },
    { label: "Budget", slug: `${article.slug}-budget`, active: pageType === "budget" },
    { label: "OTT", slug: `${article.slug}-ott`, active: pageType === "ott-release" },
    { label: "Cast", slug: `${article.slug}-cast`, active: pageType === "cast" },
    { label: "Reviews", slug: `${article.slug}-reviews`, active: pageType === "review-analysis" },
    { label: "Verdict", slug: `${article.slug}-hit-or-flop`, active: pageType === "hit-or-flop" },
  ];

  const structuredSchema = {
    "@context": "https://schema.org",
    "@graph": [
      // 1. Breadcrumb Schema
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://filmyfire.com" },
          { "@type": "ListItem", "position": 2, "name": category, "item": `https://filmyfire.com/category/${category.toLowerCase()}` },
          { "@type": "ListItem", "position": 3, "name": article.movieTitle || article.title, "item": `https://filmyfire.com/category/${category.toLowerCase()}/${article.slug}` }
        ]
      },
      // 2. Primary Content Schema
      pageType === "overview" ? {
        "@type": "Movie",
        "name": article.movieTitle || article.title,
        "datePublished": article.releaseYear,
        "image": article.coverImage,
        "description": article.summary,
        "director": article.director?.map(d => ({ "@type": "Person", "name": d })),
        "actor": article.cast?.map(c => ({ "@type": "Person", "name": c.name })),
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "1250"
        }
      } : {
        "@type": "BlogPosting",
        "headline": seo.title,
        "description": seo.description || article.summary,
        "image": article.coverImage,
        "datePublished": article.publishedAt || article.createdAt,
        "author": { "@type": "Organization", "name": "FilmyFire Intelligence" }
      },
      // 3. FAQ Schema
      seo.faq && seo.faq.length > 0 ? {
        "@type": "FAQPage",
        "mainEntity": seo.faq.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": { "@type": "Answer", "content": f.answer }
        }))
      } : null
    ].filter(Boolean)
  };

  return (
    <>
      <Head>
        <title>{seo.title} | FilmyFire Intelligence</title>
        <meta name="description" content={seo.description || article.summary} />
        <link rel="canonical" href={`https://filmyfire.com/category/${category.toLowerCase()}/${slug}`} />
        
        {/* Automated Intelligence Schema (Task 7) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
        
        {/* Modern Minimalist Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
            <Link 
              href={`/category/${category.toLowerCase()}`}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explore {category}</span>
            </Link>
            
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-80">
                {article.movieTitle || article.title} – {pageType.replace("-", " ")}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Share and Save hidden as requested */}
            </div>
          </div>
        </header>

        <main className="pb-32">
          
          {/* TMDB-Style Hero Section */}
          <section className="relative w-full min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden mb-12">
            {/* Backdrop Image with Overlay */}
            <div className="absolute inset-0 z-0">
              {article.backdropImage ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                  style={{ backgroundImage: `url(${article.backdropImage})` }}
                >
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 items-center md:items-start">
              {/* Poster Card */}
              <div className="w-[300px] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                {article.coverImage ? (
                  <img 
                    src={article.coverImage} 
                    alt={article.movieTitle || article.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="aspect-[2/3] bg-zinc-800 flex items-center justify-center text-zinc-600 font-black uppercase tracking-widest">No Poster</div>
                )}
              </div>

              {/* Movie Details */}
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2 tracking-tighter">
                  {article.movieTitle || article.title} <span className="text-zinc-500 font-light">({article.releaseYear})</span>
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-zinc-300 mb-8 font-medium">
                  {article.certification && (
                    <span className="px-1.5 py-0.5 border border-zinc-500 rounded text-[10px] text-zinc-400 uppercase">{article.certification}</span>
                  )}
                  <span>{article.releaseDate || article.releaseYear}</span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span>{article.genres?.join(", ")}</span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span>{article.runtime || "N/A"}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 mb-10">
                  {/* User Score Circle */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-full bg-zinc-900 border-4 border-emerald-500 flex items-center justify-center shadow-lg">
                      <span className="text-lg font-black text-white">
                        {article.rating ? (
                          <>
                            {(parseFloat(article.rating) * 10).toFixed(0)}
                            <span className="text-[10px] font-bold">%</span>
                          </>
                        ) : (
                          "NR"
                        )}
                      </span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white leading-none">User<br/>Score</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Sidebar - Navigation & Quick Stats */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* OVERVIEW: Movie Details Card */}
              {pageType === "overview" && (
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Film className="w-3.5 h-3.5 text-white" />
                    </div>
                    Movie Details
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Director", value: article.director?.[0] || "N/A" },
                      { label: "Producer", value: article.producer?.[0] || "N/A" },
                      { label: "Writer", value: article.writer?.[0] || "N/A" },
                      { label: "Genre", value: article.genres?.[0] || "N/A" },
                      { label: "Runtime", value: article.runtime || "TBA" },
                      { label: "Release", value: article.releaseDate || article.releaseYear || "TBA" },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">{stat.label}</span>
                        <span className="text-xs font-semibold text-white text-right">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CAST: Cast Stats Card */}
              {pageType === "cast" && (
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-white" />
                    </div>
                    Cast Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-[10px] text-gray-500 uppercase">Total Cast</span>
                      <span className="text-xs font-bold text-white">{article.cast?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-[10px] text-gray-500 uppercase">Director</span>
                      <span className="text-xs font-bold text-white">{article.director?.[0] || "N/A"}</span>
                    </div>
                    {article.crew && article.crew.length > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-gray-500 uppercase">Crew</span>
                        <span className="text-xs font-bold text-white">{article.crew.length}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* BOX OFFICE: Box Office Stats Card */}
              {pageType === "box-office" && (
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-800/50 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    </div>
                    Box Office Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-green-900/50">
                      <span className="text-[10px] text-gray-400 uppercase">Worldwide</span>
                      <span className="text-sm font-bold text-green-400">{article.boxOffice?.worldwide || article.stats?.worldwide || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-900/50">
                      <span className="text-[10px] text-gray-400 uppercase">India Net</span>
                      <span className="text-sm font-bold text-white">{article.boxOffice?.india || article.stats?.indiaNet || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[10px] text-gray-400 uppercase">Verdict</span>
                      <span className={`text-xs font-bold ${article.boxOffice?.verdict?.toLowerCase().includes('hit') ? 'text-green-400' : 'text-yellow-400'}`}>
                        {article.boxOffice?.verdict || article.stats?.verdict || "TBA"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* BUDGET: Budget Stats Card */}
              {pageType === "budget" && (
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-800/50 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5 text-white" />
                    </div>
                    Budget Analysis
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-900/50">
                      <span className="text-[10px] text-gray-400 uppercase">Budget</span>
                      <span className="text-sm font-bold text-blue-400">{article.budget || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-900/50">
                      <span className="text-[10px] text-gray-400 uppercase">Collection</span>
                      <span className="text-sm font-bold text-white">{article.stats?.worldwide || "N/A"}</span>
                    </div>
                    {article.budget && article.stats?.worldwide && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-gray-400 uppercase">ROI</span>
                        <span className="text-xs font-bold text-green-400">
                          {((parseInt(article.stats.worldwide) / parseInt(article.budget) - 1) * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ENDING EXPLAINED: Summary Card */}
              {pageType === "ending-explained" && (
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    Ending Summary
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {article.summary ? getCompleteSentence(article.summary, 250) : "Explore the complete ending explanation and hidden meanings of " + movieTitle + "."}
                  </p>
                </motion.div>
              )}

              {/* REVIEWS: Reviews Summary Card */}
              {pageType === "review-analysis" && (
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-white" />
                    </div>
                    Review Summary
                  </h3>
                  <div className="space-y-3">
                    {article.rating && (
                      <div className="flex items-center gap-2 py-2 border-b border-gray-800">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-lg font-bold text-white">{article.rating}/10</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {article.criticalResponse ? getCompleteSentence(article.criticalResponse, 150) : "Critical reviews and audience reactions analysis."}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* OTT RELEASE: OTT Info Card */}
              {pageType === "ott-release" && (
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Tv className="w-3.5 h-3.5 text-white" />
                    </div>
                    Streaming Info
                  </h3>
                  <div className="space-y-3">
                    {article.ott?.platform && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase">Platform</span>
                        <span className="text-xs font-bold text-purple-400">{article.ott.platform}</span>
                      </div>
                    )}
                    {article.ott?.releaseDate && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-gray-500 uppercase">Release Date</span>
                        <span className="text-xs font-bold text-white">{article.ott.releaseDate}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Quick Navigation - Always Visible */}
              <motion.div 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <List className="w-3.5 h-3.5 text-white" />
                  </div>
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Overview", suffix: "", icon: Info },
                    { label: "Ending", suffix: "-ending-explained", icon: Zap },
                    { label: "Box Office", suffix: "-box-office", icon: TrendingUp },
                    { label: "Budget", suffix: "-budget", icon: DollarSign },
                    { label: "Cast", suffix: "-cast", icon: Users },
                    { label: "Reviews", suffix: "-review-analysis", icon: Star },
                    { label: "Verdict", suffix: "-hit-or-flop", icon: ShieldCheck },
                    { label: "OTT", suffix: "-ott-release", icon: Tv },
                    { label: "Genre", suffix: "-genre-analysis", icon: BookOpen },
                  ].map((link, idx) => {
                    const IconComponent = link.icon;
                    const isActive = (pageType === "overview" && link.suffix === "") || (pageType !== "overview" && link.suffix === `-${pageType}`);
                    return (
                      <motion.div key={idx} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link 
                          href={`/category/${category.toLowerCase()}/${article.slug}${link.suffix}`}
                          className={`block p-2.5 rounded-lg text-center transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md" 
                              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-[10px] font-semibold block">{link.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right Side - Page-Specific Content */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* OVERVIEW: Show About section with Expand/Collapse */}
              {pageType === "overview" && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                      <Info className="w-3.5 h-3.5 text-white" />
                    </div>
                    About {movieTitle}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {article.summary || `${movieTitle} is a ${article.genres?.join("/")} film released in ${article.releaseYear}. Directed by ${article.director?.join(", ") || 'N/A'}, the film stars ${article.cast?.slice(0, 3).map(c => c.name).join(", ") || 'N/A'}.`}
                  </p>
                  {article.tagline && (
                    <p className="text-xs text-gray-500 italic mt-3">"{article.tagline}"</p>
                  )}
                  
                  {/* Expandable Sections */}
                  {sections && sections.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                      >
                        {showFullAnalysis ? 'Show Less' : 'Read Full Analysis'} 
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${showFullAnalysis ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {showFullAnalysis && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-3 pt-4 border-t border-gray-700"
                        >
                          {sections.map((section, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                              <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                              <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 250)}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Key Crew - Show on overview and cast pages */}
              {(pageType === "overview" || pageType === "cast") && (article.director?.length > 0 || article.producer?.length > 0 || article.writer?.length > 0) && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                      <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                    Key Crew
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(() => {
                      const seen = new Set();
                      const uniqueCrew = [];
                      
                      article.director?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) {
                          seen.add(name.toLowerCase());
                          uniqueCrew.push({ name, role: 'Director' });
                        }
                      });
                      
                      article.producer?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) {
                          seen.add(name.toLowerCase());
                          uniqueCrew.push({ name, role: 'Producer' });
                        }
                      });
                      
                      article.writer?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) {
                          seen.add(name.toLowerCase());
                          uniqueCrew.push({ name, role: 'Writer' });
                        }
                      });
                      
                      return uniqueCrew.slice(0, 6).map((member, idx) => (
                        <Link key={idx} href={`/celebrity/${slugify(member.name)}`} className="group">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-yellow-500/50 transition-all">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600/30 to-orange-600/30 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-white truncate group-hover:text-yellow-400 transition-colors">{member.name}</p>
                              <p className="text-[9px] text-gray-500 truncate">{member.role}</p>
                            </div>
                          </div>
                        </Link>
                      ));
                    })()}
                  </div>
                </motion.div>
              )}

              {/* Tags */}
              {pageType === "overview" && article.tags && article.tags.length > 0 && (
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-red-500" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Cast Highlight Cards - Only for overview */}
              {pageType === "overview" && article.cast && article.cast.length > 0 && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-white" />
                    </div>
                    Cast Highlights
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {article.cast.slice(0, 6).map((actor, idx) => (
                      <Link key={idx} href={`/celebrity/${slugify(actor.name)}`} className="group">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-pink-500/50 transition-all">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600/30 to-purple-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {actor.profileImage ? (
                              <img src={actor.profileImage} alt={actor.name} className="w-full h-full object-cover" />
                            ) : actor.image ? (
                              <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-white truncate group-hover:text-pink-400 transition-colors">{actor.name}</p>
                            <p className="text-[9px] text-gray-500 truncate">{actor.role || "Actor"}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CAST: Cast Overview */}
              {pageType === "cast" && article.cast && article.cast.length > 0 && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-white" />
                    </div>
                    Complete Cast
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">Total cast members: {article.cast.length}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {article.cast.slice(0, 6).map((actor, idx) => (
                      <Link key={idx} href={`/celebrity/${slugify(actor.name)}`} className="group">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-pink-500/50 transition-all">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600/30 to-purple-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {actor.profileImage ? (
                              <img src={actor.profileImage} alt={actor.name} className="w-full h-full object-cover" />
                            ) : actor.image ? (
                              <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-white truncate group-hover:text-pink-400 transition-colors">{actor.name}</p>
                            <p className="text-[9px] text-gray-500 truncate">{actor.role || "Actor"}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Show additional sections from API */}
                  {sections && sections.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-800">
                      <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Cast Details</p>
                      {sections.slice(0, 3).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* BOX OFFICE: Box Office Overview */}
              {pageType === "box-office" && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-800/50 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    </div>
                    Box Office Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-[9px] text-gray-400 uppercase mb-1">Worldwide</p>
                      <p className="text-xl font-bold text-green-400">{article.boxOffice?.worldwide || article.stats?.worldwide || "N/A"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-[9px] text-gray-400 uppercase mb-1">India Net</p>
                      <p className="text-xl font-bold text-white">{article.boxOffice?.india || article.stats?.indiaNet || "N/A"}</p>
                    </div>
                  </div>
                  
                  {/* Show additional sections from API */}
                  {sections && sections.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-green-800/30">
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Key Insights</p>
                      {sections.slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* BUDGET: Budget Overview */}
              {pageType === "budget" && article.budget && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-800/50 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5 text-white" />
                    </div>
                    Budget & Investment
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-[9px] text-gray-400 uppercase mb-1">Budget</p>
                      <p className="text-xl font-bold text-blue-400">{article.budget || "N/A"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-[9px] text-gray-400 uppercase mb-1">Collection</p>
                      <p className="text-xl font-bold text-white">{article.stats?.worldwide || "N/A"}</p>
                    </div>
                  </div>
                  
                  {/* Show additional sections from API */}
                  {sections && sections.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-blue-800/30">
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Budget Analysis</p>
                      {sections.slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ENDING EXPLAINED: Overview - Use SEO Content */}
              {pageType === "ending-explained" && sections && sections.length > 0 && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    Ending Explained
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {getCompleteSentence(sections[0]?.content, 400) || article.summary}
                  </p>
                  
                  {/* Show additional sections from API */}
                  {sections.length > 1 && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Key Sections</p>
                      {sections.slice(1, 5).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* REVIEWS: Reviews Overview - Use SEO Content */}
              {pageType === "review-analysis" && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-white" />
                    </div>
                    Critical Reviews
                  </h3>
                  {article.rating && (
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold text-white">{article.rating}/10</span>
                    </div>
                  )}
                  {sections[0]?.content ? (
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      {getCompleteSentence(sections[0].content, 400)}
                    </p>
                  ) : article.criticalResponse && (
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      {getCompleteSentence(article.criticalResponse, 400)}
                    </p>
                  )}
                  
                  {/* Show additional sections from API */}
                  {sections && sections.length > 1 && (
                    <div className="space-y-3 pt-4 border-t border-gray-800">
                      <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Review Breakdown</p>
                      {sections.slice(1, 5).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* OTT RELEASE: Overview */}
              {pageType === "ott-release" && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Tv className="w-3.5 h-3.5 text-white" />
                    </div>
                    Streaming Information
                  </h3>
                  <div className="space-y-3 mb-4">
                    {article.ott?.platform && (
                      <div className="flex items-center gap-3">
                        <Play className="w-5 h-5 text-red-500" />
                        <span className="text-white font-semibold">{article.ott.platform}</span>
                      </div>
                    )}
                    {article.ott?.releaseDate && (
                      <p className="text-sm text-gray-400">Released: {article.ott.releaseDate}</p>
                    )}
                  </div>
                  
                  {/* Show additional sections from API */}
                  {sections && sections.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-800">
                      <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">OTT Details</p>
                      {sections.slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* HIT OR FLOP: Verdict Overview */}
              {pageType === "hit-or-flop" && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                    Hit or Flop Verdict
                  </h3>
                  
                  {/* Verdict Badge */}
                  {article.stats?.verdict && (
                    <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 text-center">
                      <p className="text-[10px] text-red-400 uppercase mb-2">Overall Verdict</p>
                      <p className="text-2xl font-black text-white uppercase">{article.stats.verdict}</p>
                    </div>
                  )}
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-[9px] text-gray-400 uppercase mb-1">Budget</p>
                      <p className="text-lg font-bold text-white">{article.budget || "N/A"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-[9px] text-gray-400 uppercase mb-1">Collection</p>
                      <p className="text-lg font-bold text-white">{article.stats?.worldwide || "N/A"}</p>
                    </div>
                  </div>
                  
                  {/* Show additional sections from API */}
                  {sections && sections.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-800">
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Verdict Analysis</p>
                      {sections.slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
          
            </div>
          </div>

          {/* Page-Specific Content Sections */}
          {pageType === "overview" && (
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Render all sections from pSEO_Content_overview */}
              {article.pSEO_Content_overview?.map((section, idx) => {
                // Skip FAQ section - we'll render it separately
                if (section.heading?.toLowerCase().includes('faq')) {
                  return null;
                }
                
                const cleanedContent = cleanContent(section.content);
                if (!cleanedContent) return null;
                
                // Determine icon based on heading
                const heading = section.heading?.toLowerCase() || '';
                let Icon = Info;
                let iconColor = "text-red-500";
                
                if (heading.includes('introduction') || heading.includes('overview')) {
                  Icon = Info;
                } else if (heading.includes('plot')) {
                  Icon = BookOpen;
                } else if (heading.includes('ending') || heading.includes('explained')) {
                  Icon = Zap;
                } else if (heading.includes('box office') || heading.includes('collection')) {
                  Icon = TrendingUp;
                  iconColor = "text-green-500";
                } else if (heading.includes('budget') || heading.includes('profit')) {
                  Icon = DollarSign;
                  iconColor = "text-blue-500";
                } else if (heading.includes('ott') || heading.includes('release') || heading.includes('streaming')) {
                  Icon = Tv;
                  iconColor = "text-purple-500";
                } else if (heading.includes('cast') || heading.includes('character')) {
                  Icon = Users;
                  iconColor = "text-pink-500";
                } else if (heading.includes('audience') || heading.includes('reaction') || heading.includes('review')) {
                  Icon = Heart;
                  iconColor = "text-orange-500";
                } else if (heading.includes('director')) {
                  Icon = Film;
                } else if (heading.includes('genre')) {
                  Icon = Tag;
                } else {
                  Icon = FileText;
                }
                
                return (
                  <motion.div 
                    key={section._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="p-6 md:p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                      {section.heading}
                    </h2>
                    <div className="space-y-4">
                      {cleanedContent.split(/\n\n/).filter(p => p.trim()).map((para, pIdx) => (
                        <p key={pIdx} className="text-gray-400 leading-relaxed text-sm md:text-base">
                          {para}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
              
              {/* FAQ Section from pSEO_Content_overview */}
              {(() => {
                const faqSection = article.pSEO_Content_overview?.find(s => 
                  s.heading?.toLowerCase().includes('faq')
                );
                if (!faqSection) return null;
                
                const overviewFaqs = parseFAQsFromContent(faqSection.content);
                if (overviewFaqs.length === 0) return null;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="pt-8"
                  >
                    {/* FAQ Header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg shadow-red-900/30">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </span>
                        Frequently Asked Questions
                      </h2>
                      <span className="text-xs font-medium text-gray-400 bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700">{overviewFaqs.length} questions</span>
                    </div>
                    
                    {/* FAQ Container Card */}
                    <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#1a1a2e]/40 to-[#1a1a2e]/20 p-6 backdrop-blur-sm">
                      <div className="space-y-3">
                        {overviewFaqs.map((faq, i) => (
                          <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </motion.section>
          )}

          {/* Box Office Page - Rich Stats */}
          {pageType === "box-office" && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-red-600" /> Box Office Collection Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Worldwide Collection</p>
                  <p className="text-3xl font-black text-white">{article.boxOffice?.worldwide || article.stats?.worldwide || "TBA"}</p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">India Net Collection</p>
                  <p className="text-3xl font-black text-white">{article.boxOffice?.india || article.stats?.indiaNet || "TBA"}</p>
                </div>
              </div>
              {article.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Opening Day", value: article.stats?.openingDay, color: "purple" },
                    { label: "Opening Weekend", value: article.stats?.openingWeekend, color: "orange" },
                    { label: "First Week", value: article.stats?.firstWeek, color: "blue" },
                    { label: "Overseas", value: article.stats?.overseas, color: "cyan" }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                      <p className="text-[10px] text-gray-400 uppercase mb-1">{stat.label}</p>
                      <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value || "N/A"}</p>
                    </div>
                  ))}
                </div>
              )}
              {article.stats?.verdict && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Box Office Verdict</h4>
                  <div className="text-center py-4">
                    <span className="text-2xl font-black text-red-400 uppercase tracking-widest">{article.stats.verdict}</span>
                  </div>
                </div>
              )}
              <p className="text-zinc-400 leading-relaxed mt-6">
                The box office performance of {article.movieTitle} has been a major talking point in the industry. 
                With a global reach and strong domestic interest, the numbers reflect the audience's massive reaction to this cinematic intelligence.
              </p>
            </section>
          )}

          {/* Cast Page - Rich Cast Grid */}
          {pageType === "cast" && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-red-600" /> Cast & Character Intel
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                {article.cast?.map((actor, idx) => (
                  <Link key={idx} href={`/celebrity/${slugify(actor.name)}`} className="group">
                    <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-red-500/30 transition-all flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600/30 to-purple-600/30 border border-gray-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                        {actor.profileImage ? (
                          <img src={actor.profileImage} alt={actor.name} className="w-full h-full object-cover" />
                        ) : actor.image ? (
                          <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                      <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-red-400 transition-colors">{actor.name}</p>
                      {actor.role && <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest line-clamp-1">{actor.role}</p>}
                    </div>
                  </Link>
                ))}
              </div>
              {article.crew && article.crew.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <Briefcase className="w-5 h-5" /> Technical Personnel & Crew
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {article.crew.map((member, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center mb-4 overflow-hidden">
                          {member.profileImage ? (
                            <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <p className="font-bold text-white text-sm line-clamp-1">{member.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest line-clamp-1">{member.job || member.department}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cast FAQs Section - Extract from pSEO_Content_cast */}
              {(() => {
                const castFaqs = extractFAQsFromSections(article.pSEO_Content_cast);
                if (castFaqs.length === 0) return null;
                return (
                  <div className="mt-12 pt-8 border-t border-gray-800">
                    {/* FAQ Header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg shadow-red-900/30">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </span>
                        Frequently Asked Questions
                      </h3>
                      <span className="text-xs font-medium text-gray-400 bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700">{castFaqs.length} questions</span>
                    </div>
                    
                    {/* FAQ Container Card */}
                    <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#1a1a2e]/40 to-[#1a1a2e]/20 p-6 backdrop-blur-sm">
                      <div className="space-y-3">
                        {castFaqs.map((faq, i) => (
                          <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          {/* Internal Linking Backbone */}
          <section className="mt-40 pt-20 border-t border-white/10">
              <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-4">
                  <ExternalLink className="w-4 h-4" />
                  Intelligence Connections
                </h3>
                <div className="px-4 py-2 rounded-lg border border-dashed border-orange-500/30 bg-orange-500/5">
                  <p className="text-[10px] font-bold text-orange-300/80 uppercase tracking-widest">
                    Automated Updates: This section updates daily via API integration - SEO URL: /{category.toLowerCase()}/movies/{article.slug}
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-green-900/20 border border-green-700/30">
                  <p className="text-xs text-green-400 uppercase tracking-widest mb-1">Worldwide Collection</p>
                  <p className="text-3xl font-black text-white">{article.boxOffice?.worldwide || article.stats?.worldwide || "TBA"}</p>
                </div>
              </div>
              {article.budget && article.stats?.worldwide && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                    <p className="text-2xl font-bold text-white">{(parseInt(article.stats.worldwide) / parseInt(article.budget)).toFixed(1)}x</p>
                    <p className="text-xs text-gray-400 mt-1">Return on Investment</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                    <p className="text-2xl font-bold text-green-400">{((parseInt(article.stats.worldwide) / parseInt(article.budget) - 1) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-gray-400 mt-1">Profit Margin</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                    <p className="text-2xl font-bold text-white">{parseInt(article.stats.worldwide) - parseInt(article.budget) > 0 ? 'Profit' : 'Loss'}</p>
                    <p className="text-xs text-gray-400 mt-1">Financial Result</p>
                  </div>
                </div>
              )}
              <p className="text-zinc-400 leading-relaxed">
                The production budget of {article.movieTitle} reflects the film's scale and ambition. 
                With strategic investments in cast, VFX, and marketing, the film aimed for maximum impact across global markets.
              </p>
            </section>

          {/* Hit or Flop Verdict Page */}
          {pageType === "hit-or-flop" && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-red-600" /> Hit or Flop Verdict
              </h2>
              
              {/* Verdict Badge */}
              {article.stats?.verdict && (
                <div className="mb-8">
                  <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/40">
                    <ShieldCheck className="w-8 h-8 text-red-400" />
                    <div>
                      <p className="text-xs text-red-400 uppercase tracking-widest mb-1">Overall Verdict</p>
                      <p className="text-3xl font-black text-white uppercase">{article.stats.verdict}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Box Office Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-green-900/20 border border-green-700/30">
                  <p className="text-xs text-green-400 uppercase tracking-widest mb-1">Box Office Collection</p>
                  <p className="text-3xl font-black text-white">{article.boxOffice?.worldwide || article.stats?.worldwide || "N/A"}</p>
                </div>
                <div className="p-6 rounded-2xl bg-blue-900/20 border border-blue-700/30">
                  <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Production Budget</p>
                  <p className="text-3xl font-black text-white">{article.budget || "N/A"}</p>
                </div>
              </div>
              
              <p className="text-zinc-400 leading-relaxed mb-8">
                The commercial performance of {article.movieTitle} has been analyzed based on its box office collection, 
                budget recovery, and audience reception. This verdict reflects the film's success in the competitive market.
              </p>
            </section>
          )}

          {/* Generic Content Sections - Sub-pages only */}
          {sections && sections.length > 0 && pageType !== "cast" && pageType !== "overview" && (
            <div id="overview-section" className="space-y-12 mt-12">
              {sections.map((section, idx) => {
                // Check if this section is a Q&A formatted section (FAQ or numbered questions)
                const sectionFaqs = extractFAQsFromSections([section]);
                const isQASection = sectionFaqs.length > 0 && (
                  section.heading?.toLowerCase().includes('faq') || 
                  section.heading?.toLowerCase().includes('question') ||
                  section.content?.includes('**Q') || 
                  section.content?.includes('Q1:') ||
                  /^\s*\d+\.\s+\*\*/.test(section.content) // Starts with "1. **"
                );
                
                return (
                <motion.section
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                >
                  {isQASection && sectionFaqs.length > 0 ? (
                    <>
                      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </span>
                        {section.heading}
                      </h2>
                      <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#1a1a2e]/40 to-[#1a1a2e]/20 p-6 backdrop-blur-sm">
                        <div className="space-y-3">
                          {sectionFaqs.map((faq, i) => (
                            <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-black text-white mb-6">{section.heading}</h2>
                      <div className="space-y-8">
                        {section.content.split('\n\n').map((para, i) => (
                          <p key={i} className="text-lg text-gray-400 leading-relaxed">{para}</p>
                        ))}
                      </div>
                    </>
                  )}
                </motion.section>
              );
              })}
            </div>
          )}

          {/* Recommendations Section */}
          <div className="mt-20 pt-12 border-t border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Target className="w-6 h-6 text-red-500" /> Explore More
            </h2>
            
            {/* Recommendations with Desktop Arrows */}
            {(dynamicRecommendations && dynamicRecommendations.length > 0) || (article.recommendations && article.recommendations.length > 0) ? (
              <div className="relative group/recommendations">
                {/* Left Arrow - Desktop Only */}
                <button
                  onClick={() => {
                    const container = document.getElementById('recommendations-scroll');
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 items-center justify-center text-white opacity-0 group-hover/recommendations:opacity-100 transition-all duration-300 hover:bg-gray-800/80 hover:border-red-500/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Right Arrow - Desktop Only */}
                <button
                  onClick={() => {
                    const container = document.getElementById('recommendations-scroll');
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 items-center justify-center text-white opacity-0 group-hover/recommendations:opacity-100 transition-all duration-300 hover:bg-gray-800/80 hover:border-red-500/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Scrollable Container */}
                {dynamicRecommendations && dynamicRecommendations.length > 0 ? (
                  <div id="recommendations-scroll" className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide">
                    {dynamicRecommendations.map((rec, i) => (
                      <Link key={i} href={`/category/${category.toLowerCase()}/${rec.slug}`} className="min-w-[180px] md:min-w-[220px] snap-start group/rec cursor-pointer">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-gray-700 group-hover/rec:border-red-500/30 transition-all shadow-lg">
                          {rec.backdropImage ? (
                            <img src={rec.backdropImage} alt={rec.movieTitle || rec.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/rec:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-700 font-black uppercase text-[10px] tracking-widest">No Image</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/rec:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white group-hover/rec:text-red-400 transition-colors line-clamp-1 flex-grow pr-4">{rec.movieTitle || rec.title}</h4>
                          <span className="text-sm font-black text-zinc-400">{rec.rating ? `${rec.rating}/10` : 'NR'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : article.recommendations && article.recommendations.length > 0 ? (
                  <div id="recommendations-scroll" className="flex gap-4 overflow-x-auto pb-8 snap-x scrollbar-hide">
                    {article.recommendations.map((rec, i) => (
                      <Link key={i} href={`/category/${category.toLowerCase()}/${rec.slug}`} className="min-w-[180px] md:min-w-[220px] snap-start group/rec cursor-pointer">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-gray-700 group-hover/rec:border-red-500/30 transition-all shadow-lg">
                          {rec.backdropImage ? (
                            <img src={rec.backdropImage} alt={rec.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/rec:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-700 font-black uppercase text-[10px] tracking-widest">No Image</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/rec:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white group-hover/rec:text-red-400 transition-colors line-clamp-1 flex-grow pr-4">{rec.title}</h4>
                          <span className="text-sm font-black text-zinc-400">{rec.rating ? `${rec.rating}/10` : 'NR'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-gray-700 rounded-3xl">
                    <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Awaiting Intelligence for {category} Database</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-gray-700 rounded-3xl">
                <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Awaiting Intelligence for {category} Database</p>
              </div>
            )}

          {/* FAQ Section */}
          {seo.faq && seo.faq.length > 0 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="pt-16"
            >
              {/* FAQ Header */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg shadow-red-900/30">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </span>
                  Frequently Asked Questions
                </h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700">{seo.faq.length} questions</span>
              </div>
              
              {/* FAQ Container Card */}
              <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#1a1a2e]/40 to-[#1a1a2e]/20 p-6 backdrop-blur-sm">
                <div className="space-y-3">
                  {seo.faq.map((faq, i) => (
                    <div key={i} className="space-y-6">
                      <h4 className="text-2xl font-bold text-white flex gap-6">
                        <span className="text-blue-500 font-black">Q.</span> {faq.question}
                      </h4>
                      <p className="text-xl text-zinc-400 font-medium leading-relaxed pl-12 border-l border-white/10">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          </div>

        </main>
      </div>
    </>
  );
}

ArticleDetailPage.noPadding = true;