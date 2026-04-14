import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { slugify } from "@/lib/slugify";
import { motion } from "framer-motion";
import { 
  FileText, Clock, User, ChevronRight, Share2, ThumbsUp, Eye, ArrowLeft, 
  Quote, CheckCircle, Clapperboard, Film, Tv, PlaySquare, TrendingUp, 
  Users, Zap, Target, BookOpen, Award, BarChart3, ShieldCheck, Heart, 
  MessageSquare, Bookmark, Check, DollarSign, List, Info, HelpCircle, Calendar, Globe,
  ChevronDown, Star, ExternalLink, Sparkles, Tag
} from "lucide-react";
import ErrorState from "../../components/common/ErrorState";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // The slug can be a main movie slug or a sub-page slug
    // We look for articles where the slug is a prefix of the requested slug
    // or a direct match.
    const res = await fetch(`${baseUrl}/api/articles/get-by-slug?slug=${slug}`);
    const data = await res.json();

    if (!res.ok || !data.data) {
      return { 
        props: { 
          article: null,
          slug
        } 
      };
    }

    const article = data.data;
    let pageType = "overview"; // Default page type

    // Determine sub-page type from the slug suffix
    if (slug.endsWith("-ending-explained")) pageType = "ending-explained";
    else if (slug.endsWith("-box-office")) pageType = "box-office";
    else if (slug.endsWith("-budget")) pageType = "budget";
    else if (slug.endsWith("-ott-release")) pageType = "ott-release";
    else if (slug.endsWith("-cast")) pageType = "cast";
    else if (slug.endsWith("-review-analysis")) pageType = "review-analysis";
    else if (slug.endsWith("-hit-or-flop")) pageType = "hit-or-flop";

    return {
      props: {
        article,
        pageType,
        slug,
      },
    };
  } catch (error) {
    console.error("Error fetching article for pSEO:", error);
    return { notFound: true };
  }
}

const pageTitles = {
  overview: "Full Analysis, Box Office & OTT Details",
  "ending-explained": "Ending Explained & Hidden Meanings",
  "box-office": "Box Office Collection & Financial Report",
  budget: "Budget, Production Costs & Profit Analysis",
  "ott-release": "OTT Release Date & Streaming Platform Details",
  cast: "Cast, Characters & Performance Analysis",
  "review-analysis": "Critical Review & Audience Reaction Analysis",
  "hit-or-flop": "Hit or Flop? Verdict & Performance Analysis",
};

// Dynamic FAQ Generator Function
const categoryIcons = {
  Bollywood: Clapperboard,
  Hollywood: Film,
  WebSeries: Tv,
  OTT: PlaySquare,
  BoxOffice: TrendingUp,
  Celebrities: Users,
};

// Utility function to extract complete sentences without cutting mid-word
function getCompleteSentence(text, maxLength = 300) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastBoundary = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastBoundary > maxLength * 0.5) {
    return text.substring(0, lastBoundary + 1);
  }
  
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
  
  for (const section of sections) {
    if (section.heading?.toLowerCase().includes('faq') || 
        section.content?.includes('Q1:') || 
        section.content?.includes('**Q')) {
      const parsed = parseFAQsFromContent(section.content);
      if (parsed.length > 0) return parsed;
    }
  }
  
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
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-red-400' : ''}`} 
        />
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

export default function MovieDetailPage({ article, pageType, slug }) {
  const router = useRouter();

  if (!article) {
    return (
      <ErrorState 
        type="movie" 
        title="Intelligence Data Unavailable" 
        description="We couldn't find the requested movie intelligence report in our database. It may be under review or scheduled for automation."
      />
    );
  }

  // Map category slug to actual page URL
  const categoryUrlMap = {
    'boxoffice': '/category/box-office',
    'bollywood': '/category/bollywood',
    'hollywood': '/category/hollywood',
    'webseries': '/category/webseries',
    'ott': '/category/ott',
    'celebrity': '/category/celebrity'
  };
  const categoryPageUrl = categoryUrlMap[article.category?.toLowerCase()] || `/category/${article.category?.toLowerCase() || 'bollywood'}`;

  const Icon = categoryIcons[article.category] || FileText;
  const [scrollProgress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Mark this page to skip PublicLayout padding
  MovieDetailPage.noPadding = true;

  useEffect(() => {
    if (article) {
      console.log("🎬 Movie Data from API:", article);
    }
  }, [article]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      setIsLiked(likedArticles.includes(article?._id));
      setIsSaved(savedArticles.includes(article?._id));

      // --- Record Movie Page View ---
      if (article?.slug) {
        fetch("/api/public/record-article-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: article.slug })
        }).catch(err => console.error("Failed to record view:", err));
      }
    }
  }, [article?._id, article?.slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    if (typeof window !== "undefined") {
      const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
      let newLiked;
      if (isLiked) {
        newLiked = likedArticles.filter(id => id !== article._id);
      } else {
        newLiked = [...likedArticles, article._id];
      }
      localStorage.setItem("liked_articles", JSON.stringify(newLiked));
      setIsLiked(!isLiked);
    }
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      let newSaved;
      if (isSaved) {
        newSaved = savedArticles.filter(id => id !== article._id);
      } else {
        newSaved = [...savedArticles, article._id];
      }
      localStorage.setItem("saved_articles", JSON.stringify(newSaved));
      setIsSaved(!isSaved);
    }
  };

  if (!article) return null;

  const movieTitle = article.movieTitle || article.title;
  const releaseYear = article.releaseYear ? `(${article.releaseYear})` : "";
  const pageTitleSuffix = pageTitles[pageType] || pageTitles.overview;
  const fullTitle = `${movieTitle} Movie ${releaseYear} – ${pageTitleSuffix}`;

  return (
    <>
      <Head>
        <title>{fullTitle} | FilmyFire Intelligence</title>
        <meta name="description" content={article.meta?.description || article.summary?.substring(0, 160)} />
        <link rel="canonical" href={`https://filmyfire.com/movie/${slug}`} />
        
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Movie",
              "name": article.movieTitle,
              "datePublished": article.releaseYear,
              "description": article.summary,
              "director": article.director?.map(d => ({ "@type": "Person", "name": d })),
              "actor": article.cast?.map(c => ({ "@type": "Person", "name": c.name })),
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": article.stats?.rating || "4.5",
                "reviewCount": article.stats?.views || "1000"
              }
            })
          }}
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
              {article.movieTitle} – {pageType.replace("-", " ")}
            </h2>

            <div className="w-12 md:w-16 flex-shrink-0"></div>
          </div>
        </nav>

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
              alt={article.movieTitle}
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

          {/* Content Container - Aligned Left */}
          <div className="relative h-full flex items-center z-10">
            <div className="max-w-7xl w-full mx-auto px-6 py-16 md:py-20">
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-8 md:gap-10 items-start"
              >
                {/* Movie Poster - Much Larger, Left Aligned */}
                <motion.div 
                  initial={{ x: -30, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                  className="flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72"
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
                          alt={article.movieTitle}
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

                {/* Movie Info - Left Aligned with Varied Sizes */}
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex-1 min-w-0"
                >
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white text-[11px] font-semibold"
                    >
                      <Target className="w-3 h-3" />
                      {article.category}
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

                  {/* Title - Much Larger & Highlighted */}
                  <motion.h1 
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 drop-shadow-2xl"
                    style={{
                      textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(239,68,68,0.3)'
                    }}
                  >
                    {movieTitle}
                  </motion.h1>

                  {/* Meta Info */}
                  <motion.div 
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 mb-3"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {article.releaseYear}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {article.runtime || "2h 45m"}
                    </span>
                  </motion.div>

                  {/* Genres */}
                  {article.genres && (
                    <motion.div 
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="flex flex-wrap gap-1.5 mb-4"
                    >
                      {article.genres.map((genre, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-gray-800/80 text-[11px] font-medium border border-gray-600">
                          {genre}
                        </span>
                      ))}
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
                      <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                        {article.summary}
                      </p>
                    )}

                    {/* BOX OFFICE */}
                    {pageType === "box-office" && (
                      <div className="space-y-3 max-w-2xl">
                        <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Box Office Collection</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {article.stats?.worldwide || article.boxOffice?.worldwide ? (
                            <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Worldwide</p>
                              <p className="text-base font-bold text-white">{article.stats?.worldwide || article.boxOffice?.worldwide}</p>
                            </div>
                          ) : null}
                          {article.stats?.indiaNet ? (
                            <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">India Net</p>
                              <p className="text-base font-bold text-white">{article.stats.indiaNet}</p>
                            </div>
                          ) : null}
                          {article.stats?.overseas ? (
                            <div className="p-3 rounded-lg bg-cyan-600/20 border border-cyan-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Overseas</p>
                              <p className="text-base font-bold text-white">{article.stats.overseas}</p>
                            </div>
                          ) : null}
                          {article.stats?.openingDay ? (
                            <div className="p-3 rounded-lg bg-purple-600/20 border border-purple-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Opening Day</p>
                              <p className="text-base font-bold text-white">{article.stats.openingDay}</p>
                            </div>
                          ) : null}
                          {article.stats?.openingWeekend ? (
                            <div className="p-3 rounded-lg bg-pink-600/20 border border-pink-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">Opening Weekend</p>
                              <p className="text-base font-bold text-white">{article.stats.openingWeekend}</p>
                            </div>
                          ) : null}
                          {article.stats?.firstWeek ? (
                            <div className="p-3 rounded-lg bg-orange-600/20 border border-orange-500/30">
                              <p className="text-[9px] text-gray-400 uppercase mb-1">First Week</p>
                              <p className="text-base font-bold text-white">{article.stats.firstWeek}</p>
                            </div>
                          ) : null}
                        </div>
                        {article.stats?.verdict && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/40">
                            <span className="text-sm font-black text-red-300 uppercase">{article.stats.verdict}</span>
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
                              <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-blue-400" />
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
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {article.summary || `Complete ending explanation and hidden meanings for ${movieTitle}.`}
                        </p>
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
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-600/20 border border-yellow-500/30">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <div>
                              <p className="text-2xl font-bold text-white">{article.rating || "N/A"}</p>
                              <p className="text-[9px] text-yellow-300">IMDb / 10</p>
                            </div>
                          </div>
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
                        {article.summary && (
                          <p className="text-gray-300 text-sm leading-relaxed">{article.summary}</p>
                        )}
                      </div>
                    )}

                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content Section - Left/Right Split Layout */}
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
          
          {/* Top Grid - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Left Side - Movie Details + Quick Nav */}
            <div className="lg:col-span-4 space-y-6">
              {/* Movie Stats Card - Dynamic Data */}
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
                  {/* Dynamic Views, Likes, Shares */}
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

              {/* Movie Details Card - Enhanced */}
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
                  ].map((link, idx) => {
                    const IconComponent = link.icon;
                    const isActive = (pageType === "overview" && link.suffix === "") || (pageType !== "overview" && link.suffix === `-${pageType}`);
                    return (
                      <motion.div key={idx} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link 
                          href={`/movie/${article.slug}${link.suffix}`}
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
                  
                  {/* OTT Link - Goes to Actual OTT Page */}
                  {article.ott?.platform && (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link 
                        href={`/ott/${slugify(article.ott.platform)}/${article.slug}`}
                        className="block p-2.5 rounded-lg text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-gray-300 hover:border-purple-500/50 hover:text-white transition-all"
                      >
                        <Tv className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <span className="text-[10px] font-semibold block">OTT</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Side - Related Movies + Content Preview */}
            <div className="lg:col-span-8 space-y-6">
              {/* Trending + Movie DNA Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trending Score - Dynamic */}
                {article.trendingScore > 0 && (
                  <motion.div 
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-xl bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-700/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase mb-1">Trending Score</p>
                        <p className="text-2xl font-black text-white">{article.trendingScore}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                      Last synced: {article.lastTrendingSync ? new Date(article.lastTrendingSync).toLocaleDateString() : 'Never'}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Crew Section - Dynamic - Deduplicated - Only on overview */}
              {pageType === "overview" && (article.director?.length > 0 || article.producer?.length > 0 || article.writer?.length > 0) && (
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
                    {/* Build deduplicated crew list */}
                    {(() => {
                      const seen = new Set();
                      const uniqueCrew = [];
                      
                      // Add directors first
                      article.director?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) {
                          seen.add(name.toLowerCase());
                          uniqueCrew.push({ name, role: 'Director', slug: null });
                        }
                      });
                      
                      // Add producers
                      article.producer?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) {
                          seen.add(name.toLowerCase());
                          uniqueCrew.push({ name, role: 'Producer', slug: null });
                        }
                      });
                      
                      // Add writers
                      article.writer?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) {
                          seen.add(name.toLowerCase());
                          uniqueCrew.push({ name, role: 'Writer', slug: null });
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

              {/* Related Movies - Enhanced */}
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  Similar Movies
                </h3>
                
                {article.relatedMovies && article.relatedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {article.relatedMovies.slice(0, 5).map((movie, idx) => (
                      <Link key={idx} href={`/movie/${movie.slug}`} className="group block">
                        <motion.div 
                          whileHover={{ y: -3 }}
                          className="rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all"
                        >
                          {movie.coverImage ? (
                            <img 
                              src={movie.coverImage} 
                              alt={movie.movieTitle}
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-800 flex items-center justify-center">
                              <Film className="w-8 h-8 text-gray-600" />
                            </div>
                          )}
                          <div className="p-2">
                            <h4 className="text-[11px] font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                              {movie.movieTitle}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-[10px] text-gray-500">{movie.releaseYear}</p>
                              {movie.similarityScore && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-semibold">
                                  {movie.similarityScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/discover/similar-to/${article.slug}`} className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-xs font-semibold text-gray-400 hover:text-white hover:border-red-500/50 transition-all">
                      Discover Similar
                    </Link>
                    {article.genres?.slice(0, 3).map(genre => (
                      <Link key={genre} href={`/discover/genre/${slugify(genre)}`} className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-xs font-semibold text-gray-400 hover:text-white hover:border-red-500/50 transition-all">
                        {genre}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Tags - Dynamic */}
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
                    {article.tags.map((tag, idx) => {
                      // Smart tag routing
                      const tagLower = tag.toLowerCase();
                      
                      // Category tags → go to category page
                      if (["bollywood", "hollywood", "ott", "webseries", "boxoffice", "celebrities"].includes(tagLower)) {
                        const categoryUrlMap = {
                          'boxoffice': '/category/box-office',
                          'bollywood': '/category/bollywood',
                          'hollywood': '/category/hollywood',
                          'webseries': '/category/webseries',
                          'ott': '/category/ott',
                          'celebrities': '/category/celebrity'
                        };
                        const targetUrl = categoryUrlMap[tagLower] || `/category/${tagLower}`;
                        return (
                          <Link key={idx} href={targetUrl} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 text-xs text-red-400 hover:text-white hover:border-red-500/50 transition-all">
                            #{tag}
                          </Link>
                        );
                      }
                      
                      // Platform tags → go to OTT platform page
                      if (["netflix", "prime video", "prime", "disney+ hotstar", "disney+hotstar", "hotstar", "jio cinema", "jiocinema", "zee5", "sonyliv", "voot", "mx player", "ullu"].includes(tagLower)) {
                        return (
                          <Link key={idx} href={`/ott/${slugify(tag)}`} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-xs text-purple-400 hover:text-white hover:border-purple-500/50 transition-all">
                            #{tag}
                          </Link>
                        );
                      }
                      
                      // Other tags → go to discover page
                      return (
                        <Link key={idx} href={`/discover/tag/${slugify(tag)}`} className="px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all">
                          #{tag}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Movie Overview Preview - Enhanced */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-800 p-5"
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-red-500" />
                  Quick Summary
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                  {article.summary || `${movieTitle} is a ${article.genres?.join(", ")} feature.`}
                </p>
                {article.genreAnalysis && (
                  <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">
                    "{article.genreAnalysis}"
                  </p>
                )}
                <Link 
                  href={`/movie/${article.slug}`}
                  className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                >
                  Read Full Analysis <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Main Content Area */}
          <div id="overview-section" className="space-y-12">
              {/* Intro Paragraph for ALL pages */}
              {pageType !== "overview" && (
                <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700 border-l-4 border-l-red-500">
                  <p className="text-gray-300 leading-relaxed text-base">
                    {article.summary ? 
                      `${article.summary.substring(0, 300)}... This dedicated report focuses specifically on the ${pageType.replace("-", " ")} of ${movieTitle}.` : 
                      `Explore the detailed ${pageType.replace("-", " ")} analysis for ${movieTitle} (${article.releaseYear}). Our film intelligence team has dissected every aspect of this ${article.category} feature to bring you exclusive insights.`
                    }
                  </p>
                </div>
              )}

              {pageType === "box-office" && (
                <>
                  {/* Hero Stats - Opening Weekend Focus */}
                  <section id="boxoffice-section" className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <TrendingUp className="w-7 h-7 text-green-500" /> 
                      Box Office Performance
                    </h2>
                    
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* Worldwide Total */}
                      <div className="relative group p-6 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-500/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <DollarSign className="w-5 h-5 text-green-400" />
                          </div>
                          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Worldwide Total</span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">
                          {article.stats?.worldwide || article.boxOffice?.worldwide || "N/A"}
                        </div>
                        <div className="text-xs text-green-300/80">Lifetime Collection</div>
                      </div>

                      {/* India Net */}
                      <div className="relative group p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <Target className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">India Net</span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">
                          {article.stats?.indiaNet || "N/A"}
                        </div>
                        <div className="text-xs text-blue-300/80">Domestic Collection</div>
                      </div>

                      {/* Opening Day */}
                      <div className="relative group p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <Zap className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Opening Day</span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">
                          {article.stats?.openingDay || "N/A"}
                        </div>
                        <div className="text-xs text-purple-300/80">First Day Business</div>
                      </div>
                    </div>

                    {/* Extended Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Opening Weekend", value: article.stats?.openingWeekend, icon: Calendar, color: "orange" },
                        { label: "First Week", value: article.stats?.firstWeek, icon: Clock, color: "blue" },
                        { label: "Overseas Total", value: article.stats?.overseas, icon: Globe, color: "cyan" },
                        { label: "Budget vs Revenue", value: article.budget ? `ROI: ${(parseInt(article.stats?.worldwide) / parseInt(article.budget)).toFixed(1)}x` : "N/A", icon: BarChart3, color: "green" }
                      ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                          <div key={idx} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <div className="text-lg font-bold text-white">{stat.value || "N/A"}</div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Collection Breakdown Timeline */}
                  <section className="mb-12">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-red-600" />
                      Collection Breakdown
                    </h3>
                    <div className="space-y-6">
                      {/* Territorial Breakdown */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Territorial Distribution</h4>
                        <div className="space-y-4">
                          {[
                            { region: "Mumbai Circuit", percentage: 25, amount: article.stats?.mumbai },
                            { region: "Delhi/UP", percentage: 20, amount: article.stats?.delhiUP },
                            { region: "East Punjab", percentage: 15, amount: article.stats?.eastPunjab },
                            { region: "Rajasthan", percentage: 12, amount: article.stats?.rajasthan },
                            { region: "CP Berar", percentage: 10, amount: article.stats?.cpBerar },
                            { region: "Nizam/AP", percentage: 18, amount: article.stats?.nizamAP }
                          ].map((region, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-xs mb-2">
                                <span className="text-zinc-300 font-medium">{region.region}</span>
                                <span className="text-zinc-400">{region.amount || `${region.percentage}%`}</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-1000"
                                  style={{ width: `${region.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Overseas Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" /> Overseas Markets
                          </h4>
                          <div className="space-y-3">
                            {[
                              { market: "UAE/GCC", amount: article.stats?.uaeGcc },
                              { market: "USA/Canada", amount: article.stats?.usaCanada },
                              { market: "UK/Europe", amount: article.stats?.ukEurope },
                              { market: "Australia", amount: article.stats?.australia }
                            ].map((market, idx) => (
                              <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                <span className="text-sm text-zinc-400">{market.market}</span>
                                <span className="text-sm font-bold text-white">{market.amount || "N/A"}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Verdict */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-red-400" /> Box Office Verdict
                          </h4>
                          <div className="text-center py-8">
                            <div className="inline-block px-6 py-3 rounded-full bg-red-600/20 border border-red-500/30 mb-4">
                              <span className="text-2xl font-black text-red-400 uppercase tracking-widest">
                                {article.stats?.verdict || "Average"}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              Based on collection trends and recovery percentage
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Analysis Section */}
                  <section>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      Trade Analysis
                    </h3>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-zinc-300 leading-relaxed text-base mb-6">
                        {article.summary || "Trade analysis coming soon."}
                      </p>
                      {article.sections?.map((section, idx) => (
                        <div key={idx} className="mb-6 last:mb-0">
                          <h4 className="text-lg font-bold text-white mb-3">{section.heading}</h4>
                          <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
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
                          <Link href={`/movie/${article.slug}-ending-explained`} className="text-red-500 hover:underline mx-1 font-semibold">
                            {movieTitle} Ending Explained
                          </Link> page.
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Box Office & Budget Sections */}
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
                        <p className="text-3xl font-bold text-white">{article.boxOffice?.worldwide || "TBA"}</p>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          The global theatrical run has shown impressive resilience. 
                          <Link href={`/movie/${article.slug}-box-office`} className="text-green-500 hover:underline mx-1 font-semibold">
                            Full Financial Report
                          </Link>
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30"
                    >
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-blue-500" /> Budget
                      </h2>
                      <div className="space-y-3">
                        <p className="text-3xl font-bold text-white">{article.budget || "TBA"}</p>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          Production scale and marketing investments were significant. 
                          <Link href={`/movie/${article.slug}-budget`} className="text-blue-500 hover:underline mx-1 font-semibold">
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
                    className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                  >
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
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600/30 to-purple-600/30 flex items-center justify-center border border-gray-600">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{actor.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{actor.role || "Lead Role"}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Link href={`/movie/${article.slug}-cast`} className="text-red-500 text-sm font-semibold hover:underline flex items-center gap-1">
                      View Full Cast & Performance Analysis <ChevronRight className="w-4 h-4" />
                    </Link>
                  </motion.div>

                  {/* Audience Reaction Section */}
                  <motion.div 
                    whileHover={{ y: -3 }}
                    className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <ThumbsUp className="w-6 h-6 text-red-500" /> Audience Reaction
                    </h2>
                    <p className="text-gray-400 leading-relaxed mb-6">
                      {article.criticalResponse || `Audience and critical reception has been a major point of discussion. The film's unique narrative approach and technical brilliance have received praise from industry experts.`}
                    </p>
                    <Link href={`/movie/${article.slug}-review-analysis`} className="text-red-500 text-sm font-semibold hover:underline flex items-center gap-1">
                      See Critical Review Analysis <ChevronRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.section>
              )}

              {/* Page-Specific Content Renderer with FAQ Support */}
              {pageType !== "overview" && (() => {
                const contentKey = `pSEO_Content_${pageType.replace(/-/g, "_")}`;
                const pageContent = article[contentKey];
                
                if (!pageContent || pageContent.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">Content for this section is being updated.</p>
                    </div>
                  );
                }
                
                // Extract page-specific FAQs
                const pageFaqs = extractFAQsFromSections(pageContent);
                
                return (
                  <div className="space-y-12">
                    {/* Regular Content Sections (excluding FAQ sections) */}
                    {pageContent
                      .filter(section => {
                        const isFAQSection = section.heading?.toLowerCase().includes('faq') || 
                                            section.content?.includes('**Q') || 
                                            section.content?.includes('Q1:');
                        return !isFAQSection;
                      })
                      .map((section, idx) => (
                        <motion.section
                          key={idx}
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5 }}
                          className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                        >
                          <h2 className="text-2xl font-black text-white mb-6">{section.heading}</h2>
                          <div className="space-y-4">
                            {cleanContent(section.content).split('\n\n').filter(p => p.trim()).map((para, pIdx) => (
                              <p key={pIdx} className="text-zinc-400 leading-relaxed text-lg">{para}</p>
                            ))}
                          </div>
                        </motion.section>
                      ))}
                    
                    {/* Page-Specific FAQ Section */}
                    {pageFaqs.length > 0 && (
                      <motion.section
                        initial={{ opacity: 0, y: 40 }}
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
                          <span className="text-xs font-medium text-gray-400 bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700">{pageFaqs.length} questions</span>
                        </div>
                        
                        {/* FAQ Container Card */}
                        <div className="rounded-2xl border border-gray-800/80 bg-gradient-to-b from-[#1a1a2e]/40 to-[#1a1a2e]/20 p-6 backdrop-blur-sm">
                          <div className="space-y-3">
                            {pageFaqs.map((faq, i) => (
                              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
                            ))}
                          </div>
                        </div>
                      </motion.section>
                    )}
                  </div>
                );
              })()}

              {/* Internal Linking Section (Auto) - Ranking Backbone */}
              <div className="mt-20 pt-12 border-t border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <Target className="w-6 h-6 text-red-500" /> Explore More
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Movie -> Cast */}
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Cast Intelligence
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.cast?.slice(0, 5).map((actor, idx) => (
                        <Link 
                          key={idx} 
                          href={`/celebrity/${slugify(actor.name)}`}
                          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all"
                        >
                          {actor.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Movie -> Genre */}
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clapperboard className="w-4 h-4" /> Genre Network
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.genres?.map((genre, idx) => (
                        <Link 
                          key={idx} 
                          href={categoryPageUrl}
                          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all"
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Movie -> OTT */}
                  {article.ott?.platform && (
                    <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Tv className="w-4 h-4" /> Streaming Hub
                      </h3>
                      <Link 
                        href={`/ott/${slugify(article.ott.platform)}`}
                        className="inline-block px-4 py-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 text-sm font-semibold hover:bg-red-600 hover:text-white transition-all"
                      >
                        Watch on {article.ott.platform}
                      </Link>
                    </div>
                  )}

                  {/* Movie -> Similar */}
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Similar Movies
                    </h3>
                    <Link 
                      href={`/discover/similar-to/${article.slug}`}
                      className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      Browse Movies Like {movieTitle}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>


        </main>
      </div>
    </>
  );
}