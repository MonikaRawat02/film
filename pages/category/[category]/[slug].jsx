import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { slugify } from "../../../lib/slugify";
import {
  ArrowLeft, Clock, User, Calendar, DollarSign, Users, Play, Award,
  Check, Download, ExternalLink, ChevronRight, Eye, Briefcase,
  ChevronDown, Film, Tv, TrendingUp, Zap, Target, BookOpen, BarChart3,
  ShieldCheck, Heart, Bookmark, List, Info, HelpCircle, Globe, Sparkles, Tag,
  Clapperboard, Star, Book, FileText
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
  const [scrollProgress, setScrollProgress] = useState(0);

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

      // --- Record Article View ---
      if (article?.slug) {
        fetch("/api/public/record-article-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: article.slug })
        }).catch(err => console.error("Failed to record view:", err));
      }
    }
  }, [article?._id, article?.slug, sections]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / totalScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </Head>
  
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white selection:bg-red-600/30 font-sans relative">
  
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
  
        {/* Sticky Nav - shows on scroll */}
        <nav className={`fixed top-14 md:top-16 left-0 right-0 z-[70] transition-all duration-500 ${
          scrollProgress > 5
            ? 'opacity-100 translate-y-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 py-2 md:py-3'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-2">
            <Link
              href={categoryPageUrl}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-all text-xs md:text-sm font-medium flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <h2 className="text-xs md:text-sm font-bold text-white truncate flex-1 text-center max-w-[150px] sm:max-w-[250px] md:max-w-md">
              {movieTitle} – {pageType.replace(/-/g, " ")}
            </h2>
            <div className="w-12 md:w-16 flex-shrink-0"></div>
          </div>
        </nav>
  
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-full min-h-[60vh] bg-cover bg-center overflow-hidden mt-4 md:mt-6"
        >
          {/* Background Image */}
          {article.coverImage ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src={article.coverImage}
              alt={movieTitle}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
          )}
  
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/30 to-transparent" />
  
          {/* Back Button */}
          <Link
            href={categoryPageUrl}
            className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-200 hover:text-white transition-all text-sm font-medium group bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-gray-500/30 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline text-xs">Back</span>
          </Link>
  
          {/* Hero Content */}
          <div className="relative h-full flex items-center z-10">
            <div className="max-w-7xl w-full mx-auto px-6 py-16 md:py-20">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-8 md:gap-10 items-start"
              >
                {/* Poster with Gradient Border */}
                <motion.div
                  initial={{ x: -30, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                  className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72"
                >
                  <motion.div whileHover={{ scale: 1.02, y: -5 }} transition={{ type: "spring", stiffness: 300 }} className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition duration-300"></div>
                    <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl">
                      {article.coverImage ? (
                        <img src={article.coverImage} alt={movieTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Film className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
  
                {/* Movie Info */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex-1 min-w-0"
                >
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white text-[11px] font-semibold">
                      <Target className="w-3 h-3" />
                      {article.category}
                    </motion.span>
                    {article.rating && (
                      <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1 text-yellow-400 text-[11px] font-semibold bg-yellow-500/20 px-2.5 py-1 rounded-full border border-yellow-500/30">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {article.rating}/10
                      </motion.span>
                    )}
                    {article.certification && (
                      <span className="px-1.5 py-0.5 border border-gray-500 rounded text-[10px] text-gray-400 uppercase">{article.certification}</span>
                    )}
                  </div>

                  {/* Title */}
                  <motion.h1
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 drop-shadow-2xl"
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.3)' }}
                  >
                    {movieTitle}
                  </motion.h1>
  
                  {/* Meta */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 mb-3"
                  >
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.releaseYear}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.runtime || "2h 45m"}</span>
                    {article.genres?.slice(0, 2).map((g, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-gray-800/80 text-[11px] font-medium border border-gray-600">{g}</span>
                    ))}
                  </motion.div>
  
                  {/* Tagline */}
                  {article.tagline && (
                    <motion.p
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.65, duration: 0.5 }}
                      className="text-gray-400 italic text-sm mb-3"
                    >
                      "{article.tagline}"
                    </motion.p>
                  )}
  
                  {/* Streaming Badge */}
                  {article.ott?.platform && (
                    <motion.div
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10 mb-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Now Streaming</p>
                        <p className="text-xs font-bold text-white">{article.ott.platform}</p>
                      </div>
                    </motion.div>
                  )}
  
                  {/* PAGE-SPECIFIC CONTENT IN HERO */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    {/* OVERVIEW - full summary */}
                    {pageType === "overview" && article.summary && (
                      <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">{article.summary}</p>
                    )}

                    {/* BOX OFFICE */}
                    {pageType === "box-office" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Box Office Collection</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {(article.boxOffice?.worldwide) && (
                            <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Worldwide</p>
                              <p className="text-base font-bold text-white">{article.boxOffice?.worldwide}</p>
                            </div>
                          )}
                          {article.boxOffice?.india && (
                            <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">India Net</p>
                              <p className="text-base font-bold text-white">{article.boxOffice.india}</p>
                            </div>
                          )}
                          {article.boxOffice?.overseas && (
                            <div className="p-3 rounded-lg bg-cyan-600/20 border border-cyan-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Overseas</p>
                              <p className="text-base font-bold text-white">{article.boxOffice.overseas}</p>
                            </div>
                          )}
                          {article.boxOffice?.openingDay && (
                            <div className="p-3 rounded-lg bg-purple-600/20 border border-purple-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Opening Day</p>
                              <p className="text-base font-bold text-white">{article.boxOffice.openingDay}</p>
                            </div>
                          )}
                          {article.boxOffice?.openingWeekend && (
                            <div className="p-3 rounded-lg bg-pink-600/20 border border-pink-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Opening Weekend</p>
                              <p className="text-base font-bold text-white">{article.boxOffice.openingWeekend}</p>
                            </div>
                          )}
                          {article.boxOffice?.firstWeek && (
                            <div className="p-3 rounded-lg bg-orange-600/20 border border-orange-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">First Week</p>
                              <p className="text-base font-bold text-white">{article.boxOffice.firstWeek}</p>
                            </div>
                          )}
                        </div>
                        {article.boxOffice?.verdict && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/40">
                            <span className="text-sm font-black text-red-300 uppercase">{article.boxOffice.verdict}</span>
                          </div>
                        )}
                      </div>
                    )}
  
                    {/* CAST */}
                    {pageType === "cast" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Complete Cast</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {article.cast?.map((actor, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/60 border border-gray-700/60 backdrop-blur-sm">
                              <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {actor.profileImage ? (
                                  <img src={actor.profileImage} alt={actor.name} className="w-full h-full object-cover" />
                                ) : actor.image ? (
                                  <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-3.5 h-3.5 text-blue-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white text-[11px] font-semibold truncate">{actor.name}</p>
                                <p className="text-[9px] text-gray-500 truncate">{actor.role || "Actor"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BUDGET */}
                    {pageType === "budget" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Budget & Profit</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/30">
                            <p className="text-[9px] text-blue-400 uppercase mb-1">Total Budget</p>
                            <p className="text-xl font-bold text-white">{article.budget || "N/A"}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
                            <p className="text-[9px] text-green-400 uppercase mb-1">Worldwide Collection</p>
                            <p className="text-xl font-bold text-white">{article.stats?.worldwide || "N/A"}</p>
                          </div>
                        </div>
                        {article.budget && article.stats?.worldwide && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700 text-center">
                              <p className="text-sm font-bold text-white">{(parseInt(article.stats.worldwide) / parseInt(article.budget)).toFixed(1)}x</p>
                              <p className="text-[9px] text-gray-400">Return</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700 text-center">
                              <p className="text-sm font-bold text-green-400">{((parseInt(article.stats.worldwide) / parseInt(article.budget) - 1) * 100).toFixed(0)}%</p>
                              <p className="text-[9px] text-gray-400">Profit</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-800/60 border border-gray-700 text-center">
                              <p className="text-sm font-bold text-white">{parseInt(article.stats.worldwide) - parseInt(article.budget) > 0 ? 'Profit' : 'Loss'}</p>
                              <p className="text-[9px] text-gray-400">Result</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
  
                    {/* ENDING EXPLAINED */}
                    {pageType === "ending-explained" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Ending Explained</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{article.summary || `Complete ending explanation and hidden meanings for ${movieTitle}.`}</p>
                        {article.sections?.slice(0, 2).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-orange-600/10 border border-orange-500/20">
                            <p className="text-xs font-bold text-orange-300 mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{section.content?.substring(0, 180)}...</p>
                          </div>
                        ))}
                      </div>
                    )}
  
                    {/* REVIEW ANALYSIS */}
                    {pageType === "review-analysis" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Critical Review</p>
                        <div className="flex items-center gap-4">
                          {article.rating && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-600/20 border border-yellow-500/30">
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              <div>
                                <p className="text-2xl font-bold text-white">{article.rating}</p>
                                <p className="text-[9px] text-yellow-300">IMDb / 10</p>
                              </div>
                            </div>
                          )}
                          {article.genreAnalysis && (
                            <p className="text-gray-300 text-sm leading-relaxed flex-1">{article.genreAnalysis}</p>
                          )}
                        </div>
                        {article.sections?.slice(0, 2).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/60 border border-gray-700">
                            <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{section.content?.substring(0, 180)}...</p>
                          </div>
                        ))}
                      </div>
                    )}
  
                    {/* HIT OR FLOP */}
                    {pageType === "hit-or-flop" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Hit or Flop Verdict</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
                            <p className="text-[9px] text-green-400 uppercase mb-1">Box Office</p>
                            <p className="text-base font-bold text-white">{article.stats?.worldwide || "N/A"}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/30">
                            <p className="text-[9px] text-blue-400 uppercase mb-1">Budget</p>
                            <p className="text-base font-bold text-white">{article.budget || "N/A"}</p>
                          </div>
                        </div>
                        {article.stats?.verdict && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/40">
                            <span className="text-sm font-black text-red-300 uppercase">{article.stats.verdict}</span>
                          </div>
                        )}
                      </div>
                    )}
  
                    {/* OTT RELEASE */}
                    {pageType === "ott-release" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">OTT Release Info</p>
                        {article.ott?.platform && (
                          <div className="p-3 rounded-lg bg-purple-600/20 border border-purple-500/30">
                            <p className="text-[9px] text-purple-400 uppercase mb-1">Platform</p>
                            <p className="text-xl font-bold text-white">{article.ott.platform}</p>
                          </div>
                        )}
                        {article.ott?.releaseDate && (
                          <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700">
                            <p className="text-[9px] text-gray-400 uppercase mb-1">OTT Release Date</p>
                            <p className="text-base font-bold text-white">{article.ott.releaseDate}</p>
                          </div>
                        )}
                        {article.summary && <p className="text-gray-300 text-sm leading-relaxed">{article.summary}</p>}
                      </div>
                    )}
  
                    {/* GENRE ANALYSIS */}
                    {pageType === "genre-analysis" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Genre Analysis</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{article.genreAnalysis || `The movie falls into: ${article.genres?.join(", ")}.`}</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
  
        {/* Content Section */}
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">

          {/* Top Grid - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Left Sidebar - Movie Details + Quick Nav */}
            <div className="lg:col-span-4 space-y-6">
              {/* Movie Stats Card */}
              <motion.div 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-white" />
                  </div>
                  Movie Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase">Views</span>
                    <span className="text-xs font-bold text-white">{article.stats?.views?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase">Read Time</span>
                    <span className="text-xs font-bold text-white">{article.stats?.readTime || `${readingTime} min`}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase">Published</span>
                    <span className="text-xs font-bold text-white">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] text-gray-500 uppercase">AI Content</span>
                    <span className={`text-xs font-bold ${article.isAIContent ? 'text-green-400' : 'text-gray-400'}`}>
                      {article.isAIContent ? '✓ Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Movie Details Card */}
              <motion.div 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-xl bg-gray-900/80 border border-gray-800 p-5">
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

              {/* Quick Navigation */}
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

            {/* Right Side - Always Show Movie Overview & Related Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Movie Summary - Always Show */}
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
              </motion.div>

              {/* Current Page Context - Show relevant info based on page type */}
              {pageType === "cast" && article.cast && article.cast.length > 0 && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-white" />
                    </div>
                    Cast Highlights
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {article.cast.slice(0, 6).map((actor, idx) => (
                      <Link key={idx} href={`/celebrity/${slugify(actor.name)}`} className="group">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 transition-all">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {actor.profileImage ? (
                              <img src={actor.profileImage} alt={actor.name} className="w-full h-full object-cover" />
                            ) : actor.image ? (
                              <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{actor.name}</p>
                            <p className="text-[9px] text-gray-500 truncate">{actor.role || "Actor"}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {pageType === "box-office" && (article.stats || article.boxOffice) && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    </div>
                    Performance Highlights
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(article.stats?.worldwide || article.boxOffice?.worldwide) && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-[9px] text-gray-400 uppercase mb-1">Worldwide</p>
                        <p className="text-lg font-bold text-white">{article.stats?.worldwide || article.boxOffice?.worldwide}</p>
                      </div>
                    )}
                    {article.stats?.indiaNet && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-[9px] text-gray-400 uppercase mb-1">India Net</p>
                        <p className="text-lg font-bold text-white">{article.stats.indiaNet}</p>
                      </div>
                    )}
                    {article.stats?.openingDay && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-[9px] text-gray-400 uppercase mb-1">Opening Day</p>
                        <p className="text-lg font-bold text-white">{article.stats.openingDay}</p>
                      </div>
                    )}
                    {article.stats?.verdict && (
                      <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
                        <p className="text-[9px] text-green-400 uppercase mb-1">Verdict</p>
                        <p className="text-lg font-bold text-green-400">{article.stats.verdict}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {pageType === "budget" && article.budget && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5 text-white" />
                    </div>
                    Budget Highlights
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-[9px] text-gray-400 uppercase mb-1">Budget</p>
                      <p className="text-lg font-bold text-white">{article.budget}</p>
                    </div>
                    {article.stats?.worldwide && (
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <p className="text-[9px] text-gray-400 uppercase mb-1">Collection</p>
                        <p className="text-lg font-bold text-white">{article.stats.worldwide}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
  
              {/* Key Crew - Show on overview and cast pages */}
              {(pageType === "overview" || pageType === "cast") && (article.director?.length > 0 || article.producer?.length > 0 || article.writer?.length > 0) && (
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
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
              {article.tags && article.tags.length > 0 && (
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
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
            </div>
          </div>

          {/* Intro for non-overview pages */}
          {pageType !== "overview" && (
            <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 border-l-4 border-l-red-500">
              <p className="text-gray-300 leading-relaxed text-base">
                {article.summary ?
                  `${article.summary.substring(0, 300)}... This dedicated report focuses specifically on the ${pageType.replace(/-/g, " ")} of ${movieTitle}.` :
                  `Explore the detailed ${pageType.replace(/-/g, " ")} analysis for ${movieTitle} (${article.releaseYear}).`
                }
              </p>
            </div>
          )}

          {/* Rich Content Sections Based on PageType */}
          {pageType === "overview" && (
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Intro Section */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Sparkles className="w-24 h-24" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <Info className="w-6 h-6 text-red-500" /> Movie Overview
                </h2>
                <p className="text-gray-300 leading-relaxed text-base relative z-10">
                  {article.summary || `${movieTitle} is a highly anticipated ${article.genres?.join("/")} feature that has taken the ${article.category} industry by storm. This full intelligence report provides a comprehensive analysis of the film's theatrical journey, its digital release strategy, and the creative vision behind its production.`}
                </p>
              </motion.div>

              {/* Plot Summary Section */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-red-500" /> Plot Summary
                </h2>
                <div className="space-y-4">
                  {article.sections?.filter(s => s.heading.toLowerCase().includes("plot") || s.heading.toLowerCase().includes("story")).map((section, idx) => (
                    <div key={idx}>
                      <h3 className="text-xl font-semibold text-white mb-3">{section.heading}</h3>
                      <p className="text-gray-400 leading-relaxed">{section.content}</p>
                    </div>
                  )) || <p className="text-gray-500 italic">Detailed plot analysis is being updated by our film experts.</p>}
                </div>
              </motion.div>

              {/* Ending Explained Section */}
              <motion.div 
                id="ending-section"
                whileHover={{ y: -3 }}
                className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-red-500" /> Ending Explained
                </h2>
                <div className="space-y-4">
                  {article.pSEO_Content_ending_explained?.length > 0 ? (
                    article.pSEO_Content_ending_explained.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="text-xl font-semibold text-white mb-3">{section.heading}</h3>
                        <p className="text-gray-400 leading-relaxed">{section.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 leading-relaxed">
                      For a deep-dive analysis of the final climax and hidden meanings, visit our dedicated 
                      <Link href={`/category/${category.toLowerCase()}/${article.slug}-ending-explained`} className="text-red-500 hover:underline mx-1 font-semibold">
                        {movieTitle} Ending Explained
                      </Link> page.
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Box Office & Budget Cards */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30"
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500" /> Box Office
                  </h2>
                  <div className="space-y-3">
                    <p className="text-3xl font-bold text-white">{article.boxOffice?.worldwide || article.stats?.worldwide || "TBA"}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      The global theatrical run has shown impressive resilience. 
                      <Link href={`/category/${category.toLowerCase()}/${article.slug}-box-office`} className="text-green-500 hover:underline mx-1 font-semibold">
                        Full Financial Report
                      </Link>
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-500" /> Budget
                  </h2>
                  <div className="space-y-3">
                    <p className="text-3xl font-bold text-white">{article.budget || "TBA"}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Production scale and marketing investments were significant. 
                      <Link href={`/category/${category.toLowerCase()}/${article.slug}-budget`} className="text-blue-500 hover:underline mx-1 font-semibold">
                        Budget Breakdown
                      </Link>
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* OTT Release Details */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Tv className="w-6 h-6 text-red-500" /> OTT Release Details
                </h2>
                <div className="space-y-4">
                  {article.ott?.platform ? (
                    <p className="text-gray-400 leading-relaxed">
                      {movieTitle} is officially streaming on <span className="text-white font-semibold">{article.ott.platform}</span>. 
                      The digital rights were secured in a multi-crore deal. Visit our 
                      <Link href={`/ott/${slugify(article.ott.platform)}`} className="text-red-500 hover:underline mx-1 font-semibold">
                        OTT Intelligence
                      </Link> page for the exact release timeline.
                    </p>
                  ) : (
                    <p className="text-gray-400 leading-relaxed">
                      Streaming platform details are currently under negotiation. 
                      Check our <Link href="/category/ott" className="text-red-500 hover:underline font-semibold">OTT Hub</Link> for updates.
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Cast & Characters Section */}
              <motion.div 
                id="cast-section"
                whileHover={{ y: -3 }}
                className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-red-500" /> Cast & Characters
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {article.cast?.slice(0, 4).map((actor, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.03, x: 5 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600/30 to-purple-600/30 flex items-center justify-center border border-gray-600 overflow-hidden">
                        {actor.profileImage ? (
                          <img src={actor.profileImage} alt={actor.name} className="w-full h-full object-cover" />
                        ) : actor.image ? (
                          <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{actor.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{actor.role || "Lead Role"}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link href={`/category/${category.toLowerCase()}/${article.slug}-cast`} className="text-red-500 text-sm font-semibold hover:underline flex items-center gap-1">
                  View Full Cast & Performance Analysis <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Audience Reaction Section */}
              <motion.div 
                whileHover={{ y: -3 }}
                className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500" /> Audience Reaction
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {article.criticalResponse || `Audience and critical reception has been a major point of discussion. The film's unique narrative approach and technical brilliance have received praise from industry experts.`}
                </p>
                <Link href={`/category/${category.toLowerCase()}/${article.slug}-review-analysis`} className="text-red-500 text-sm font-semibold hover:underline flex items-center gap-1">
                  See Critical Review Analysis <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
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
            </section>
          )}

          {/* Budget Page */}
          {pageType === "budget" && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-blue-600" /> Budget Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-blue-900/20 border border-blue-700/30">
                  <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Production Budget</p>
                  <p className="text-3xl font-black text-white">{article.budget || "TBA"}</p>
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
          )}

          {/* Generic Content Sections from pSEO_Content */}
          {sections && sections.length > 0 && pageType !== "cast" && (
            <div id="overview-section" className="space-y-12 mt-12">
              {sections.map((section, idx) => (
                <motion.section
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                >
                  <h2 className="text-2xl font-black text-white mb-6">{section.heading}</h2>
                  <div className="space-y-8">
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-lg text-gray-400 leading-relaxed">{para}</p>
                    ))}
                  </div>
                </motion.section>
              ))}
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
          </div>

          {/* FAQ Section */}
          {seo.faq && seo.faq.length > 0 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="pt-16 border-t border-gray-800"
            >
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-red-500" /> Frequently Asked Questions
                </h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{seo.faq.length} questions</span>
              </div>
              {seo.faq.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
              ))}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Still have questions? <Link href="/contact" className="text-red-500 hover:text-red-400">Contact our film experts</Link>
                </p>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}

ArticleDetailPage.noPadding = true;