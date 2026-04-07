"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Share2, Bookmark, Target, Calendar, Clock, Star, 
  Info, HelpCircle, Users, Zap, BookOpen, TrendingUp, DollarSign,
  Tv, BarChart3, ChevronRight, List, Sparkles ,ThumbsUp 
} from "lucide-react";
import { slugify } from "../../../lib/slugify";

export async function getServerSideProps(context) {
  const { platform } = context.params;
  const fullSlug = context.params.slug; // This will be an array like ['movie-title', 'ending-explained'] or ['movie-title']

  const movieSlug = fullSlug[0];
  const pageType = fullSlug.length > 1 ? fullSlug.slice(1).join('-') : 'overview'; // e.g., 'ending-explained' or 'overview'

  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // Fetch article data based on movieSlug
    const res = await fetch(`${baseUrl}/api/articles/get-by-slug?slug=${movieSlug}`);
    const data = await res.json();

    const notFound = !res.ok || !data?.data;

    const article = notFound ? null : data.data;

    // Prepare content based on pageType
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
        break;
    }

    return {
      props: {
        article,
        platform,
        movieSlug,
        pageType,
        contentSections,
        metaTitleSuffix,
        metaDescription,
        notFound,
      },
    };
  } catch (error) {
    return {
      props: {
        article: null,
        platform,
        movieSlug,
        pageType,
        contentSections: [],
        metaTitleSuffix: 'Full Analysis, Box Office & OTT Details',
        metaDescription: '',
        notFound: true,
      },
    };
  }
}

import ErrorState from "../../../components/common/ErrorState";

export default function OTTMovieDetailPage({ article, platform, movieSlug, pageType = 'overview', contentSections = [], metaTitleSuffix = '', metaDescription = '', notFound = false }) {
  const [scrollProgress, setProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loadingFAQs, setLoadingFAQs] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && article?._id) {
      const saved = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      setIsSaved(saved.includes(article._id));
    }
  }, [article?._id]);

  useEffect(() => {
    if (!movieSlug) return;
    async function loadFAQs() {
      try {
        setLoadingFAQs(true);
        const res = await fetch('/api/movie/generate-faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: movieSlug, pageType })
        });
        if (res.ok) {
          const result = await res.json();
          setFaqs(result.data || []);
        }
      } catch (error) { console.error('FAQ fetch error:', error); }
      finally { setLoadingFAQs(false); }
    }
    loadFAQs();
  }, [movieSlug, pageType]);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (notFound || !article) {
    return <ErrorState type="movie" />;
  }

  const movieTitle = article.movieTitle || article.title || "Movie";
  const releaseYear = article.releaseYear ? `(${article.releaseYear})` : "";
  const fullPageTitle = `${movieTitle} Movie ${releaseYear} – ${metaTitleSuffix || 'Intelligence Report'}`;

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

  const currentTitle = pageTitles[pageType] || pageTitles.overview;
  const safePageType = pageType || 'overview';

  return (
    <>
      <Head>
        <title>{fullPageTitle} | FilmyFire</title>
        <meta name="description" content={metaDescription || ""} />
        <link rel="canonical" href={`https://filmyfire.com/ott/${platform}/${movieSlug}${safePageType === 'overview' ? '' : `-${safePageType}`}`} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-rose-600/30 font-sans relative pt-16 top-0">
        <div className="fixed top-16 left-0 right-0 z-[100] h-1 bg-white/5">
          <div className="h-full bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        </div>

        <nav className={`fixed top-16 left-0 right-0 z-[40] transition-all duration-500 ${scrollProgress > 5 ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link href={`/ott/${platform}`} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline uppercase tracking-widest">Back to {platform?.toUpperCase() || 'Platform'}</span>
            </Link>
            <div className={`flex-1 px-8 transition-all duration-500 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <h2 className="text-[10px] font-black text-white truncate max-w-md mx-auto text-center hidden md:block uppercase tracking-[0.3em]">
                {movieTitle} – {currentTitle}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 text-zinc-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-3 text-zinc-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        <div className="relative w-full h-[60vh] flex items-end justify-start overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            {article.coverImage ? (
              <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          </div>
          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 pb-12">
            <div className="max-w-5xl">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Target className="w-3 h-3" /> {article.category} Intelligence
                </span>
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">{currentTitle}</span>
                {article.rating && <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold bg-yellow-500/10 px-3 py-1 rounded-full"><Star className="w-3 h-3 fill-yellow-400" />{article.rating}/10</span>}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">{fullPageTitle}</h1>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {article.releaseYear}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.runtime || "2h 45m"}</span>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="prose prose-invert prose-zinc max-w-none">
              {/* Intro Paragraph for ALL pages */}
              {safePageType !== "overview" && (
                <div className="mb-12 p-8 rounded-3xl bg-zinc-900/50 border-l-4 border-rose-600">
                  <p className="text-zinc-300 leading-relaxed text-lg">
                    {article.summary ? 
                      `${article.summary.substring(0, 300)}... This dedicated report focuses specifically on the ${safePageType.replace("-", " ")} of ${movieTitle}.` : 
                      `Explore the detailed ${safePageType.replace("-", " ")} analysis for ${movieTitle} (${article.releaseYear}). Our film intelligence team has dissected every aspect of this ${article.category} feature to bring you exclusive insights.`
                    }
                  </p>
                </div>
              )}

              {/* Overview Page Content */}
              {safePageType === "overview" && (
                <section className="space-y-12">
                  {/* Intro Section - 150-200 words with keyword */}
                  <div className="p-8 rounded-3xl bg-zinc-900/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-16 h-16" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <Info className="w-6 h-6 text-rose-600" /> {movieTitle} Movie Overview
                    </h2>
                    <p className="text-zinc-300 leading-relaxed text-lg relative z-10">
                      {article.summary || `${movieTitle} is a highly anticipated ${article.genres?.join("/")} feature that has taken the ${article.category} industry by storm. This full intelligence report provides a comprehensive analysis of the film's theatrical journey, its digital release strategy, and the creative vision behind its production.`}
                    </p>
                  </div>

                  {/* Plot Summary Section */}
                  <div className="p-8 rounded-3xl bg-zinc-900/50">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-rose-600" /> Plot Summary
                    </h2>
                    <div className="space-y-4">
                      {article.sections?.filter(s => s.heading.toLowerCase().includes("plot") || s.heading.toLowerCase().includes("story")).map((section, idx) => (
                        <div key={idx}>
                          <h3 className="text-xl font-bold text-white mb-4">{section.heading}</h3>
                          <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                        </div>
                      )) || <p className="text-zinc-500 italic">Detailed plot analysis is being updated by our film experts.</p>}
                    </div>
                  </div>

                  {/* Ending Explained Section */}
                  <div className="p-8 rounded-3xl bg-zinc-900/50">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-rose-600" /> Ending Explained
                    </h2>
                    <div className="space-y-4">
                      {article.pSEO_Content_ending_explained?.length > 0 ? (
                        article.pSEO_Content_ending_explained.map((section, idx) => (
                          <div key={idx}>
                            <h3 className="text-xl font-bold text-white mb-4">{section.heading}</h3>
                            <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-400 leading-relaxed">
                          For a deep-dive analysis of the final climax and hidden meanings, visit our dedicated 
                          <Link href={`/ott/${platform}/${movieSlug}-ending-explained`} className="text-rose-500 hover:underline mx-1 font-bold">
                            {movieTitle} Ending Explained
                          </Link> page.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Box Office & Budget Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl bg-zinc-900/50">
                      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-rose-600" /> Box Office Collection
                      </h2>
                      <div className="space-y-4">
                        <p className="text-3xl font-black text-white mb-2">{article.boxOffice?.worldwide || "TBA"}</p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          The global theatrical run of {movieTitle} has shown impressive resilience. 
                          For detailed territory-wise collection and ROI analysis, check the 
                          <Link href={`/ott/${platform}/${movieSlug}-box-office`} className="text-rose-500 hover:underline mx-1 font-bold">
                            Full Financial Report
                          </Link>.
                        </p>
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-zinc-900/50">
                      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-rose-600" /> Budget & Profit
                      </h2>
                      <div className="space-y-4">
                        <p className="text-3xl font-black text-white mb-2">{article.budget || "TBA"}</p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Production scale and marketing investments for {movieTitle} were significant. 
                          Explore the 
                          <Link href={`/ott/${platform}/${movieSlug}-budget`} className="text-rose-500 hover:underline mx-1 font-bold">
                            Budget Breakdown
                          </Link> for details on cast salaries and technical costs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OTT Release Details */}
                  <div className="p-8 rounded-3xl bg-zinc-900/50">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <Tv className="w-6 h-6 text-rose-600" /> OTT Release Details
                    </h2>
                    <div className="space-y-4">
                      {article.ott?.platform ? (
                        <p className="text-zinc-400 leading-relaxed">
                          {movieTitle} is officially streaming on <span className="text-white font-bold">{article.ott.platform}</span>. 
                          The digital rights were secured in a multi-crore deal. Visit our 
                          <Link href={`/ott/${platform}/${movieSlug}-ott-release`} className="text-rose-500 hover:underline mx-1 font-bold">
                            OTT Intelligence
                          </Link> page for the exact release timeline.
                        </p>
                      ) : (
                        <p className="text-zinc-400 leading-relaxed">
                          Streaming platform details for {movieTitle} are currently under negotiation. 
                          Check our <Link href={`/ott/${platform}/${movieSlug}-ott-release`} className="text-rose-500 hover:underline font-bold">OTT Hub</Link> for updates.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cast & Characters Section */}
                  <div className="p-8 rounded-3xl bg-zinc-900/50">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <Users className="w-6 h-6 text-rose-600" /> Cast & Characters
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      {article.cast?.slice(0, 4).map((actor, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Users className="w-6 h-6 text-zinc-600" />
                          </div>
                          <div>
                            <p className="text-white font-bold">{actor.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{actor.role || "Lead Role"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link href={`/ott/${platform}/${movieSlug}-cast`} className="text-rose-500 text-sm font-bold hover:underline flex items-center gap-1">
                      View Full Cast & Performance Analysis <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Audience Reaction Section */}
                  <div className="p-8 rounded-3xl bg-zinc-900/50">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <ThumbsUp className="w-6 h-6 text-rose-600" /> Audience Reaction
                    </h2>
                    <p className="text-zinc-400 leading-relaxed mb-6">
                      {article.criticalResponse || `Audience and critical reception for ${movieTitle} has been a major point of discussion. The film's unique narrative approach and technical brilliance have received praise from industry experts.`}
                    </p>
                    <Link href={`/ott/${platform}/${movieSlug}-review-analysis`} className="text-rose-500 text-sm font-bold hover:underline flex items-center gap-1">
                      See Critical Review Analysis <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </section>
              )}

              {/* Generic Sub-Page Content Renderer */}
              {pageType !== "overview" && (
                <div className="space-y-12">
                  {contentSections.map((section, idx) => (
                    <section key={idx} className="p-8 rounded-3xl bg-zinc-900/50">
                      <h2 className="text-2xl font-black text-white mb-6">{section.heading}</h2>
                      <p className="text-zinc-400 leading-relaxed text-lg">{section.content}</p>
                    </section>
                  ))}
                </div>
              )}

              {/* Internal Linking Section (Auto) - Ranking Backbone */}
              <div className="mt-20 pt-12 border-t border-white/10">
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                  <Target className="w-6 h-6 text-rose-600" /> Intelligence Network
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Movie -> Actor */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Cast Intelligence
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.cast?.slice(0, 5).map((actor, idx) => (
                        <Link 
                          key={idx} 
                          href={`/celebrity/${slugify(actor.name)}`}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-rose-500/50 transition-all"
                        >
                          {actor.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Movie -> Genre */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <List className="w-4 h-4" /> Genre Network
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.genres?.map((genre, idx) => (
                        <Link 
                          key={idx} 
                          href={`/category/${article.category.toLowerCase()}`}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-rose-500/50 transition-all"
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Movie -> OTT */}
                  {article.ott?.platform && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Tv className="w-4 h-4" /> Streaming Hub
                      </h3>
                      <Link 
                        href={`/ott/${platform}`}
                        className="inline-block px-4 py-2 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-500 text-sm font-bold hover:bg-rose-600 hover:text-white transition-all"
                      >
                        More on {article.ott.platform}
                      </Link>
                    </div>
                  )}

                  {/* Movie -> Similar */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Similar Intelligence
                    </h3>
                    <Link 
                      href={`/discover/similar-to/${movieSlug}`}
                      className="text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      Browse Movies Like {movieTitle}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section (Required for SEO) */}
            <div className="pt-16 border-t border-white/10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><HelpCircle className="w-6 h-6 text-rose-600" /> Frequently Asked Questions</h2>
              <FAQDropdown faqs={faqs} loading={loadingFAQs} />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-rose-600" /> Core Intelligence</h3>
                <div className="space-y-4">
                  {[
                    { label: "Director", value: article.director?.join(", ") },
                    { label: "Budget", value: article.budget },
                    { label: "Worldwide", value: article.boxOffice?.worldwide },
                    { label: "Platform", value: article.ott?.platform || platform }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-[11px] font-bold text-white uppercase text-right max-w-[150px] truncate">{stat.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}

// --- Movie Detail Sub-Components ---

function FAQDropdown({ faqs, loading }) {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
          <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <div key={idx} className="faq-item rounded-2xl bg-gradient-to-br from-white/5 to-white/3 border border-white/10 hover:border-rose-500/30 transition-all duration-300 overflow-hidden">
          <button onClick={() => toggleFAQ(idx)} className="w-full px-6 py-5 flex items-center justify-between text-left group">
            <div className="flex items-start gap-4 pr-4">
              <HelpCircle className="w-5 h-5 text-rose-500/70 mt-1" />
              <h4 className="text-base md:text-lg font-bold text-white leading-relaxed group-hover:text-rose-400 transition-colors">{faq.question}</h4>
            </div>
            <ChevronRight className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-90' : ''}`} />
          </button>
          <div className={`faq-answer ${openIndex === idx ? 'open' : ''}`}>
            <div className="px-6 pb-6 pt-0 pl-14 md:pl-16">
              <div className="h-px bg-gradient-to-r from-rose-500/20 via-rose-500/50 to-rose-500/20 mb-4"></div>
              <p className="text-zinc-300 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

OTTMovieDetailPage.noPadding = true;
