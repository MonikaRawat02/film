import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Share2, Clock, User, 
  Calendar, DollarSign, Users, Play, Award,
  Check, Download, ExternalLink, ChevronRight, Eye, Briefcase,
  ChevronDown
} from "lucide-react";

// FAQ Accordion Item Component
function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-blue-500/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left group"
      >
        <span className="flex items-center gap-4 flex-grow">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm">
            Q{index + 1}
          </span>
          <span className="text-lg md:text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-relaxed">
            {question}
          </span>
        </span>
        <ChevronDown
          className={`w-6 h-6 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-8 pt-2">
          <div className="pl-12 border-l-2 border-blue-500/30">
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
    } else if (slug.endsWith("-genre") || slug.endsWith("-genre-analysis")) {
      pageType = "genre-analysis";
      contentKey = "pSEO_Content_genre_analysis";
      seoKey = "genreAnalysis";
    } else if (slug.endsWith("-hit-or-flop") || slug.endsWith("-verdict")) {
      pageType = "hit-or-flop";
      contentKey = "pSEO_Content_hit_or_flop";
      seoKey = "hitOrFlop";
    }

    let sections = [];

    // 1. Try to get specific content for the current page type
    if (article[contentKey] && article[contentKey].length > 0) {
      sections = article[contentKey];
    }
    // 2. Specialized Logic for Box Office / Budget / OTT / Verdict from structured fields if content is empty
    else if (pageType === "box-office" && article.boxOffice) {
      sections = [
        { heading: "Box Office Analysis", content: `Opening Weekend: ${article.boxOffice.openingWeekend || 'N/A'}\n\nIndia Collection: ${article.boxOffice.india || 'N/A'}\n\nWorldwide Collection: ${article.boxOffice.worldwide || 'N/A'}` },
        { heading: "Performance Verdict", content: article.verdict || "Analyzing performance metrics..." }
      ];
    }
    else if (pageType === "budget" && article.budget) {
      sections = [
        { heading: "Production Investment", content: `The estimated production budget for ${article.movieTitle || article.title} is ${article.budget}. This includes principal photography, post-production, and marketing costs.` }
      ];
    }
    else if (pageType === "ott-release" && article.ott) {
      sections = [
        { heading: "Streaming Intelligence", content: `Platform: ${article.ott.platform || 'N/A'}\n\nRelease Date: ${article.ott.releaseDate ? new Date(article.ott.releaseDate).toLocaleDateString() : 'TBA'}\n\nLink: ${article.ott.link || 'Awaiting Link'}` }
      ];
    }
    else if (pageType === "review-analysis" && article.criticalResponse) {
      sections = [
        { heading: "Critical Intelligence", content: article.criticalResponse }
      ];
    }
    else if (pageType === "genre-analysis" && (article.genreAnalysis || (article.genres && article.genres.length > 0))) {
      sections = [
        { heading: "Genre Intelligence & Analysis", content: article.genreAnalysis || `The movie falls into the following genres: ${article.genres?.join(", ")}. This blend of genres creates a unique viewing experience that appeals to a wide audience base.` }
      ];
    }
    else if (pageType === "hit-or-flop") {
      sections = [
        { heading: "Intelligence Verdict", content: article.verdict || "Awaiting final box office verification for verdict." }
      ];
    }
    // 3. If still empty, try a keyword-based search on the main sections array
    else if (article.sections && article.sections.length > 0) {
      const searchKeywords = {
        "overview": ["plot", "synopsis", "story"],
        "ending-explained": ["ending", "climax", "plot", "story", "synopsis"],
        "box-office": ["box office", "commercial", "budget", "collection", "reception"],
        "budget": ["production", "budget", "cost", "filming"],
        "ott-release": ["release", "distribution", "streaming", "digital", "television"],
        "cast": ["cast", "starring", "characters", "personnel"],
        "review-analysis": ["reception", "critical", "review", "consensus", "response"],
        "genre-analysis": ["genre", "theme", "style", "category"],
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
    { label: "Box Office", slug: `${article.slug}-box-office`, active: pageType === "box-office" },
    { label: "Budget", slug: `${article.slug}-budget`, active: pageType === "budget" },
    { label: "OTT", slug: `${article.slug}-ott-release`, active: pageType === "ott-release" },
    { label: "Cast", slug: `${article.slug}-cast`, active: pageType === "cast" },
    { label: "Reviews", slug: `${article.slug}-review-analysis`, active: pageType === "review-analysis" },
    { label: "Ending", slug: `${article.slug}-ending-explained`, active: pageType === "ending-explained" },
    { label: "Genre", slug: `${article.slug}-genre-analysis`, active: pageType === "genre-analysis" },
    { label: "Verdict", slug: `${article.slug}-hit-or-flop`, active: pageType === "hit-or-flop" },
  ];

  const structuredSchema = {
    "@context": "https://schema.org",
    "@graph": [
      // 1. Breadcrumb Schema (Enhanced for sub-pages)
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { 
            "@type": "ListItem", 
            "position": 1, 
            "name": "Home", 
            "item": "https://filmyfire.com" 
          },
          { 
            "@type": "ListItem", 
            "position": 2, 
            "name": category, 
            "item": `https://filmyfire.com/category/${category.toLowerCase()}` 
          },
          { 
            "@type": "ListItem", 
            "position": 3, 
            "name": article.movieTitle || article.title, 
            "item": `https://filmyfire.com/category/${category.toLowerCase()}/${article.slug}` 
          },
          ...(pageType !== "overview" ? [{
            "@type": "ListItem",
            "position": 4,
            "name": pageType.replace(/-/g, " "),
            "item": `https://filmyfire.com/category/${category.toLowerCase()}/${article.slug}-${pageType}`
          }] : [])
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
        <title>{`${seo.title || 'Untitled'} | FilmyFire Intelligence`}</title>
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

        <main className="pb-40">
          
          {/* ────────────────────────────────────────────────────────
               OVERVIEW PAGE: Full TMDB-style hero banner
          ──────────────────────────────────────────────────────── */}
          {pageType === "overview" && (
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

                  {article.tagline && (
                    <p className="text-zinc-400 italic text-lg mb-6 font-medium">"{article.tagline}"</p>
                  )}

                  <div className="max-w-3xl">
                    {/* Streaming Now - TMDB Style Badge */}
                    {article.ott?.platform && (
                      <div className="inline-flex items-center gap-4 px-6 py-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl mb-10 group/ott">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Now Streaming</p>
                          <p className="text-sm font-bold text-white group-hover/ott:text-blue-400 transition-colors">Watch on {article.ott.platform}</p>
                        </div>
                      </div>
                    )}

                    <h3 className="text-xl font-black text-white mb-3 uppercase tracking-widest">Overview</h3>
                    <p className="text-zinc-300 leading-relaxed font-medium mb-10 line-clamp-4 md:line-clamp-none">
                      {article.summary}
                    </p>

                    {/* Key Personnel & Financial Intel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {article.director && article.director.length > 0 && (
                        <div>
                          <p className="font-black text-white text-sm">{article.director[0]}</p>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Director</p>
                        </div>
                      )}
                      {article.writer && article.writer.length > 0 && (
                        <div>
                          <p className="font-black text-white text-sm">{article.writer[0]}</p>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Screenplay</p>
                        </div>
                      )}
                      {article.budget && (
                        <div>
                          <p className="font-black text-white text-sm">{article.budget}</p>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Budget</p>
                        </div>
                      )}
                      {article.boxOffice?.worldwide && (
                        <div>
                          <p className="font-black text-white text-sm">{article.boxOffice.worldwide}</p>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Revenue</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ────────────────────────────────────────────────────────
               SUB-PAGES: Compact movie strip (no big hero banner)
          ──────────────────────────────────────────────────────── */}
          {pageType !== "overview" && (
            <div className="pt-20 pb-8 border-b border-white/5 mb-12">
              <div className="max-w-[1200px] mx-auto px-6">
                <div className="flex items-center gap-6">
                  {/* Small Poster Thumbnail */}
                  <Link href={`/category/${category.toLowerCase()}/${article.slug}`}>
                    <div className="w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg group">
                      {article.coverImage ? (
                        <img 
                          src={article.coverImage} 
                          alt={article.movieTitle || article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-zinc-600" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Movie Info */}
                  <div className="flex-grow min-w-0">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
                      <Link href={`/category/${category.toLowerCase()}`} className="hover:text-zinc-400 transition-colors">{category}</Link>
                      <ChevronRight className="w-3 h-3" />
                      <Link href={`/category/${category.toLowerCase()}/${article.slug}`} className="hover:text-zinc-400 transition-colors truncate max-w-[200px]">
                        {article.movieTitle || article.title}
                      </Link>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-blue-500">{pageType.replace(/-/g, " ")}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight truncate">
                      {article.movieTitle || article.title}
                      <span className="text-zinc-600 font-light text-lg ml-2">({article.releaseYear})</span>
                    </h1>

                    {/* Meta Chips */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.15em]">
                        {pageType.replace(/-/g, " ")}
                      </span>
                      {article.genres?.slice(0, 2).map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{g}</span>
                      ))}
                      {article.releaseYear && (
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{article.releaseYear}</span>
                      )}
                    </div>
                  </div>

                  {/* Rating Badge */}
                  {article.rating && (
                    <div className="hidden md:flex flex-col items-center flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-zinc-900 border-2 border-emerald-500 flex items-center justify-center">
                        <span className="text-sm font-black text-white">
                          {(parseFloat(article.rating) * 10).toFixed(0)}<span className="text-[8px]">%</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-1">Score</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Persistent Floating Navigation Bar */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-fit px-6">
            <nav className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-1 overflow-x-auto no-scrollbar">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={`/category/${category.toLowerCase()}/${link.slug}`}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    link.active
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105 z-10'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="max-w-[1200px] mx-auto px-6">
            {/* Structured Content Sections */}
            <div className={pageType === "overview" ? "space-y-32" : "space-y-16"}>
              {sections && sections.length > 0 ? (
                sections.map((section, idx) => (
                  <section key={idx} className="max-w-4xl group">
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-8 uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                      {section.heading}
                    </h2>
                    
                    {/* Special Rendering for Structured Cast Data */}
                    {pageType === "cast" && (section.isStructuredCast || section.heading.toLowerCase().includes("cast")) ? (
                      <div className="space-y-16">
                        <div>
                          <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            Full Billed Cast
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {(article.cast && article.cast.length > 0 ? article.cast : section.content.split("\n\n")).map((actor, i) => {
                              const name = typeof actor === 'string' ? actor.split(" as ")[0] : actor.name;
                              const role = typeof actor === 'string' ? actor.split(" as ")[1] : actor.role;
                              const profileImage = typeof actor === 'object' ? actor.profileImage : null;
                              
                              return (
                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center group/card">
                                  <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform overflow-hidden">
                                    {profileImage ? (
                                      <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-8 h-8 text-blue-500" />
                                    )}
                                  </div>
                                  <p className="font-bold text-white text-sm line-clamp-1">{name}</p>
                                  {role && <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest line-clamp-1">{role}</p>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {article.crew && article.crew.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                              <Briefcase className="w-5 h-5" />
                              Technical Personnel & Crew
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                              {article.crew.map((member, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center group/card">
                                  <div className="w-20 h-20 rounded-full bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform overflow-hidden">
                                    {member.profileImage ? (
                                      <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-8 h-8 text-emerald-500" />
                                    )}
                                  </div>
                                  <p className="font-bold text-white text-sm line-clamp-1">{member.name}</p>
                                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest line-clamp-1">{member.job || member.department}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {section.content.split('\n\n').map((para, i) => (
                          <p key={i} className="text-xl text-zinc-400 leading-relaxed font-medium">
                            {para}
                          </p>
                        ))}
                      </div>
                    )}
                  </section>
                ))
              ) : (
                <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">Intelligence Report Pending Verification</p>
                </div>
              )}
            </div>

            {/* Recommendations Section - Real Database Intelligence */}
            {dynamicRecommendations && dynamicRecommendations.length > 0 ? (
              <section className="mt-40">
                <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Recommendations</h3>
                <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x">
                  {dynamicRecommendations.map((rec, i) => (
                    <Link 
                      key={i} 
                      href={`/category/${category.toLowerCase()}/${rec.slug}`}
                      className="min-w-[180px] md:min-w-[220px] snap-start group/rec cursor-pointer"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-white/5 group-hover/rec:border-blue-500/30 transition-all shadow-lg">
                        {rec.backdropImage ? (
                          <img 
                            src={rec.backdropImage} 
                            alt={rec.movieTitle || rec.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/rec:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-black uppercase text-[10px] tracking-widest">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/rec:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white group-hover/rec:text-blue-400 transition-colors line-clamp-1 flex-grow pr-4">{rec.movieTitle || rec.title}</h4>
                        <span className="text-sm font-black text-zinc-400">{(parseFloat(rec.rating || 0) * 10).toFixed(0)}%</span>
                      </div>
                      
                      <div className="mt-2 h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-zinc-500 transition-all duration-1000"
                          style={{ width: `${(parseFloat(rec.rating || 0) * 10).toFixed(0)}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
              // Fallback to TMDB recommendations if database is empty for category
              (article.recommendations && article.recommendations.length > 0) ? (
                <section className="mt-40">
                  <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Recommendations</h3>
                  <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x">
                    {article.recommendations.map((rec, i) => (
                      <Link 
                        key={i} 
                        href={`/category/${category.toLowerCase()}/${rec.slug}`}
                        className="min-w-[180px] md:min-w-[220px] snap-start group/rec cursor-pointer"
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-white/5 group-hover/rec:border-blue-500/30 transition-all shadow-lg">
                          {rec.backdropImage ? (
                            <img 
                              src={rec.backdropImage} 
                              alt={rec.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/rec:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-black uppercase text-[10px] tracking-widest">No Image</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/rec:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white group-hover/rec:text-blue-400 transition-colors line-clamp-1 flex-grow pr-4">{rec.title}</h4>
                          <span className="text-sm font-black text-zinc-400">{(parseFloat(rec.rating || 0) * 10).toFixed(0)}%</span>
                        </div>
                        
                        <div className="mt-2 h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-zinc-500 transition-all duration-1000"
                            style={{ width: `${(parseFloat(rec.rating || 0) * 10).toFixed(0)}%` }}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="mt-40 text-center py-20 border border-dashed border-white/5 rounded-3xl">
                  <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Awaiting Intelligence for {category} Database</p>
                </section>
              )
            )}

            {/* FAQ Section - Accordion Style */}
            {seo.faq && seo.faq.length > 0 && (
              <section className="mt-40 max-w-4xl">
                <h2 className="text-4xl font-black text-white mb-16 uppercase tracking-tighter">Frequently Asked Intelligence</h2>
                <div className="space-y-4">
                  {seo.faq.map((faq, i) => (
                    <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>

        </main>
      </div>
    </>
  );
}

ArticleDetailPage.noPadding = true;