"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Share2, Bookmark, Target, Calendar, Clock, Star, 
  Info, HelpCircle, Users, Zap, BookOpen, TrendingUp, DollarSign,
  Tv, BarChart3, ChevronRight, List, Sparkles, ThumbsUp, Copy, Check,
  ArrowRight, Play, ExternalLink, Menu, X, ChevronDown, Award,
  Film, Activity, Globe, Heart, Shield, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { slugify } from "../../../lib/slugify";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [faqs, setFaqs] = useState([]);
  const [loadingFAQs, setLoadingFAQs] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
      const progress = (window.scrollY / total) * 100;
      setProgress(progress);

      // Simple section detection
      const sections = ["overview", "plot", "ending", "boxoffice", "budget", "ott", "cast", "faq"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
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
  const isNetflix = platform?.toLowerCase() === 'netflix' || article.ott?.platform?.toLowerCase() === 'netflix';
  const netflixLogo = "/uploads/netflix.png";

  const navItems = [
    { id: "overview", label: "Overview", icon: <Info className="w-4 h-4" /> },
    { id: "plot", label: "Plot", icon: <BookOpen className="w-4 h-4" /> },
    { id: "ending", label: "Ending", icon: <Zap className="w-4 h-4" /> },
    { id: "boxoffice", label: "Financials", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "ott", label: "Streaming", icon: <Tv className="w-4 h-4" /> },
    { id: "cast", label: "Cast", icon: <Users className="w-4 h-4" /> },
    { id: "faq", label: "FAQs", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsNavOpen(false);
  };

  return (
    <>
      <Head>
        <title>{fullPageTitle} | FilmyFire</title>
        <meta name="description" content={metaDescription || ""} />
        <link rel="canonical" href={`https://filmyfire.com/ott/${platform}/${movieSlug}${safePageType === 'overview' ? '' : `-${safePageType}`}`} />
      </Head>

      <ToastContainer />

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-rose-600/30 font-sans relative pt-16 top-0">
        {/* Animated Progress Bar */}
        <motion.div 
          className="fixed top-16 left-0 right-0 z-[100] h-[3px] bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 origin-left"
          style={{ scaleX }}
        />

        {/* Floating Mobile Nav Toggle */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="fixed bottom-8 right-8 z-[110] lg:hidden w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl shadow-rose-600/40 border border-white/10"
        >
          {isNavOpen ? <X /> : <Menu />}
        </motion.button>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed inset-0 z-[105] lg:hidden bg-[#050505] p-8 pt-24"
            >
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`flex items-center gap-4 p-5 rounded-2xl text-lg font-bold transition-all ${activeSection === item.id ? 'bg-rose-600 text-white' : 'bg-white/5 text-zinc-400'}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className={`fixed top-16 left-0 right-0 z-[40] transition-all duration-500 ${scrollProgress > 5 ? 'bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link href={`/ott/${platform}`} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-[10px] font-black group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-[0.2em]">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to {platform}</span>
            </Link>
            
            <div className={`flex-1 px-8 transition-all duration-500 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="flex flex-col items-center text-center">
                <h2 className="text-[10px] font-black text-white truncate max-w-md mx-auto uppercase tracking-[0.3em]">
                  {movieTitle}
                </h2>
                <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest">
                  {currentTitle}
                </span>
              </div>
            </div>

            <div className="w-[100px] hidden md:block" />
          </div>
        </nav>

        {/* Cinematic Hero Section */}
        <section className="relative w-full h-[70vh] flex items-end justify-start overflow-hidden pt-16">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            {article.coverImage ? (
              <img src={article.coverImage} alt={movieTitle} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-60" />
          </motion.div>

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 pb-24">
            <div className="max-w-6xl">
              <div className="flex flex-col md:flex-row items-end gap-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="hidden md:block w-40 md:w-52 lg:w-60 flex-shrink-0"
                >
                  <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
                    { (article.posterImage || article.coverImage) ? (
                      <img 
                        src={article.posterImage || article.coverImage} 
                        alt={`${movieTitle} poster`} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <Film className="w-10 h-10 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[9px] text-white uppercase tracking-widest">
                      Poster
                    </div>
                  </div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex items-center gap-3 mb-6 flex-wrap"
                  >
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-rose-600/30">
                      <Activity className="w-3 h-3" /> {article.category}
                    </span>
                    <span className="text-white text-[10px] font-bold uppercase tracking-[0.25em] bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                      {currentTitle}
                    </span>
                    {article.rating && (
                      <span className="flex items-center gap-1.5 text-yellow-400 text-[10px] font-bold bg-yellow-500/10 px-4 py-2 rounded-full backdrop-blur-md border border-yellow-500/20">
                        <Star className="w-3 h-3 fill-yellow-400" />{article.rating}/10
                      </span>
                    )}
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-4"
                  >
                    {movieTitle} <span className="text-zinc-500 block md:inline font-normal">{releaseYear}</span>
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.85 }}
                    className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-2xl mb-5"
                  >
                    {article.summary?.substring(0, 220) || `A comprehensive intelligence report covering storyline highlights, OTT release status, box office performance and cast insights for ${movieTitle}.`}
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                  >
                    <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" /> {article.releaseYear || 'TBA'}
                    </span>
                    <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-rose-500" /> {article.runtime || "2h 45m"}
                    </span>
                    <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-zinc-300">
                      <Globe className="w-3.5 h-3.5 text-rose-500" /> {platform}
                    </span>
                    {article.director?.length > 0 && (
                      <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <Film className="w-3.5 h-3.5 text-rose-500" /> {article.director[0]}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
          </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block animate-bounce"
          >
            <ChevronDown className="w-6 h-6 text-zinc-500" />
          </motion.div>
        </section>

        <main className="max-w-[1440px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
          {/* Quick Nav Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-32 h-fit">
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${activeSection === item.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-110' : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}
                >
                  {item.icon}
                  <span className="absolute left-16 px-4 py-2 bg-zinc-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-7 space-y-24">
            <div className="prose prose-invert prose-zinc max-w-none">
              {/* Intro Section */}
              <motion.div 
                id="overview"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="p-10 md:p-14 rounded-[40px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-rose-600/10 flex items-center justify-center border border-rose-500/20">
                      <Info className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1">Intelligence Report</h2>
                      <h3 className="text-3xl font-black text-white tracking-tight">{movieTitle} Overview</h3>
                    </div>
                  </div>

                  <p className="text-zinc-300 leading-[1.8] text-xl font-medium relative z-10 selection:bg-rose-600/50">
                    {article.summary || `${movieTitle} is a groundbreaking ${article.genres?.join("/")} masterpiece that has redefined ${article.category} cinema. This intelligence report offers an exhaustive breakdown of its narrative structure, financial milestones, and its massive cultural impact.`}
                  </p>

                  <div className="mt-12 flex flex-wrap gap-4">
                    {article.genres?.map((genre, i) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        #{genre}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Overview Page Content */}
              {safePageType === "overview" && (
                <div className="space-y-24">
                  {/* Plot Summary */}
                  <motion.section 
                    id="plot"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-10 md:p-14 rounded-[40px] bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-orange-600/10 flex items-center justify-center border border-orange-500/20">
                        <BookOpen className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-1">Narrative</h2>
                        <h3 className="text-3xl font-black text-white tracking-tight">The Storyline</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-10">
                      {article.sections?.filter(s => s.heading.toLowerCase().includes("plot") || s.heading.toLowerCase().includes("story")).map((section, idx) => (
                        <div key={idx} className="relative pl-8 border-l-2 border-white/5">
                          <h4 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                            <span className="text-orange-500">0{idx + 1}.</span> {section.heading}
                          </h4>
                          <p className="text-zinc-400 leading-relaxed text-lg">{section.content}</p>
                        </div>
                      )) || <p className="text-zinc-500 italic text-lg">Detailed plot analysis is currently being synthesized by our cinematic experts.</p>}
                    </div>
                  </motion.section>

                  {/* Ending Explained */}
                  <motion.section 
                    id="ending"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-10 md:p-14 rounded-[40px] bg-gradient-to-br from-rose-600/[0.05] to-transparent border border-rose-500/10 relative overflow-hidden"
                  >
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-600/10 blur-[100px]" />
                    
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600/10 flex items-center justify-center border border-rose-500/20">
                        <Zap className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1">Deep Dive</h2>
                        <h3 className="text-3xl font-black text-white tracking-tight">Ending Explained</h3>
                      </div>
                    </div>

                    <div className="space-y-10">
                      {article.pSEO_Content_ending_explained?.length > 0 ? (
                        article.pSEO_Content_ending_explained.map((section, idx) => (
                          <div key={idx}>
                            <h4 className="text-xl font-black text-white mb-4">{section.heading}</h4>
                            <p className="text-zinc-400 leading-relaxed text-lg">{section.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-start">
                          <p className="text-zinc-300 text-lg leading-relaxed mb-8">
                            Uncover the layers of {movieTitle}'s climactic finale, explore fan theories, and decode the hidden messages that left audiences stunned.
                          </p>
                          <Link 
                            href={`/ott/${platform}/${movieSlug}-ending-explained`} 
                            className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
                          >
                            Read Deep Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.section>

                  {/* Financial Intelligence */}
                  <div id="boxoffice" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 rounded-xl bg-green-600/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">Box Office</h2>
                      </div>
                      <h3 className="text-4xl font-black text-white mb-4 group-hover:text-green-500 transition-colors">{article.boxOffice?.worldwide || "TBA"}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                        Worldwide gross earnings reflect the massive theatrical pull of {movieTitle} across key international markets.
                      </p>
                      <Link href={`/ott/${platform}/${movieSlug}-box-office`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
                        Full Report <ChevronRight className="w-4 h-4" />
                      </Link>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Production</h2>
                      </div>
                      <h3 className="text-4xl font-black text-white mb-4 group-hover:text-purple-500 transition-colors">{article.budget || "TBA"}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                        Estimated budget includes production costs and worldwide marketing spend for this high-scale feature.
                      </p>
                      <Link href={`/ott/${platform}/${movieSlug}-budget`} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
                        Budget Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </div>

                  {/* OTT Intelligence */}
                  <motion.section 
                    id="ott"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-10 md:p-14 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600/10 flex items-center justify-center border border-rose-500/20">
                        <Tv className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1">Streaming</h2>
                        <h3 className="text-3xl font-black text-white tracking-tight">OTT Release</h3>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                      <div className="flex-1">
                        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                          {article.ott?.platform ? (
                            <>Experience <span className="text-white font-bold">{movieTitle}</span> from the comfort of your home. The digital rights were acquired by <span className="text-rose-500 font-bold">{article.ott.platform}</span> for a record-breaking valuation.</>
                          ) : (
                            <>The digital release strategy for {movieTitle} is currently being finalized. Our intelligence team is monitoring platform negotiations closely.</>
                          )}
                        </p>
                        <Link 
                          href={`/ott/${platform}/${movieSlug}-ott-release`} 
                          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all"
                        >
                          Check Timeline <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                      
                      <div className="w-full md:w-64 p-8 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center group">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Official Platform</h4>
                        <div className="w-24 h-12 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500">
                          {isNetflix ? (
                            <img src={netflixLogo} alt="Netflix" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-xl shadow-rose-600/20">
                              <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-xl font-black text-white">
                          {isNetflix ? "Netflix" : (article.ott?.platform || platform)}
                        </span>
                      </div>
                    </div>
                  </motion.section>

                  {/* Cast & Performances */}
                  <motion.section 
                    id="cast"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-12"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Ensemble</h2>
                          <h3 className="text-3xl font-black text-white tracking-tight">Cast & Characters</h3>
                        </div>
                      </div>
                      <Link href={`/ott/${platform}/${movieSlug}-cast`} className="hidden md:flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                        Full Cast <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {article.cast?.slice(0, 4).map((actor, idx) => (
                        <motion.div 
                          key={idx}
                          whileHover={{ scale: 1.02, translateY: -5 }}
                          className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-blue-500/50 overflow-hidden relative">
                            {actor.image ? (
                              <img src={actor.image} alt={actor.name} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-8 h-8 text-zinc-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white mb-1 group-hover:text-blue-500 transition-colors">{actor.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{actor.role || "Lead Protagonist"}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Audience Reaction */}
                  <motion.section 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-10 md:p-14 rounded-[40px] bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-yellow-600/10 flex items-center justify-center border border-yellow-500/20">
                        <ThumbsUp className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-1">Reception</h2>
                        <h3 className="text-3xl font-black text-white tracking-tight">Audience Pulse</h3>
                      </div>
                    </div>
                    
                    <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                      {article.criticalResponse || `Critical consensus for ${movieTitle} highlights its technical mastery and narrative ambition. Audience sentiment remains overwhelmingly positive across digital platforms.`}
                    </p>
                    
                    <div className="flex flex-wrap gap-8">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-white mb-1">A+</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Critics Score</span>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-white mb-1">94%</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Audience Score</span>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <Link 
                        href={`/ott/${platform}/${movieSlug}-review-analysis`}
                        className="flex items-center gap-3 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:text-rose-400"
                      >
                        Read Critical Analysis <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.section>
                </div>
              )}

              {/* Generic Sub-Page Content Renderer */}
              {pageType !== "overview" && (
                <div className="space-y-24">
                  {contentSections.map((section, idx) => (
                    <motion.section 
                      key={idx}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-10 md:p-14 rounded-[40px] bg-white/[0.02] border border-white/5"
                    >
                      <h2 className="text-3xl font-black text-white mb-8 tracking-tight">{section.heading}</h2>
                      <p className="text-zinc-400 leading-relaxed text-lg">{section.content}</p>
                    </motion.section>
                  ))}
                </div>
              )}

              {/* Intelligence Network */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-32 pt-16 border-t border-white/10"
              >
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-xl bg-rose-600/10 flex items-center justify-center border border-rose-500/20">
                    <Target className="w-5 h-5 text-rose-600" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Intelligence Network</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cast */}
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Users className="w-4 h-4 text-rose-500" /> Cast Data
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.cast?.slice(0, 6).map((actor, idx) => (
                        <Link 
                          key={idx} 
                          href={`/celebrity/${slugify(actor.name)}`}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-rose-500/50 hover:bg-rose-500/5 transition-all uppercase tracking-widest"
                        >
                          {actor.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Similar */}
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Film className="w-4 h-4 text-rose-500" /> Discovery
                    </h3>
                    <Link 
                      href={`/discover/similar-to/${movieSlug}`}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-rose-600 hover:border-rose-600 transition-all"
                    >
                      <span className="text-sm font-bold text-white uppercase tracking-widest">Similar Movies</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* FAQ Section */}
            <motion.div 
              id="faq"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-24 border-t border-white/10"
            >
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-xl bg-rose-600/10 flex items-center justify-center border border-rose-500/20">
                  <HelpCircle className="w-5 h-5 text-rose-600" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Expert Q&A</h2>
              </div>
              <FAQDropdown faqs={faqs} loading={loadingFAQs} />
            </motion.div>
          </div>

          {/* Core Intelligence Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="p-10 rounded-[40px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-10">
                  <BarChart3 className="w-5 h-5 text-rose-600" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Core Intelligence</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Director", value: article.director?.join(", "), icon: <Film className="w-3.5 h-3.5" /> },
                    { label: "Production", value: article.productionHouse, icon: <Award className="w-3.5 h-3.5" /> },
                    { label: "Budget", value: article.budget, icon: <DollarSign className="w-3.5 h-3.5" /> },
                    { label: "Global Gross", value: article.boxOffice?.worldwide, icon: <TrendingUp className="w-3.5 h-3.5" /> },
                    { label: "Digital Platform", value: article.ott?.platform || platform, icon: <Tv className="w-3.5 h-3.5" /> },
                    { label: "Status", value: "Verified", icon: <Shield className="w-3.5 h-3.5 text-green-500" /> }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500/70 group-hover:text-rose-500 transition-colors">{stat.icon}</span>
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider">{stat.value || 'Not Disclosed'}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-6 rounded-3xl bg-rose-600/10 border border-rose-500/20 text-center">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Live Intelligence</p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">Data verified by our film analysts as of April 2026.</p>
                </div>
              </motion.div>

              {/* Related Intelligence Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                  <Activity className="w-16 h-16" />
                </div>
                <h3 className="text-lg font-black text-white mb-6">Need More Insights?</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-8">
                  Get real-time updates on box office movements and OTT shifts for {movieTitle}.
                </p>
                <button className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Subscribe to Updates
                </button>
              </motion.div>
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
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <motion.div 
          key={idx} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="faq-item rounded-3xl bg-white/[0.02] border border-white/5 hover:border-rose-500/30 transition-all duration-500 overflow-hidden"
        >
          <button 
            onClick={() => toggleFAQ(idx)} 
            className="w-full px-8 py-6 flex items-center justify-between text-left group"
          >
            <div className="flex items-start gap-6 pr-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${openIndex === idx ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-white/5 text-rose-500'}`}>
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className={`text-lg font-black leading-relaxed transition-colors duration-500 ${openIndex === idx ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                {faq.question}
              </h4>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/5 transition-all duration-500 ${openIndex === idx ? 'rotate-180 bg-white/10' : ''}`}>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </div>
          </button>
          
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
              >
                <div className="px-8 pb-8 pt-0 pl-[88px]">
                  <div className="h-px bg-gradient-to-r from-rose-500/20 via-rose-500/5 to-transparent mb-6"></div>
                  <p className="text-zinc-400 text-lg leading-relaxed font-medium selection:bg-rose-600/30">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

OTTMovieDetailPage.noPadding = true;
