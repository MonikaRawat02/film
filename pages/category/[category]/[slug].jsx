import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { slugify } from "@/lib/slugify";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BarChart3, User, DollarSign, Users, Award, ExternalLink, ChevronRight, Briefcase,
  Target, HelpCircle, ShieldCheck, Film, TrendingUp, Star, BookOpen, Tv, Tag, Info, Heart, FileText ,Zap
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

// Utility function to clean placeholder text from AI-generated content
function cleanContent(content) {
  if (!content) return "";
  return content
    .replace(/\[insert[^\]]*\]/gi, "")
    .replace(/\[unknown\]/gi, "To be announced")
    .replace(/\s+/g, " ")
    .trim();
}

// Utility function to parse FAQs from content
function parseFAQsFromContent(content) {
  if (!content) return [];
  const faqs = [];
  
  // Method 1: Split by **Q patterns (with or without numbers)
  const blocks = content.split(/\*\*Q\.?\s*\d*:?\s*/);
  if (blocks.length > 1) {
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const questionMatch = block.match(/^([^?]*\?)/);
      if (!questionMatch) continue;
      const question = questionMatch[1].trim();
      let answer = '';
      const aMatch = block.match(/\*\*A\.?\s*\d*:?\s*([^\n]+)/);
      if (aMatch) {
        answer = aMatch[1].trim();
      } else {
        // Try to find "A:" without bold
        const aMatchPlain = block.match(/^A:\s*([^\n]+)/m);
        if (aMatchPlain) {
          answer = aMatchPlain[1].trim();
        } else {
          const afterQuestion = block.substring(block.indexOf('?') + 1);
          answer = afterQuestion.replace(/\*\*/g, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
      answer = answer.replace(/\*\*/g, '').trim();
      if (question && answer && question.length > 3) {
        faqs.push({ question, answer });
      }
    }
  }
  
  // Method 2: Parse "**Q: Question?**\nA: Answer" format (your current format)
  if (faqs.length === 0) {
    const qaBlockPattern = /\*\*Q:\s*([^?]+\?)\*\*\s*\nA:\s*([^\n]+)/g;
    let match;
    while ((match = qaBlockPattern.exec(content)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim();
      if (question && answer && question.length > 3) {
        faqs.push({ question, answer });
      }
    }
  }
  
  // Method 3: Parse numbered format "1. **Question?** Answer"
  if (faqs.length === 0) {
    const numberedPattern = /(\d+)\.\s+\*\*([^*]+)\*\*/g;
    let match;
    while ((match = numberedPattern.exec(content)) !== null) {
      const num = match[1];
      const questionWithBold = match[2];
      const qMatch = questionWithBold.match(/([^?]*\?)/);
      if (!qMatch) continue;
      const question = qMatch[1].trim();
      const matchIndex = match.index;
      const afterMatch = content.substring(matchIndex + match[0].length);
      const nextNumMatch = afterMatch.match(/\n\s*\d+\.\s+\*\*/);
      let answer = nextNumMatch ? afterMatch.substring(0, nextNumMatch.index) : afterMatch;
      answer = answer.replace(/\*\*/g, '').replace(/^[\s:]+/, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      if (question && answer && question.length > 3) {
        faqs.push({ question, answer });
      }
    }
  }
  
  // Method 4: Parse "Q1: Question?" format
  if (faqs.length === 0) {
    const qaPattern = /Q\.?\s*(\d+):?\s*([^?]+\?)\s*A\.?\s*\d+:?\s*([^\n]+)/gi;
    let match;
    while ((match = qaPattern.exec(content)) !== null) {
      const question = match[2].trim();
      let answer = match[3].trim();
      answer = answer.replace(/\*\*/g, '').trim();
      if (question && answer && question.length > 3) {
        faqs.push({ question, answer });
      }
    }
  }
  
  return faqs;
}

// Extract FAQs from sections array
function extractFAQsFromSections(sections) {
  if (!sections || !Array.isArray(sections)) return [];
  
  // Method 1: Look for FAQ sections with Q&A in content
  for (const section of sections) {
    if (section.heading?.toLowerCase().includes('faq') || 
        section.content?.includes('Q1:') || 
        section.content?.includes('**Q')) {
      const parsed = parseFAQsFromContent(section.content);
      if (parsed.length > 0) return parsed;
    }
  }
  
  // Method 2: Extract FAQs from sections where heading is the question (Q1:, Q2:, etc.)
  const faqs = [];
  for (const section of sections) {
    // Check if heading matches Q1:, Q2:, **Q1:**, etc.
    const questionMatch = section.heading?.match(/^[\*\s]*(Q\.?\s*\d+[:\.]?\s*)(.+)$/i);
    if (questionMatch && section.content) {
      // Extract question from heading (remove Q1:, ** markers, etc.)
      const question = questionMatch[2].replace(/\*\*/g, '').trim();
      
      // Extract answer from content (remove **A1:**, **A:**, etc.)
      let answer = section.content
        .replace(/\*\*[Aa]\.?\s*\d*[:\.]?\s*\*\*/g, '') // Remove **A1:**
        .replace(/[Aa]\.?\s*\d*[:\.]?\s*/g, '') // Remove A1:
        .replace(/\*\*/g, '') // Remove remaining **
        .trim();
      
      if (question && answer && question.length > 3) {
        faqs.push({ question, answer });
      }
    }
  }
  
  if (faqs.length > 0) return faqs;
  
  return [];
}

// FAQ Accordion Item Component
function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-800 bg-[#1a1a2e]/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-red-500/40 hover:bg-[#1a1a2e]/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left group"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:shadow-red-900/50 transition-shadow">
            <span className="text-white font-bold text-sm">?</span>
          </span>
          <span className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate">
            {question}
          </span>
        </div>
        <div className="flex items-center justify-center w-5 h-5">
           <svg 
            className={`w-4 h-4 text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180 text-red-400' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-5 pb-5 pl-[4.5rem]">
          <div className="w-8 h-px bg-gradient-to-r from-red-500/50 to-transparent mb-3"></div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {answer}
          </p>
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

    // Fetch dynamic recommendations - Show ALL data from API response
    let dynamicRecommendations = [];
    try {
      // PRIORITY 1: Fetch trending movies - show ALL results
      const trendingRes = await fetch(`${baseUrl}/api/trending?type=trending_movies&limit=20`);
      const trendingData = await trendingRes.json();
      
      if (trendingData.success && trendingData.data && trendingData.data.trending_movies) {
        const trendingMovies = trendingData.data.trending_movies;
        
        // Get ALL trending movies with article data (no category filter)
        dynamicRecommendations = trendingMovies
          .filter(trend => trend.referenceId && trend.referenceId.slug)
          .map(trend => ({
            ...trend.referenceId,
            trendingScore: trend.score,
            trendingTraffic: trend.traffic,
            trendingType: trend.type,
            trendingSource: trend.source
          }))
          .slice(0, 15); // Show up to 15 trending items
      }
      
      // PRIORITY 2: If trending is empty, fetch articles - show ALL results
      if (dynamicRecommendations.length === 0) {
        const recRes = await fetch(`${baseUrl}/api/articles/list?limit=30&includeDrafts=true`);
        const recData = await recRes.json();
        
        if (recData.success && recData.data && recData.data.length > 0) {
          dynamicRecommendations = recData.data
            .filter(a => a.slug !== slug)
            .slice(0, 15); // Show up to 15 articles
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
    } else if (slug.endsWith("-genres")) {
      pageType = "genres";
      contentKey = "pSEO_Content_genres";
      seoKey = "genres";
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
        "hit-or-flop": ["verdict", "box office", "reception", "collection"],
        "genres": ["genre", "theme", "style", "category", "motif"]
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

      // Scroll progress tracking
      const handleScroll = () => {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        setScrollProgress((currentScroll / totalScroll) * 100);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [article?._id, sections]);

  if (!article) return null;

  const quickLinks = [
    { label: "Overview", slug: article.slug, active: pageType === "overview" },
    { label: "Ending", slug: `${article.slug}-explained`, active: pageType === "ending-explained" },
    { label: "Box Office", slug: `${article.slug}-box-office`, active: pageType === "box-office" },
    { label: "Budget", slug: `${article.slug}-budget`, active: pageType === "budget" },
    { label: "OTT", slug: `${article.slug}-ott`, active: pageType === "ott-release" },
    { label: "Genres", slug: `${article.slug}-genres`, active: pageType === "genres" },
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
          { "@type": "ListItem", "position": 2, "name": category, "item": `https://filmyfire.com${categoryPageUrl}` },
          { "@type": "ListItem", "position": 3, "name": article.movieTitle || article.title, "item": `https://filmyfire.com${categoryPageUrl}/${article.slug}` }
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
        <link rel="canonical" href={`https://filmyfire.com${categoryPageUrl}/${slug}`} />
        
        {/* Automated Intelligence Schema (Task 7) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white selection:bg-red-600/30 font-sans relative">
        
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Dynamic Header - Shows on Scroll (Below Global Header) */}
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
              <span className="sm:hidden text-xs">Back</span>
            </Link>
            
            <h2 className="text-xs md:text-sm font-bold text-white truncate flex-1 text-center max-w-[150px] sm:max-w-[250px] md:max-w-md">
              {movieTitle} – {pageType.replace("-", " ")}
            </h2>

            <div className="w-12 md:w-16 flex-shrink-0"></div>
          </div>
        </nav>

        <main className="pb-32">
          
          {/* TMDB-Style Hero Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full min-h-[60vh] bg-cover bg-center overflow-hidden mt-4 md:mt-6">
            {/* Background Image */}
            {article.coverImage ? (
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={article.coverImage} 
                alt={article.movieTitle || article.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
            )}
            
            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/30 to-transparent" />

            {/* Back Button - Top Left */}
            <Link 
              href={categoryPageUrl}
              className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-200 hover:text-white transition-all text-sm font-medium group bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-gray-500/30 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline text-xs">Back</span>
            </Link>

            <div className="relative h-full flex items-center z-10">
              <div className="max-w-7xl w-full mx-auto px-6 py-16 md:py-20">
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-8 md:gap-10 items-start"
                >
                  
              {/* Poster Card */}
              <motion.div 
                initial={{ x: -30, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                className="w-48 sm:w-56 md:w-64 lg:w-72 flex-shrink-0"
              >
                <motion.div 
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative group"
                >
                  
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition duration-300"></div>
                  <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl">
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.movieTitle || article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Film className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Movie Details */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex-grow text-center md:text-left"
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3 justify-center md:justify-start">
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white text-[11px] font-semibold"
                  >
                    <Target className="w-3 h-3" />
                    {category}
                  </motion.span>
                  {article.rating && (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-1 text-yellow-400 text-[11px] font-semibold bg-yellow-500/20 px-2.5 py-1 rounded-full border border-yellow-500/30"
                    >
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {article.rating}/10
                    </motion.span>
                  )}
                </div>

                <motion.h1 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 drop-shadow-2xl"
                  style={{
                    textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.3)'
                  }}
                >
                  {movieTitle} <span className="text-zinc-500 font-light text-3xl sm:text-4xl md:text-5xl">({article.releaseYear})</span>
                </motion.h1>
                
                <motion.div 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-300 mb-3"
                >
                  {article.certification && (
                    <span className="px-1.5 py-0.5 border border-zinc-500 rounded text-[10px] text-zinc-400 uppercase">{article.certification}</span>
                  )}
                  <span>{article.releaseDate || article.releaseYear}</span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span>{article.genres?.join(", ")}</span>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span>{article.runtime || "N/A"}</span>
                </motion.div>

                  {/* PAGE-SPECIFIC CONTENT IN HERO */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    {/* OVERVIEW - full summary */}
                    {pageType === "overview" && article.summary && (
                      <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                        {article.summary}
                      </p>
                    )}

                    {/* BOX OFFICE */}
                    {pageType === "box-office" && article.pSEO_Content_box_office && article.pSEO_Content_box_office.length > 0 && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Box Office Analysis</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {getCompleteSentence(article.pSEO_Content_box_office[0].content, 250)}
                        </p>
                        {article.pSEO_Content_box_office.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-green-600/10 border border-green-500/20">
                            <p className="text-xs font-bold text-green-300 mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 200)}</p>
                          </div>
                        ))}
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
                    {pageType === "budget" && article.pSEO_Content_budget && article.pSEO_Content_budget.length > 0 && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Budget Analysis</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {getCompleteSentence(article.pSEO_Content_budget[0].content, 250)}
                        </p>
                        {article.pSEO_Content_budget.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/20">
                            <p className="text-xs font-bold text-blue-300 mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 200)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ENDING EXPLAINED */}
                    {pageType === "ending-explained" && article.pSEO_Content_ending_explained && article.pSEO_Content_ending_explained.length > 0 && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Ending Explained</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {getCompleteSentence(article.pSEO_Content_ending_explained[0].content, 250)}
                        </p>
                        {article.pSEO_Content_ending_explained.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-orange-600/10 border border-orange-500/20">
                            <p className="text-xs font-bold text-orange-300 mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 200)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* REVIEW ANALYSIS */}
                    {pageType === "review-analysis" && article.pSEO_Content_review_analysis && article.pSEO_Content_review_analysis.length > 0 && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Review Analysis</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {getCompleteSentence(article.pSEO_Content_review_analysis[0].content, 250)}
                        </p>
                        {article.pSEO_Content_review_analysis.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-500/20">
                            <p className="text-xs font-bold text-yellow-300 mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 200)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* HIT OR FLOP */}
                    {pageType === "hit-or-flop" && article.pSEO_Content_hit_or_flop && article.pSEO_Content_hit_or_flop.length > 0 && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Hit or Flop Verdict</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {getCompleteSentence(article.pSEO_Content_hit_or_flop[0].content, 250)}
                        </p>
                        {article.pSEO_Content_hit_or_flop.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-red-600/10 border border-red-500/20">
                            <p className="text-xs font-bold text-red-300 mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 200)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* OTT RELEASE */}
                    {pageType === "ott-release" && article.pSEO_Content_ott_release && article.pSEO_Content_ott_release.length > 0 && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">OTT Release Details</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {getCompleteSentence(article.pSEO_Content_ott_release[0].content, 250)}
                        </p>
                        {article.pSEO_Content_ott_release.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-purple-600/10 border border-purple-500/20">
                            <p className="text-xs font-bold text-purple-300 mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 200)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* GENRES */}
                    {pageType === "genres" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Genre & Theme Analysis</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.genres && article.genres.length > 0 ? (
                            article.genres.map((genre, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-bold">
                                {genre}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs italic">No genre data available</span>
                          )}
                        </div>
                        {article.pSEO_Content_genres && article.pSEO_Content_genres.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {getCompleteSentence(article.pSEO_Content_genres[0].content, 250)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {article.summary ? getCompleteSentence(article.summary, 250) : `Exploring the unique blend of genres and thematic elements in ${movieTitle}.`}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
            </div>
        </motion.div>

        {/* Horizontal Quick Navigation Bar */}
        <div className="sticky top-0 z-40 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/98 to-[#0a0a0f]/95 backdrop-blur-xl border-b border-gray-800/50">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {[
                { label: "Overview", suffix: "", icon: Info },
                { label: "Ending", suffix: "-ending-explained", icon: Zap },
                { label: "Box Office", suffix: "-box-office", icon: TrendingUp },
                { label: "Budget", suffix: "-budget", icon: DollarSign },
                { label: "OTT Release", suffix: "-ott-release", icon: Tv },
                { label: "Genres", suffix: "-genres", icon: BookOpen },
                { label: "Cast", suffix: "-cast", icon: Users },
                { label: "Reviews", suffix: "-review-analysis", icon: Star },
                { label: "Verdict", suffix: "-hit-or-flop", icon: ShieldCheck },
              ].map((link, idx) => {
                const IconComponent = link.icon;
                const isActive = (pageType === "overview" && link.suffix === "") || 
                                 (pageType !== "overview" && link.suffix === `-${pageType}`);
                return (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href={`${categoryPageUrl}/${article.slug}${link.suffix}`}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-900/30" 
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700"
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
        </div>
</div>
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar - Movie Stats Only */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Movie Stats Card - Always Visible */}
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
                    <span className="text-xs font-bold text-white">{article.stats?.readTime || '5 min'}</span>
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

              {/* Movie Details Card - Always Visible */}
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

                {/* Genre Options Card */}
                {article.genres && article.genres.length > 0 && (
                  <motion.div 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                  >
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-white" />
                      </div>
                      Genre Options
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.genres.map((genre, idx) => (
                        <Link 
                          key={idx} 
                          href={`/category/${slugify(genre)}`} 
                          className="px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-green-500/50 transition-all"
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
             

            {/* Right Side - Similar Movies + Content */}
            <div className="lg:col-span-8 space-y-6">
                        
              {/* Crew Section - Only on overview */}
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
          
              {/* Similar Movies - Hidden (Not needed on category pages) */}
          
              {/* Tags */}
              {pageType === "overview" && article.tags && article.tags.length > 0 && (
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
                    {article.tags.map((tag, idx) => {
                      const tagLower = tag.toLowerCase();
                      const categoryUrlMap = {
                        'bollywood': '/category/bollywood',
                        'hollywood': '/category/hollywood',
                        'ott': '/category/ott',
                        'webseries': '/category/webseries',
                        'boxoffice': '/category/box-office',
                        'celebrities': '/category/celebrity'
                      };
                      if (["bollywood", "hollywood", "ott", "webseries", "boxoffice", "celebrities"].includes(tagLower)) {
                        const targetUrl = categoryUrlMap[tagLower] || `/category/${tagLower}`;
                        return (
                          <Link key={idx} href={targetUrl} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 text-xs text-red-400 hover:text-white hover:border-red-500/50 transition-all">
                            #{tag}
                          </Link>
                        );
                      }
                      return (
                        <span key={idx} className="px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all cursor-default">
                          #{tag}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Page-Specific Content Card - matches movie page */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-800 p-5"
              >
                {/* OVERVIEW */}
                {pageType === "overview" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-red-500" />
                      About {movieTitle}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {article.summary || `${movieTitle} is a ${article.genres?.join("/")} film released in ${article.releaseYear}.`}
                    </p>
                    {article.tagline && (
                      <p className="text-xs text-gray-500 italic mt-3">"{article.tagline}"</p>
                    )}
                    {article.pSEO_Content_overview && article.pSEO_Content_overview.length > 0 && (
                      <div className="mt-4">
                        <button onClick={() => setShowFullAnalysis(!showFullAnalysis)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors">
                          {showFullAnalysis ? 'Show Less' : 'Read Full Analysis'} 
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${showFullAnalysis ? 'rotate-90' : ''}`} />
                        </button>
                        {showFullAnalysis && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="mt-4 space-y-3 pt-4 border-t border-gray-700">
                            {article.pSEO_Content_overview.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                                <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 250)}</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* BOX OFFICE - Quick stats only */}
                {pageType === "box-office" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Box Office Quick Stats
                    </h3>
                    {article.boxOffice?.worldwide && (
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Worldwide Collection</p>
                        <p className="text-xl font-bold text-green-400">{article.boxOffice.worldwide}</p>
                      </div>
                    )}
                    {article.stats?.verdict && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 mb-3">
                        <span className="text-xs font-bold text-green-400 uppercase">{article.stats.verdict}</span>
                      </div>
                    )}
                    {/* Content sections removed - shown in main area only */}
                  </>
                )}

                {/* BUDGET */}
                {pageType === "budget" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      Budget Analysis
                    </h3>
                    
                    {/* Budget Data from Article */}
                    <div className="space-y-3 mb-4">
                      {article.budget && (
                        <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/20">
                          <p className="text-[10px] text-blue-400 uppercase mb-1">Production Budget</p>
                          <p className="text-lg font-bold text-white">{article.budget}</p>
                        </div>
                      )}
                      
                      {article.boxOffice?.worldwide && (
                        <div className="p-3 rounded-lg bg-green-600/10 border border-green-500/20">
                          <p className="text-[10px] text-green-400 uppercase mb-1">Worldwide Collection</p>
                          <p className="text-lg font-bold text-white">{article.boxOffice.worldwide}</p>
                        </div>
                      )}
                      
                      {article.boxOffice?.india && (
                        <div className="p-3 rounded-lg bg-emerald-600/10 border border-emerald-500/20">
                          <p className="text-[10px] text-emerald-400 uppercase mb-1">India Collection</p>
                          <p className="text-lg font-bold text-white">{article.boxOffice.india}</p>
                        </div>
                      )}
                      
                      {article.boxOffice?.openingWeekend && (
                        <div className="p-3 rounded-lg bg-purple-600/10 border border-purple-500/20">
                          <p className="text-[10px] text-purple-400 uppercase mb-1">Opening Weekend</p>
                          <p className="text-lg font-bold text-white">{article.boxOffice.openingWeekend}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Summary if available */}
                    {article.summary && (
                      <div className="mb-4 pb-4 border-b border-gray-800">
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {getCompleteSentence(article.summary, 200)}
                        </p>
                      </div>
                    )}
                    
                    {/* pSEO Content Sections */}
                    {article.pSEO_Content_budget && article.pSEO_Content_budget.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Detailed Analysis</p>
                        {article.pSEO_Content_budget.filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-bold text-white mb-2">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 250)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                        <p className="text-xs text-gray-500 italic">Detailed budget analysis is being prepared. Check back soon for comprehensive financial breakdown.</p>
                      </div>
                    )}
                  </>
                )}

                {/* OTT RELEASE */}
                {pageType === "ott-release" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-purple-500" />
                      OTT Release Details
                    </h3>
                    
                    {/* OTT Data from Article */}
                    <div className="space-y-3 mb-4">
                      {article.ott?.platform && (
                        <div className="p-3 rounded-lg bg-purple-600/20 border border-purple-500/30">
                          <p className="text-[10px] text-purple-400 uppercase mb-1">Streaming Platform</p>
                          <p className="text-lg font-bold text-white">{article.ott.platform}</p>
                          {article.ott.link && (
                            <a 
                              href={article.ott.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              Watch Now <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                      
                      {article.ott?.releaseDate && (
                        <div className="p-3 rounded-lg bg-pink-600/10 border border-pink-500/20">
                          <p className="text-[10px] text-pink-400 uppercase mb-1">OTT Release Date</p>
                          <p className="text-lg font-bold text-white">
                            {new Date(article.ott.releaseDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      )}
                      
                      {article.releaseDate && (
                        <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/20">
                          <p className="text-[10px] text-blue-400 uppercase mb-1">Theatrical Release</p>
                          <p className="text-lg font-bold text-white">{article.releaseDate}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Summary if available */}
                    {article.summary && (
                      <div className="mb-4 pb-4 border-b border-gray-800">
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {getCompleteSentence(article.summary, 200)}
                        </p>
                      </div>
                    )}
                    
                    {/* pSEO Content Sections */}
                    {article.pSEO_Content_ott_release && article.pSEO_Content_ott_release.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Streaming Details & Analysis</p>
                        {article.pSEO_Content_ott_release.filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-bold text-white mb-2">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 250)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                        <p className="text-xs text-gray-500 italic">OTT release details are being updated. Check back soon for complete streaming information.</p>
                      </div>
                    )}
                  </>
                )}

                {/* CAST */}
                {pageType === "cast" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-500" />
                      Cast Analysis
                    </h3>
                    {article.cast && article.cast.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-500 uppercase mb-2">Lead Cast</p>
                        <div className="space-y-2">
                          {article.cast.slice(0, 4).map((actor, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-600/30 to-purple-600/30 flex items-center justify-center flex-shrink-0">
                                <User className="w-3 h-3 text-gray-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white truncate">{actor.name}</p>
                                {actor.role && <p className="text-[10px] text-gray-500 truncate">{actor.role}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {article.pSEO_Content_cast && article.pSEO_Content_cast.length > 1 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-800">
                        <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Key Sections</p>
                        {article.pSEO_Content_cast.slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* REVIEW ANALYSIS */}
                {pageType === "review-analysis" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Review Analysis
                    </h3>
                    {article.rating && (
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-600/20 border border-yellow-500/30">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <div>
                            <p className="text-xl font-bold text-white">{article.rating}</p>
                            <p className="text-[9px] text-yellow-300">/ 10</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {article.pSEO_Content_review_analysis && article.pSEO_Content_review_analysis.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-800">
                        <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Key Sections</p>
                        {article.pSEO_Content_review_analysis.filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* HIT OR FLOP */}
                {pageType === "hit-or-flop" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-red-500" />
                      Verdict Analysis
                    </h3>
                    {article.stats?.verdict && (
                      <div className="mb-3 p-4 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 text-center">
                        <p className="text-[10px] text-red-400 uppercase mb-1">Overall Verdict</p>
                        <p className="text-2xl font-black text-white uppercase">{article.stats.verdict}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {article.budget && (
                        <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-[9px] text-gray-400 uppercase mb-1">Budget</p>
                          <p className="text-sm font-bold text-white">{article.budget}</p>
                        </div>
                      )}
                      {article.boxOffice?.worldwide && (
                        <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-[9px] text-gray-400 uppercase mb-1">Collection</p>
                          <p className="text-sm font-bold text-white">{article.boxOffice.worldwide}</p>
                        </div>
                      )}
                    </div>
                    {article.pSEO_Content_hit_or_flop && article.pSEO_Content_hit_or_flop.length > 1 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-800">
                        <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Key Sections</p>
                        {article.pSEO_Content_hit_or_flop.slice(0, 4).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                            <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ENDING EXPLAINED */}
                {pageType === "ending-explained" && (
                  <>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Ending Explained
                    </h3>
                    {article.pSEO_Content_ending_explained && article.pSEO_Content_ending_explained.length > 0 && (
                      <>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                          {getCompleteSentence(article.pSEO_Content_ending_explained[0].content, 300)}
                        </p>
                        {article.pSEO_Content_ending_explained.length > 1 && (
                          <div className="space-y-3 mt-4 pt-4 border-t border-gray-800">
                            <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Key Sections</p>
                            {article.pSEO_Content_ending_explained.slice(1, 5).map((section, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <p className="text-xs font-bold text-white mb-1">{section.heading}</p>
                                <p className="text-gray-400 text-xs leading-relaxed">{getCompleteSentence(section.content, 180)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
          {/* Main Content Area - Full Width with Horizontal Padding */}
          <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div id="overview-section" className="space-y-12 mt-8">
              {/* Intro Paragraph for sub-pages */}
              {pageType !== "overview" && (
                <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 border-l-4 border-l-red-500">
                  <p className="text-gray-300 leading-relaxed text-base">
                    {article.summary ? 
                      `${article.summary.substring(0, 300)}... This dedicated report focuses specifically on the ${pageType.replace("-", " ")} of ${movieTitle}.` : 
                      `Explore the detailed ${pageType.replace("-", " ")} analysis for ${movieTitle} (${article.releaseYear}).`
                    }
                  </p>
                </div>
              )}

              {/* Overview Page Content */}
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

          {/* Box Office Page - Rich Stats (ONLY show stats, content is already shown in content card) */}
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
              
              {/* Do NOT show pSEO_Content_box_office here - it's already shown in the content card above */}
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

              {/* Hit or Flop FAQs Section - Extract from pSEO_Content_hit_or_flop */}
              {(() => {
                const verdictFaqs = extractFAQsFromSections(article.pSEO_Content_hit_or_flop);
                
                // Get non-FAQ sections for hit-or-flop (exclude FAQ sections and Q&A heading sections)
                const nonFaqSections = (article.pSEO_Content_hit_or_flop || []).filter(section => {
                  // Exclude sections with FAQ in heading
                  if (section.heading?.toLowerCase().includes('faq')) return false;
                  
                  // Exclude sections where heading is a question (Q1:, Q2:, **Q1:**, etc.)
                  if (/^[\*\s]*(Q\.?\s*\d+[:\.]?)/i.test(section.heading || '')) return false;
                  
                  // Exclude sections with Q&A patterns in content
                  if (section.content?.includes('**Q') || 
                      section.content?.includes('Q1:') ||
                      /^\s*\d+\.\s+\*\*/.test(section.content)) return false;
                  
                  // Keep this section (it's regular content, not FAQ)
                  return true;
                });
                
                return (
                  <>
                    {/* Non-FAQ Content Sections */}
                    {nonFaqSections.length > 0 && (
                      <div className="space-y-8 mb-12">
                        {nonFaqSections.map((section, idx) => (
                          <div key={idx}>
                            <h3 className="text-xl font-bold text-white mb-4">{section.heading}</h3>
                            <div className="space-y-4">
                              {section.content?.split('\n\n').map((para, i) => (
                                <p key={i} className="text-zinc-400 leading-relaxed">{para}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* FAQ Section */}
                    {verdictFaqs.length > 0 && (
                      <div className="mt-12 pt-8 border-t border-gray-800">
                        {/* FAQ Header */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg shadow-red-900/30">
                              <HelpCircle className="w-5 h-5 text-white" />
                            </span>
                            Frequently Asked Questions
                          </h3>
                          <span className="text-xs font-medium text-gray-400 bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700">{verdictFaqs.length} questions</span>
                        </div>
                        
                        {/* FAQ Container Card */}
                        <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#1a1a2e]/40 to-[#1a1a2e]/20 p-6 backdrop-blur-sm">
                          <div className="space-y-3">
                            {verdictFaqs.map((faq, i) => (
                              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </section>
          )}

          {/* Generic Content Sections - Sub-pages only */}
          {sections && sections.length > 0 && pageType !== "cast" && pageType !== "overview" && pageType !== "hit-or-flop" && (
            <div className="space-y-12 mt-12">
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

          {/* Dynamic Recommendations Section - Infinite Loop Scroll */}
          {dynamicRecommendations && dynamicRecommendations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" /> 
                  {dynamicRecommendations.some(m => m.trendingScore) ? 'Trending Now' : 'Recommended for You'}
                </h2>
                <span className="text-xs text-gray-500">{dynamicRecommendations.length} titles</span>
              </div>
              
              {/* Scroll Container with Arrows */}
              <div className="relative group/scroll">
                {/* Left Arrow - Transparent */}
                <button 
                  onClick={() => {
                    const container = document.getElementById('recommendations-scroll');
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full flex items-center justify-center bg-gradient-to-r from-gray-950/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300"
                >
                  <svg className="w-6 h-6 text-white/70 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Scrollable Container with Infinite Loop */}
                <div 
                  id="recommendations-scroll"
                  className="flex gap-2 overflow-x-auto scroll-smooth px-1 no-scrollbar"
                  onScroll={(e) => {
                    const container = e.target;
                    const scrollLeft = container.scrollLeft;
                    const scrollWidth = container.scrollWidth;
                    const clientWidth = container.clientWidth;
                    
                    // Infinite loop logic
                    if (scrollLeft <= 0) {
                      // Jump to end when reaching start
                      container.scrollLeft = scrollWidth / 2;
                    } else if (scrollLeft + clientWidth >= scrollWidth - 1) {
                      // Jump to middle when reaching end
                      container.scrollLeft = scrollWidth / 4;
                    }
                  }}
                >
                  {/* Triple the items for seamless infinite loop */}
                  {[...dynamicRecommendations, ...dynamicRecommendations, ...dynamicRecommendations].map((movie, idx) => {
                    const movieCategory = movie.category?.toLowerCase() || 'bollywood';
                    const movieUrl = `${categoryUrlMap[movieCategory] || '/category/bollywood'}/${movie.slug}`;
                    
                    return (
                      <Link key={`rec-${idx}`} href={movieUrl} className="flex-shrink-0 w-[120px] group">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="relative rounded-md overflow-hidden bg-gray-900/80 border border-gray-800/50 hover:border-yellow-500/50 transition-all duration-200"
                        >
                          {/* Compact Poster */}
                          <div className="aspect-[2/3] relative overflow-hidden">
                            {movie.coverImage ? (
                              <img 
                                src={movie.coverImage} 
                                alt={movie.movieTitle || movie.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Film className="w-5 h-5 text-gray-700" />
                              </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            
                            {/* Trending Badge - Top Left */}
                            {movie.trendingScore && (
                              <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-red-600/90 backdrop-blur-sm flex items-center gap-0.5">
                                <Zap className="w-2 h-2 text-white" />
                                <span className="text-[7px] font-bold text-white">T</span>
                              </div>
                            )}
                            
                            {/* Rating Badge - Top Right */}
                            {movie.rating && (
                              <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 backdrop-blur-sm flex items-center gap-0.5">
                                <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                                <span className="text-[8px] font-semibold text-white">{movie.rating}</span>
                              </div>
                            )}
                            
                            {/* Category Badge - Bottom (Changed to Amber/Yellow) */}
                            {movie.category && (
                              <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-amber-600/90 backdrop-blur-sm">
                                <span className="text-[7px] font-bold text-white">{movie.category}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Compact Info */}
                          <div className="p-1.5">
                            <h4 className="text-[10px] font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-1 leading-tight mb-0.5">
                              {movie.movieTitle || movie.title}
                            </h4>
                            <div className="flex items-center justify-between gap-1">
                              {movie.releaseYear && (
                                <span className="text-[8px] text-gray-500">{movie.releaseYear}</span>
                              )}
                              {movie.trendingScore && (
                                <span className="text-[7px] text-red-400 font-medium">⚡{movie.trendingScore}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Right Arrow - Transparent */}
                <button 
                  onClick={() => {
                    const container = document.getElementById('recommendations-scroll');
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-full flex items-center justify-center bg-gradient-to-l from-gray-950/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300"
                >
                  <svg className="w-6 h-6 text-white/70 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
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