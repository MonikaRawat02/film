"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { slugify } from "@/lib/slugify";
import {
  FileText, Clock, User, ChevronRight, Share2, ThumbsUp, Eye, ArrowLeft,
  Clapperboard, Film, Tv, PlaySquare, TrendingUp,
  Users, Zap, Target, BookOpen, Award, BarChart3, ShieldCheck,
  Heart, Bookmark, Check, DollarSign, List, Info, HelpCircle, Calendar, Globe,
  ChevronDown, Star, ExternalLink, Sparkles, Tag
} from "lucide-react";
import ErrorState from "../../../components/common/ErrorState";

export async function getServerSideProps(context) {
  const { platform } = context.params;
  const fullSlug = context.params.slug;

  // Join the catch-all segments into one slug string
  // e.g. ["astronomy-club-the-sketch-show-box-office"] or ["astronomy-club-the-sketch-show"]
  const slugString = fullSlug.join('/');

  // Determine pageType by suffix — same pattern as movie/[slug].jsx
  let pageType = 'overview';
  let movieSlug = slugString;

  if (slugString.endsWith('-ending-explained')) {
    pageType = 'ending-explained';
    movieSlug = slugString.replace(/-ending-explained$/, '');
  } else if (slugString.endsWith('-box-office')) {
    pageType = 'box-office';
    movieSlug = slugString.replace(/-box-office$/, '');
  } else if (slugString.endsWith('-budget')) {
    pageType = 'budget';
    movieSlug = slugString.replace(/-budget$/, '');
  } else if (slugString.endsWith('-ott-release')) {
    pageType = 'ott-release';
    movieSlug = slugString.replace(/-ott-release$/, '');
  } else if (slugString.endsWith('-cast')) {
    pageType = 'cast';
    movieSlug = slugString.replace(/-cast$/, '');
  } else if (slugString.endsWith('-review-analysis')) {
    pageType = 'review-analysis';
    movieSlug = slugString.replace(/-review-analysis$/, '');
  } else if (slugString.endsWith('-hit-or-flop')) {
    pageType = 'hit-or-flop';
    movieSlug = slugString.replace(/-hit-or-flop$/, '');
  }

  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/get-by-slug?slug=${movieSlug}`);
    const data = await res.json();
    const notFound = !res.ok || !data?.data;
    const article = notFound ? null : data.data;

    let contentSections = [];
    let metaTitleSuffix = '';
    let metaDescription = article?.summary?.substring(0, 160) || "";

    switch (pageType) {
      case 'overview':
        contentSections = article?.sections || [];
        metaTitleSuffix = 'Full Analysis, Box Office & OTT Details';
        break;
      case 'ending-explained':
        contentSections = article?.pSEO_Content_ending_explained || [];
        metaTitleSuffix = 'Ending Explained, Theories & Hidden Meanings';
        metaDescription = article?.pSEO_Content_ending_explained?.[0]?.content?.substring(0, 160) || metaDescription;
        break;
      case 'box-office':
        contentSections = article?.pSEO_Content_box_office || [];
        metaTitleSuffix = 'Box Office Collection, Budget & Verdict';
        metaDescription = article?.pSEO_Content_box_office?.[0]?.content?.substring(0, 160) || metaDescription;
        break;
      case 'budget':
        contentSections = article?.pSEO_Content_budget || [];
        metaTitleSuffix = 'Budget, Production Cost & Profit Analysis';
        metaDescription = article?.pSEO_Content_budget?.[0]?.content?.substring(0, 160) || metaDescription;
        break;
      case 'ott-release':
        contentSections = article?.pSEO_Content_ott_release || [];
        metaTitleSuffix = 'OTT Release Date, Platform & Rights';
        metaDescription = article?.pSEO_Content_ott_release?.[0]?.content?.substring(0, 160) || metaDescription;
        break;
      case 'cast':
        contentSections = article?.pSEO_Content_cast || [];
        metaTitleSuffix = 'Cast, Characters & Performance Analysis';
        metaDescription = article?.pSEO_Content_cast?.[0]?.content?.substring(0, 160) || metaDescription;
        break;
      case 'review-analysis':
        contentSections = article?.pSEO_Content_review_analysis || [];
        metaTitleSuffix = 'Review Analysis, Critical & Audience Reception';
        metaDescription = article?.pSEO_Content_review_analysis?.[0]?.content?.substring(0, 160) || metaDescription;
        break;
      case 'hit-or-flop':
        contentSections = article?.pSEO_Content_hit_or_flop || [];
        metaTitleSuffix = 'Hit or Flop Verdict & Box Office Performance';
        metaDescription = article?.pSEO_Content_hit_or_flop?.[0]?.content?.substring(0, 160) || metaDescription;
        break;
      default:
        contentSections = article?.sections || [];
        metaTitleSuffix = 'Full Analysis, Box Office & OTT Details';
    }

    return {
      props: { article, platform, movieSlug, pageType, contentSections, metaTitleSuffix, metaDescription, notFound },
    };
  } catch (error) {
    return {
      props: {
        article: null, platform, movieSlug, pageType: 'overview',
        contentSections: [], metaTitleSuffix: '', metaDescription: '', notFound: true,
      },
    };
  }
}

const pageTitles = {
  overview: "Full Analysis, Box Office & OTT Details",
  "ending-explained": "Ending Explained, Theories & Hidden Meanings",
  "box-office": "Box Office Collection, Budget & Verdict",
  budget: "Budget, Production Cost & Profit Analysis",
  "ott-release": "OTT Release Date, Platform & Rights",
  cast: "Cast, Characters & Performance Analysis",
  "review-analysis": "Review Analysis, Critical & Audience Reception",
  "hit-or-flop": "Hit or Flop Verdict & Box Office Performance",
};

// Parse FAQs from content with multiple format support
function parseFAQsFromContent(content) {
  if (!content) return [];
  const faqs = [];
  
  // Method 1: Split by **Q patterns
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
  
  // Method 2: Parse "**Q: Question?**\nA: Answer" format
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

// Truncate text at first complete sentence (at first period/full stop)
function truncateAtSentence(text, maxLength = 150) {
  if (!text) return text;
  
  // Find the first period to show complete first sentence
  const firstPeriod = text.indexOf('.');
  
  // If we found a period, return text up to and including it
  if (firstPeriod > 0) {
    return text.substring(0, firstPeriod + 1);
  }
  
  // If no period found, return the full text
  return text;
}

function FAQDropdown({ faqs, loading }) {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700 animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!faqs.length) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="faq-item rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-red-500/30 transition-all duration-300 overflow-hidden"
        >
          <button
            onClick={() => toggleFAQ(idx)}
            className="w-full px-6 py-5 flex items-center justify-between text-left group"
          >
            <div className="flex items-start gap-4 pr-4">
              <div className="flex-shrink-0 mt-1">
                <HelpCircle className="w-5 h-5 text-red-500/70 group-hover:text-red-500 transition-colors" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-white leading-relaxed group-hover:text-red-400 transition-colors">
                {faq.question}
              </h4>
            </div>
            <div className={`flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
            </div>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-6 pb-6 pt-0 pl-14 md:pl-16">
              <div className="h-px bg-gradient-to-r from-red-500/20 via-red-500/50 to-red-500/20 mb-4"></div>
              <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OTTMovieDetailPage({
  article, platform, movieSlug, pageType = 'overview',
  contentSections = [], metaTitleSuffix = '', metaDescription = '', notFound = false
}) {
  const [scrollProgress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Extract FAQs from page-specific contentSections
  const faqs = extractFAQsFromSections(contentSections);

  OTTMovieDetailPage.noPadding = true;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      setIsLiked(likedArticles.includes(article?._id));
      setIsSaved(savedArticles.includes(article?._id));
    }
  }, [article?._id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / totalScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: article.title, text: article.summary, url: window.location.href }); }
      catch (err) { console.log("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    if (typeof window !== "undefined") {
      const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
      const newLiked = isLiked ? likedArticles.filter(id => id !== article._id) : [...likedArticles, article._id];
      localStorage.setItem("liked_articles", JSON.stringify(newLiked));
      setIsLiked(!isLiked);
    }
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      const newSaved = isSaved ? savedArticles.filter(id => id !== article._id) : [...savedArticles, article._id];
      localStorage.setItem("saved_articles", JSON.stringify(newSaved));
      setIsSaved(!isSaved);
    }
  };

  if (notFound || !article) {
    return <ErrorState type="movie" />;
  }

  const movieTitle = article.movieTitle || article.title;
  const releaseYear = article.releaseYear ? `(${article.releaseYear})` : "";
  const pageTitleSuffix = pageTitles[pageType] || pageTitles.overview;
  const fullTitle = `${movieTitle} ${releaseYear} – ${pageTitleSuffix}`;

  return (
    <>
      <Head>
        <title>{fullTitle} | FilmyFire Intelligence</title>
        <meta name="description" content={metaDescription || article.summary?.substring(0, 160)} />
        <link rel="canonical" href={`https://filmyfire.com/ott/${platform}/${movieSlug}${pageType === 'overview' ? '' : `-${pageType}`}`} />
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

        {/* Sticky Nav - shows on scroll */}
        <nav className={`fixed top-14 md:top-16 left-0 right-0 z-[70] transition-all duration-500 ${
          scrollProgress > 5
            ? 'opacity-100 translate-y-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 py-2 md:py-3'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-2">
            <Link
              href={`/ott/${platform}`}
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

        {/* Hero Section - matches movie page pattern */}
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
            href={`/ott/${platform}`}
            className="absolute top-8 left-8 z-20 flex items-center gap-2 text-gray-200 hover:text-white transition-all text-sm font-medium group bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg border border-gray-500/30 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline text-xs">Back</span>
          </Link>

          {/* Action Buttons - Top Right */}

          {/* Hero Content */}
          <div className="relative h-full flex items-center z-10">
            <div className="max-w-7xl w-full mx-auto px-6 py-16 md:py-20">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-8 md:gap-10 items-start"
              >
                {/* Poster with gradient border */}
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
                    <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600/30 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                      <Tv className="w-3 h-3" />
                      {platform}
                    </motion.span>
                    {article.rating && (
                      <motion.span whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1 text-yellow-400 text-[11px] font-semibold bg-yellow-500/20 px-2.5 py-1 rounded-full border border-yellow-500/30">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {article.rating}/10
                      </motion.span>
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
                    {article.ott?.platform && (
                      <span className="inline-flex items-center gap-1"><Tv className="w-3.5 h-3.5 text-purple-400" /> {article.ott.platform}</span>
                    )}
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

                  {/* Summary - Overview Only */}
                  {pageType === "overview" && article.summary && (
                    <motion.p
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="text-gray-300 text-sm leading-relaxed max-w-2xl"
                    >
                      {article.summary}
                    </motion.p>
                  )}

                  {/* BOX OFFICE hero stats */}
                  {pageType === "box-office" && (
                    <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3 max-w-2xl">
                      <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Box Office Collection</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(article.stats?.worldwide || article.boxOffice?.worldwide) && (
                          <div className="p-3 rounded-lg bg-green-600/20 border border-green-500/30">
                            <p className="text-[9px] text-gray-400 uppercase mb-1">Worldwide</p>
                            <p className="text-base font-bold text-white">{article.stats?.worldwide || article.boxOffice?.worldwide}</p>
                          </div>
                        )}
                        {article.stats?.indiaNet && (
                          <div className="p-3 rounded-lg bg-blue-600/20 border border-blue-500/30">
                            <p className="text-[9px] text-gray-400 uppercase mb-1">India Net</p>
                            <p className="text-base font-bold text-white">{article.stats.indiaNet}</p>
                          </div>
                        )}
                        {article.stats?.overseas && (
                          <div className="p-3 rounded-lg bg-cyan-600/20 border border-cyan-500/30">
                            <p className="text-[9px] text-gray-400 uppercase mb-1">Overseas</p>
                            <p className="text-base font-bold text-white">{article.stats.overseas}</p>
                          </div>
                        )}
                        {article.stats?.openingDay && (
                          <div className="p-3 rounded-lg bg-purple-600/20 border border-purple-500/30">
                            <p className="text-[9px] text-gray-400 uppercase mb-1">Opening Day</p>
                            <p className="text-base font-bold text-white">{article.stats.openingDay}</p>
                          </div>
                        )}
                        {article.stats?.openingWeekend && (
                          <div className="p-3 rounded-lg bg-pink-600/20 border border-pink-500/30">
                            <p className="text-[9px] text-gray-400 uppercase mb-1">Opening Weekend</p>
                            <p className="text-base font-bold text-white">{article.stats.openingWeekend}</p>
                          </div>
                        )}
                        {article.stats?.firstWeek && (
                          <div className="p-3 rounded-lg bg-orange-600/20 border border-orange-500/30">
                            <p className="text-[9px] text-gray-400 uppercase mb-1">First Week</p>
                            <p className="text-base font-bold text-white">{article.stats.firstWeek}</p>
                          </div>
                        )}
                      </div>
                      {article.stats?.verdict && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/30 to-orange-600/30 border border-red-500/40">
                          <span className="text-sm font-black text-red-300 uppercase">{article.stats.verdict}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* CAST hero list */}
                  {pageType === "cast" && (
                    <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3 max-w-2xl">
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
                    </motion.div>
                  )}

                  {/* BUDGET hero stats */}
                  {pageType === "budget" && article.pSEO_Content_budget?.length > 0 && (
                    <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3 max-w-2xl">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Budget Analysis</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {article.pSEO_Content_budget[0].content.substring(0, 250)}
                      </p>
                      {article.pSEO_Content_budget.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/20">
                          <p className="text-xs font-bold text-blue-300 mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{section.content.substring(0, 200)}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* ENDING EXPLAINED hero */}
                  {pageType === "ending-explained" && article.pSEO_Content_ending_explained?.length > 0 && (
                    <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3 max-w-2xl">
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Ending Explained</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {article.pSEO_Content_ending_explained[0].content.substring(0, 250)}
                      </p>
                      {article.pSEO_Content_ending_explained.slice(1, 6).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-orange-600/10 border border-orange-500/20">
                          <p className="text-xs font-bold text-orange-300 mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{section.content.substring(0, 200)}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* REVIEW ANALYSIS hero */}
                  {pageType === "review-analysis" && article.pSEO_Content_review_analysis?.length > 0 && (
                    <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3 max-w-2xl">
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
                      {article.pSEO_Content_review_analysis.slice(1, 2).filter(s => !s.heading?.toLowerCase().includes('faq')).slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-500/20">
                          <p className="text-xs font-bold text-yellow-300 mb-1">{section.heading}</p>
                          <p className="text-gray-400 text-xs leading-relaxed">{section.content.substring(0, 200)}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* HIT OR FLOP hero */}
                  {pageType === "hit-or-flop" && (
                    <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3 max-w-2xl">
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
                    </motion.div>
                  )}

                  {/* OTT RELEASE hero */}
                  {pageType === "ott-release" && (
                    <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3 max-w-2xl">
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
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Sticky Navigation Bar - matches movie page */}
        <div className="sticky top-0 z-40 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/98 to-[#0a0a0f]/95 backdrop-blur-xl border-b border-gray-800/50">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {[
                { label: "Overview", suffix: "", icon: Info },
                { label: "Ending", suffix: "-ending-explained", icon: Zap },
                { label: "Box Office", suffix: "-box-office", icon: TrendingUp },
                { label: "Budget", suffix: "-budget", icon: DollarSign },
                { label: "OTT Release", suffix: "-ott-release", icon: Tv },
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
                      href={`/ott/${platform}/${movieSlug}${link.suffix}`}
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

        {/* Content Section - Left/Right Split Layout (matches movie page) */}
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">

          {/* Top Grid - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

            {/* LEFT SIDEBAR - Stats + Details + Quick Links */}
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
                    <span className="text-xs font-bold text-white">{article.stats?.readTime || '5 min'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase">Platform</span>
                    <span className="text-xs font-bold text-purple-400">{article.ott?.platform || platform}</span>
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
                    { label: "OTT Platform", value: article.ott?.platform || platform || "TBA" },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">{stat.label}</span>
                      <span className="text-xs font-semibold text-white text-right">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Links - Hidden (Already in Top Navigation Bar) */}
            </div>

            {/* RIGHT COLUMN - Content Sections */}
            <div className="lg:col-span-8 space-y-6">

              {/* Trending Score Row */}
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

              {/* Crew Section - only on overview */}
              {pageType === "overview" && (article.director?.length > 0 || article.producer?.length > 0) && (
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
                        if (!seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); uniqueCrew.push({ name, role: 'Director' }); }
                      });
                      article.producer?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); uniqueCrew.push({ name, role: 'Producer' }); }
                      });
                      article.writer?.forEach(name => {
                        if (!seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); uniqueCrew.push({ name, role: 'Writer' }); }
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
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="rounded-xl bg-gray-900/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-red-500" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => {
                      const tagLower = tag.toLowerCase();
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
                        return <Link key={idx} href={targetUrl} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 text-xs text-red-400 hover:text-white hover:border-red-500/50 transition-all">#{tag}</Link>;
                      }
                      if (["netflix", "prime video", "prime", "disney+ hotstar", "hotstar", "jio cinema", "zee5", "sonyliv"].includes(tagLower)) {
                        return <Link key={idx} href={`/ott/${slugify(tag)}`} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-xs text-purple-400 hover:text-white transition-all">#{tag}</Link>;
                      }
                      return <Link key={idx} href={`/discover/tag/${slugify(tag)}`} className="px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all">#{tag}</Link>;
                    })}
                  </div>
                </motion.div>
              )}

              {/* Quick Summary - Only on overview page */}
              {pageType === "overview" && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-800 p-5"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-red-500" /> Quick Summary
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                    {article.summary || `${movieTitle} is a ${article.genres?.join(", ")} feature streaming on ${article.ott?.platform || platform}.`}
                  </p>
                  {article.genreAnalysis && (
                    <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">"{article.genreAnalysis}"</p>
                  )}
                  {/* <Link href={`/ott/${platform}/${movieSlug}`} className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors">
                    Full Analysis <ChevronRight className="w-3.5 h-3.5" />
                  </Link> */}
                </motion.div>
              )}

              {/* Page-Specific Content Card - matches category page */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-800 p-5"
              >
                {/* OVERVIEW PAGE - Show sections with View More */}
                {pageType === "overview" && article.sections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Key Analysis Sections
                    </h3>
                    <div className="space-y-3">
                      {article.sections.slice(0, 4).map((section, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 150)}</p>
                        </div>
                      ))}
                    </div>
                    {article.sections.length > 4 && (
                      <Link href={`#overview-section`} className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors">
                        View More <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </>
                )}

                {/* ENDING EXPLAINED */}
                {pageType === "ending-explained" && contentSections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Ending Explained
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {truncateAtSentence(contentSections[0].content, 250)}
                    </p>
                    {contentSections.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Key Sections</p>
                        {contentSections.slice(1, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* BOX OFFICE */}
                {pageType === "box-office" && contentSections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Box Office Analysis
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {truncateAtSentence(contentSections[0].content, 250)}
                    </p>
                    {contentSections.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Key Sections</p>
                        {contentSections.slice(1, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* BUDGET */}
                {pageType === "budget" && contentSections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Budget Analysis
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {truncateAtSentence(contentSections[0].content, 250)}
                    </p>
                    {contentSections.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Key Sections</p>
                        {contentSections.slice(1, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* OTT RELEASE */}
                {pageType === "ott-release" && contentSections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Tv className="w-4 h-4" /> OTT Release Details
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {truncateAtSentence(contentSections[0].content, 250)}
                    </p>
                    {contentSections.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Key Sections</p>
                        {contentSections.slice(1, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* CAST */}
                {pageType === "cast" && contentSections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Cast Analysis
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {truncateAtSentence(contentSections[0].content, 250)}
                    </p>
                    {contentSections.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Key Sections</p>
                        {contentSections.slice(1, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* REVIEW ANALYSIS */}
                {pageType === "review-analysis" && contentSections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Review Analysis
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {truncateAtSentence(contentSections[0].content, 250)}
                    </p>
                    {contentSections.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Key Sections</p>
                        {contentSections.slice(1, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* HIT OR FLOP */}
                {pageType === "hit-or-flop" && contentSections?.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Verdict Analysis
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {truncateAtSentence(contentSections[0].content, 250)}
                    </p>
                    {contentSections.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Key Sections</p>
                        {contentSections.slice(1, 5).map((section, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                            <p className="text-xs font-semibold text-white mb-1">{section.heading}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-2">{truncateAtSentence(section.content, 180)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* MAIN CONTENT AREA - Full Width Below Grid */}
          <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div id="overview-section" className="space-y-12 mt-8">

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

            {/* OVERVIEW page sections - Only show overview content (exclude FAQs) */}
            {pageType === "overview" && article.sections?.length > 0 && (
              <div className="space-y-8">
                {article.sections
                  .filter(section => !section.heading?.toLowerCase().includes('faq'))
                  .map((section, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                    >
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-red-500" />
                        {section.heading}
                      </h2>
                      <div className="space-y-4">
                        {section.content.split(/\n\n/).filter(p => p.trim()).map((para, pIdx) => (
                          <p key={pIdx} className="text-gray-400 leading-relaxed text-base">
                            {para}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* Generic Sub-Page Content */}
            {pageType !== "overview" && (
              <div id="budget-section" className="space-y-12">

                {/* BOX OFFICE - Rich Section */}
                {pageType === "box-office" && (
                  <>
                    <section id="boxoffice-section" className="mb-12">
                      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7 text-green-500" /> Box Office Performance
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="relative group p-6 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-500/50 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-500/20"><DollarSign className="w-5 h-5 text-green-400" /></div>
                            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Worldwide Total</span>
                          </div>
                          <div className="text-4xl font-bold text-white mb-2">{article.stats?.worldwide || article.boxOffice?.worldwide || "N/A"}</div>
                          <div className="text-xs text-green-300/80">Lifetime Collection</div>
                        </div>
                        <div className="relative group p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/20"><Target className="w-5 h-5 text-blue-400" /></div>
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">India Net</span>
                          </div>
                          <div className="text-4xl font-bold text-white mb-2">{article.stats?.indiaNet || "N/A"}</div>
                          <div className="text-xs text-blue-300/80">Domestic Collection</div>
                        </div>
                        <div className="relative group p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-500/20"><Zap className="w-5 h-5 text-purple-400" /></div>
                            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Opening Day</span>
                          </div>
                          <div className="text-4xl font-bold text-white mb-2">{article.stats?.openingDay || "N/A"}</div>
                          <div className="text-xs text-purple-300/80">First Day Business</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Opening Weekend", value: article.stats?.openingWeekend, icon: Calendar, color: "orange" },
                          { label: "First Week", value: article.stats?.firstWeek, icon: Clock, color: "blue" },
                          { label: "Overseas Total", value: article.stats?.overseas, icon: Globe, color: "cyan" },
                          { label: "Budget", value: article.budget, icon: BarChart3, color: "green" }
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
                    <section className="mb-12">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-red-600" /> Collection Breakdown
                      </h3>
                      <div className="space-y-6">
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
                                  <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${region.percentage}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
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
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-red-400" /> Box Office Verdict
                            </h4>
                            <div className="text-center py-8">
                              <div className="inline-block px-6 py-3 rounded-full bg-red-600/20 border border-red-500/30 mb-4">
                                <span className="text-2xl font-black text-red-400 uppercase tracking-widest">{article.stats?.verdict || "Average"}</span>
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed">Based on collection trends and recovery percentage</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" /> Trade Analysis
                      </h3>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-zinc-300 leading-relaxed text-base mb-6">{article.summary || "Trade analysis coming soon."}</p>
                        {contentSections?.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                          <div key={idx} className="mb-6 last:mb-0">
                            <h4 className="text-lg font-bold text-white mb-3">{section.heading}</h4>
                            <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {/* CAST - Rich Section */}
                {pageType === "cast" && (
                  <>
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Users className="w-6 h-6 text-red-600" /> Cast & Character Intel
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        {article.cast?.map((actor, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02, x: 3 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/20 transition-all"
                          >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600/30 to-purple-600/30 flex items-center justify-center border border-gray-600 overflow-hidden flex-shrink-0">
                              {actor.image ? (
                                <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-zinc-600" />
                              )}
                            </div>
                            <div>
                              <Link href={`/celebrity/${slugify(actor.name)}`} className="text-white font-bold hover:text-red-400 transition-colors">{actor.name}</Link>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{actor.role || "Actor"}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {contentSections?.length > 0 && (
                        <div className="space-y-6">
                          {contentSections.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                              <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}

                {/* BUDGET - Rich Section */}
                {pageType === "budget" && (
                  <>
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-blue-500" /> Budget & Financial Analysis
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30">
                          <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Total Budget</p>
                          <p className="text-4xl font-black text-white">{article.budget || "N/A"}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
                          <p className="text-xs text-green-400 uppercase tracking-widest mb-1">Worldwide Collection</p>
                          <p className="text-4xl font-black text-white">{article.stats?.worldwide || "N/A"}</p>
                        </div>
                      </div>
                      {article.budget && article.stats?.worldwide && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                            <p className="text-2xl font-bold text-white">{(parseInt(article.stats.worldwide) / parseInt(article.budget)).toFixed(1)}x</p>
                            <p className="text-xs text-gray-400 mt-1">Return on Investment</p>
                          </div>
                          <div className="p-4 rounded-xl bg-green-800/20 border border-green-700/30 text-center">
                            <p className="text-2xl font-bold text-green-400">{((parseInt(article.stats.worldwide) / parseInt(article.budget) - 1) * 100).toFixed(0)}%</p>
                            <p className="text-xs text-gray-400 mt-1">Profit Margin</p>
                          </div>
                          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                            <p className="text-2xl font-bold text-white">{parseInt(article.stats.worldwide) - parseInt(article.budget) > 0 ? 'Profit' : 'Loss'}</p>
                            <p className="text-xs text-gray-400 mt-1">Financial Result</p>
                          </div>
                        </div>
                      )}
                      {contentSections?.length > 0 && (
                        <div className="space-y-6">
                          {contentSections.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                              <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}

                {/* ENDING EXPLAINED - Rich Section */}
                {pageType === "ending-explained" && (
                  <>
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-orange-500" /> Ending Explained
                      </h2>
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30 mb-6">
                        <p className="text-gray-300 leading-relaxed">{article.summary || `A detailed breakdown of the ending and its hidden meanings for ${movieTitle}.`}</p>
                      </div>
                      {contentSections?.length > 0 ? (
                        <div className="space-y-6">
                          {contentSections.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 border-l-4 border-l-orange-500">
                              <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : article.pSEO_Content_ending_explained?.length > 0 ? (
                        <div className="space-y-6">
                          {article.pSEO_Content_ending_explained.map((section, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 border-l-4 border-l-orange-500">
                              <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">Ending analysis is being prepared by our film experts.</p>
                      )}
                    </section>
                  </>
                )}

                {/* REVIEW ANALYSIS - Rich Section */}
                {pageType === "review-analysis" && (
                  <>
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <ThumbsUp className="w-6 h-6 text-yellow-500" /> Critical Review Analysis
                      </h2>
                      {article.rating && (
                        <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 mb-6">
                          <div className="flex items-center gap-3">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                            <div>
                              <p className="text-4xl font-black text-white">{article.rating}<span className="text-xl text-gray-400">/10</span></p>
                              <p className="text-xs text-yellow-400">IMDb Rating</p>
                            </div>
                          </div>
                          {article.genreAnalysis && (
                            <p className="text-gray-300 text-sm leading-relaxed flex-1">{article.genreAnalysis}</p>
                          )}
                        </div>
                      )}
                      {contentSections?.length > 0 ? (
                        <div className="space-y-6">
                          {contentSections.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                              <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                          <p className="text-gray-400">{article.criticalResponse || `Critical and audience reception analysis for ${movieTitle} is being compiled.`}</p>
                        </div>
                      )}
                    </section>
                  </>
                )}

                {/* HIT OR FLOP - Rich Section */}
                {pageType === "hit-or-flop" && (
                  <>
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-red-500" /> Hit or Flop Verdict
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30">
                          <p className="text-xs text-green-400 uppercase tracking-widest mb-2">Total Collection</p>
                          <p className="text-3xl font-black text-white">{article.stats?.worldwide || "N/A"}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30">
                          <p className="text-xs text-blue-400 uppercase tracking-widest mb-2">Budget</p>
                          <p className="text-3xl font-black text-white">{article.budget || "N/A"}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30">
                          <p className="text-xs text-red-400 uppercase tracking-widest mb-2">Verdict</p>
                          <p className="text-3xl font-black text-white">{article.stats?.verdict || "N/A"}</p>
                        </div>
                      </div>
                      {contentSections?.length > 0 && (
                        <div className="space-y-6">
                          {contentSections.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                              <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}

                {/* OTT RELEASE - Rich Section */}
                {pageType === "ott-release" && (
                  <>
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Tv className="w-6 h-6 text-purple-500" /> OTT Release Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {article.ott?.platform && (
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
                            <p className="text-xs text-purple-400 uppercase tracking-widest mb-2">Streaming Platform</p>
                            <p className="text-3xl font-black text-white">{article.ott.platform}</p>
                            <Link href={`/ott/${slugify(article.ott.platform)}`} className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-purple-400 hover:text-purple-300">
                              Browse Platform <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                        {article.ott?.releaseDate && (
                          <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">OTT Release Date</p>
                            <p className="text-3xl font-black text-white">{article.ott.releaseDate}</p>
                          </div>
                        )}
                      </div>
                      {contentSections?.length > 0 ? (
                        <div className="space-y-6">
                          {contentSections.filter(s => !s.heading?.toLowerCase().includes('faq')).map((section, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                              <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                          <p className="text-gray-400">{article.summary || `OTT streaming details for ${movieTitle} are being updated.`}</p>
                        </div>
                      )}
                    </section>
                  </>
                )}

                {/* Fallback for other page types - render contentSections */}
                {!["box-office", "cast", "budget", "ending-explained", "review-analysis", "hit-or-flop", "ott-release"].includes(pageType) && (
                  contentSections?.map((section, idx) => (
                    <motion.section
                      key={idx}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                    >
                      <h2 className="text-2xl font-black text-white mb-6">{section.heading}</h2>
                      <p className="text-gray-400 leading-relaxed text-base">{section.content}</p>
                    </motion.section>
                  ))
                )}
              </div>
            )}

            {/* Internal Linking Section */}
            <div className="mt-20 pt-12 border-t border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <Target className="w-6 h-6 text-red-500" /> Explore More
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Cast Intelligence
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.cast?.slice(0, 5).map((actor, idx) => (
                      <Link key={idx} href={`/celebrity/${slugify(actor.name)}`} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all">
                        {actor.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Film className="w-4 h-4" /> Genre Network
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.genres?.map((genre, idx) => (
                      <Link key={idx} href={`/category/${article.category?.toLowerCase()}`} className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-red-500/50 transition-all">
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
                {article.ott?.platform && (
                  <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Tv className="w-4 h-4" /> Streaming Hub
                    </h3>
                    <Link href={`/ott/${slugify(article.ott.platform)}`} className="inline-block px-4 py-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 text-sm font-semibold hover:bg-red-600 hover:text-white transition-all">
                      Watch on {article.ott.platform}
                    </Link>
                  </div>
                )}
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Similar Titles
                  </h3>
                  <Link href={`/discover/similar-to/${movieSlug}`} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    Browse Movies Like {movieTitle}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            {faqs.length > 0 && (
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
                  <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{faqs.length} questions</span>
                </div>
                <FAQDropdown faqs={faqs} loading={false} />
                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Still have questions? <Link href="/contact" className="text-red-500 hover:text-red-400">Contact our film experts</Link>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
          </div>
        </main>
      </div>
    </>
  );
}

OTTMovieDetailPage.noPadding = true;
