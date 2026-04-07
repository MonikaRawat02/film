import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Film, Tv, PlaySquare, Clapperboard, TrendingUp,
  Share2, Bookmark, ChevronRight, Target, Users, Zap,
  Info, HelpCircle, Calendar, Globe, List, BookOpen, ThumbsUp,
  Clock, DollarSign, BarChart3, ShieldCheck, Star, Sparkles, ChevronDown
} from "lucide-react";
import { slugify } from "../../lib/slugify";

// Known platforms for routing logic
const PLATFORMS = [
  'netflix', 'amazon-prime', 'amazon-prime-video', 
  'disney-plus-hotstar', 'jiocinema', 'sonyliv', 'zee5'
];

export async function getServerSideProps(context) {
  const { platform } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    // 1. Check if it's a direct platform page
    if (PLATFORMS.includes(platform.toLowerCase())) {
      const res = await fetch(`${baseUrl}/api/discover/ott-platform?platform=${platform}`);
      const data = await res.json();

      if (!res.ok || !data.data) {
        return { notFound: true };
      }

      return {
        props: {
          mode: 'platform',
          movies: data.data.movies || [],
          platformInfo: data.data.platformInfo || {},
          platform,
        },
      };
    }

    // 2. Check if it's a platform-movie page (e.g., netflix-urban-legend)
    let matchedPlatform = null;
    let movieSlug = null;

    for (const p of PLATFORMS) {
      if (platform.toLowerCase().startsWith(`${p}-`)) {
        matchedPlatform = p;
        movieSlug = platform.substring(p.length + 1);
        break;
      }
    }

    if (matchedPlatform && movieSlug) {
      // Fetch movie data using the extracted slug
      const res = await fetch(`${baseUrl}/api/articles/get-by-slug?slug=${movieSlug}`);
      const data = await res.json();

      if (res.ok && data.data) {
        return {
          props: {
            mode: 'movie',
            article: data.data,
            platform: matchedPlatform,
            slug: platform, // Use the combined slug for canonical
          }
        };
      }
    }

    return { notFound: true };
  } catch (error) {
    console.error("OTT Route Error:", error);
    return { notFound: true };
  }
}

const platformIcons = {
  netflix: PlaySquare,
  "amazon-prime": PlaySquare,
  "disney-plus-hotstar": PlaySquare,
  jiocinema: PlaySquare,
  sonyliv: PlaySquare,
  zee5: PlaySquare,
};

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
        <div key={idx} className="faq-item rounded-2xl bg-gradient-to-br from-white/5 to-white/3 border border-white/10 hover:border-red-500/30 transition-all duration-300 overflow-hidden">
          <button onClick={() => toggleFAQ(idx)} className="w-full px-6 py-5 flex items-center justify-between text-left group">
            <div className="flex items-start gap-4 pr-4">
              <HelpCircle className="w-5 h-5 text-red-500/70 mt-1" />
              <h4 className="text-base md:text-lg font-bold text-white leading-relaxed group-hover:text-red-400 transition-colors">{faq.question}</h4>
            </div>
            <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
          </button>
          <div className={`faq-answer ${openIndex === idx ? 'open' : ''}`}>
            <div className="px-6 pb-6 pt-0 pl-14 md:pl-16">
              <div className="h-px bg-gradient-to-r from-red-500/20 via-red-500/50 to-red-500/20 mb-4"></div>
              <p className="text-zinc-300 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Page Component ---

export default function OTTPlatformPage(props) {
  const { mode, platform } = props;
  const router = useRouter();

  // Mode: Platform List
  if (mode === 'platform') {
    const { movies, platformInfo } = props;
    const Icon = platformIcons[platform.toLowerCase()] || Film;

    return (
      <>
        <Head>
          <title>{platformInfo.metaTitle || `Movies on ${platformInfo.displayName || platform}`} | FilmyFire</title>
          <meta name="description" content={platformInfo.metaDescription || `Watch the best movies available on ${platformInfo.displayName || platform}`} />
          <link rel="canonical" href={`https://filmyfire.com/ott/${platform}`} />
        </Head>

        <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans pt-32 pb-24">
          <nav className="fixed top-16 left-0 right-0 z-[40] bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4">
            <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline uppercase tracking-widest">Back to Home</span>
              </Link>
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] hidden md:block">
                OTT Intelligence: {platformInfo.displayName || platform}
              </h2>
              <span className="px-3 py-1 rounded-lg bg-red-600/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                {movies.length} Titles
              </span>
            </div>
          </nav>

          <div className="max-w-[1440px] mx-auto px-6 mb-16">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Icon className="w-3 h-3" />
                  OTT Platform
                </span>
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">Streaming Intelligence</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                {platformInfo.heroTitle || `Movies Available on ${platformInfo.displayName || platform}`}
              </h1>
              <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl">
                {platformInfo.description || `Explore our comprehensive collection of movies streaming on ${platformInfo.displayName || platform}. Find detailed analysis, box office reports, and expert reviews.`}
              </p>
            </div>
          </div>

          <main className="max-w-[1440px] mx-auto px-6">
            {movies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {movies.map((movie, idx) => (
                  <div key={idx} className="group relative bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden hover:border-red-600/50 transition-all duration-500 hover:-translate-y-2">
                    <Link href={`/ott/${platform}-${movie.slug}`} className="block">
                      <div className="aspect-[2/3] overflow-hidden relative">
                        {movie.coverImage ? (
                          <img src={movie.coverImage} alt={movie.movieTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Film className="w-12 h-12 text-zinc-700" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">{movie.releaseYear}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{movie.category}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Intelligence Report</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors line-clamp-2 mb-3">{movie.movieTitle}</h3>
                        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-6">{movie.summary}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">View Analysis</span>
                          <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <Film className="w-24 h-24 text-zinc-800 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Movies Available Yet</h3>
                <Link href="/" className="inline-block px-8 py-3 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">Browse All Movies</Link>
              </div>
            )}
          </main>
        </div>
      </>
    );
  }

  // Mode: Movie Detail (Platform-Specific URL)
  if (mode === 'movie') {
    const { article } = props;
    const [scrollProgress, setProgress] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [loadingFAQs, setLoadingFAQs] = useState(true);

    useEffect(() => {
      if (typeof window !== "undefined") {
        const saved = JSON.parse(localStorage.getItem("saved_articles") || "[]");
        setIsSaved(saved.includes(article?._id));
      }
    }, [article?._id]);

    useEffect(() => {
      async function loadFAQs() {
        try {
          setLoadingFAQs(true);
          const res = await fetch('/api/movie/generate-faq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: article.slug, pageType: 'overview' })
          });
          if (res.ok) {
            const result = await res.json();
            setFaqs(result.data || []);
          }
        } catch (error) { console.error('FAQ fetch error:', error); }
        finally { setLoadingFAQs(false); }
      }
      loadFAQs();
    }, [article.slug]);

    useEffect(() => {
      const handleScroll = () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setProgress((window.scrollY / total) * 100);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const movieTitle = article.movieTitle || article.title;
    const releaseYear = article.releaseYear ? `(${article.releaseYear})` : "";
    const fullTitle = `${movieTitle} Movie ${releaseYear} – Full Analysis, Box Office & OTT Details`;

    return (
      <>
        <Head>
          <title>{fullTitle} | FilmyFire Intelligence</title>
          <meta name="description" content={article.meta?.description || article.summary?.substring(0, 160)} />
          <link rel="canonical" href={`https://filmyfire.com/ott/${platform}-${article.slug}`} />
        </Head>

        <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans relative pt-16 top-0">
          <div className="fixed top-16 left-0 right-0 z-[100] h-1 bg-white/5">
            <div className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 transition-all duration-150 progress-bar-fill" style={{ width: `${scrollProgress}%` }} />
          </div>

          <nav className={`fixed top-16 left-0 right-0 z-[40] transition-all duration-500 ${scrollProgress > 5 ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
            <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
              <Link href={`/ott/${platform}`} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline uppercase tracking-widest">Back to {platform.toUpperCase()}</span>
              </Link>
              <div className={`flex-1 px-8 transition-all duration-500 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <h2 className="text-[10px] font-black text-white truncate max-w-md mx-auto text-center hidden md:block uppercase tracking-[0.3em]">
                  {movieTitle} – Overview
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { navigator.share?.({ title: article.title, url: window.location.href }); }} className="p-3 text-zinc-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className={`p-3 transition-all rounded-xl border border-white/5 ${isSaved ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-400 bg-white/5 hover:bg-white/10'}`}>
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </nav>

          <div className="relative w-full h-[60vh] flex items-end justify-start overflow-hidden pt-16">
            <div className="absolute inset-0 z-0">
              {article.coverImage ? (
                <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
              <div className="absolute inset-0 hero-glow opacity-30"></div>
            </div>
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 pb-12">
              <div className="max-w-5xl">
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Target className="w-3 h-3" /> {article.category} Intelligence
                  </span>
                  <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">Overview</span>
                  {article.rating && <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold bg-yellow-500/10 px-3 py-1 rounded-full"><Star className="w-3 h-3 fill-yellow-400" />{article.rating}/10</span>}
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">{fullTitle}</h1>
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
                <section className="space-y-12">
                  <div className="p-8 rounded-3xl glass-panel relative overflow-hidden">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><Info className="w-6 h-6 text-red-600" /> {movieTitle} Movie Overview</h2>
                    <p className="text-zinc-300 leading-relaxed text-lg">{article.summary}</p>
                  </div>
                  {/* Additional sections can be rendered here */}
                </section>
                
                {/* Intelligence Network */}
                <div className="mt-20 pt-12 border-t border-white/10">
                  <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><Target className="w-6 h-6 text-red-600" /> Intelligence Network</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Cast Intelligence</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.cast?.slice(0, 5).map((actor, idx) => (
                          <Link key={idx} href={`/celebrity/${slugify(actor.name)}`} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-red-500/50 transition-all">{actor.name}</Link>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Tv className="w-4 h-4" /> Streaming Hub</h3>
                      <Link href={`/ott/${platform}`} className="inline-block px-4 py-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-600 hover:text-white transition-all">Back to {platform.toUpperCase()}</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 border-t border-white/10">
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><HelpCircle className="w-6 h-6 text-red-600" /> Frequently Asked Questions</h2>
                <FAQDropdown faqs={faqs} loading={loadingFAQs} />
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-8">
              <div className="sticky top-32 space-y-8">
                <div className="p-6 rounded-3xl glass-panel">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-red-600" /> Core Intelligence</h3>
                  <div className="space-y-4">
                    {[{ label: "Director", value: article.director?.join(", ") }, { label: "Budget", value: article.budget }, { label: "Worldwide", value: article.boxOffice?.worldwide }].map((stat, i) => (
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

  return null;
}
