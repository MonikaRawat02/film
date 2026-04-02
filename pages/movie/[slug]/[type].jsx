import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  ArrowLeft, Share2, Bookmark, ChevronRight, Target,
  Film, Tv, PlaySquare, TrendingUp, Users, Zap,
  Info, HelpCircle, Calendar, DollarSign, Star
} from "lucide-react";

// Valid page types for pSEO
const PAGE_TYPES = [
  "overview",
  "ending-explained",
  "budget-box-office",
  "cast-analysis",
  "ott-release",
  "review-analysis",
  "hit-or-flop"
];

const pageTypeLabels = {
  overview: "Overview",
  "ending-explained": "Ending Explained",
  "budget-box-office": "Budget & Box Office",
  "cast-analysis": "Cast Analysis",
  "ott-release": "OTT Release",
  "review-analysis": "Review Analysis",
  "hit-or-flop": "Hit or Flop"
};

export async function getServerSideProps(context) {
  const { slug, type } = context.params;
  const pageType = type || "overview";

  // Validate page type
  if (!PAGE_TYPES.includes(pageType)) {
    return { notFound: true };
  }

  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/movie/get-movie-data?slug=${encodeURIComponent(slug)}&type=${pageType}`);
    
    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();

    return {
      props: {
        movie: data.data,
        pageType
      }
    };
  } catch (error) {
    console.error("pSEO Page Error:", error);
    return { notFound: true };
  }
}

export default function MovieTypePage({ movie, pageType }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      setIsSaved(savedArticles.includes(movie?._id));
    }
  }, [movie?._id]);

  if (!movie) return null;

  const Icon = movie.category === "Bollywood" ? Film : movie.category === "WebSeries" ? Tv : PlaySquare;

  return (
    <>
      <Head>
        <title>{movie.metaData?.title || `${movie.movieTitle} | FilmyFire`}</title>
        <meta name="description" content={movie.metaData?.description} />
        <link rel="canonical" href={`https://filmyfire.com${movie.metaData?.canonical}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={movie.metaData?.openGraph?.title} />
        <meta property="og:description" content={movie.metaData?.openGraph?.description} />
        <meta property="og:image" content={movie.coverImage} />
        <meta property="og:type" content="article" />
        
        {/* Keywords */}
        <meta name="keywords" content={movie.metaData?.keywords?.join(", ")} />
      </Head>

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans pt-24 pb-24">
        
        {/* Navigation Header */}
        <nav className="fixed top-16 left-0 right-0 z-[40] bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4">
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link 
              href={`/category/${movie.category?.toLowerCase()}`}
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline uppercase tracking-widest">Back to {movie.category}</span>
            </Link>
            
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] hidden md:block">
              {movie.movieTitle} – {pageTypeLabels[pageType]}
            </h2>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="p-3 text-zinc-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const saved = JSON.parse(localStorage.getItem("saved_articles") || "[]");
                  if (isSaved) {
                    localStorage.setItem("saved_articles", JSON.stringify(saved.filter(id => id !== movie._id)));
                  } else {
                    localStorage.setItem("saved_articles", JSON.stringify([...saved, movie._id]));
                  }
                  setIsSaved(!isSaved);
                }}
                className={`p-3 transition-all rounded-xl border border-white/5 ${
                  isSaved ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative w-full h-[50vh] flex items-end justify-start overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            {movie.coverImage ? (
              <img 
                src={movie.coverImage} 
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 pb-12">
            <div className="max-w-5xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Icon className="w-3 h-3" />
                  {movie.category} Intelligence
                </span>
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                  {pageTypeLabels[pageType]}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                {movie.movieTitle} ({movie.releaseYear}) – {pageTypeLabels[pageType]}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <main className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Page Type Navigation */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> Explore This Movie
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PAGE_TYPES.map((ptype) => (
                  <Link 
                    key={ptype}
                    href={`/movie/${movie.slug}${ptype === 'overview' ? '' : `/${ptype}`}`}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      pageType === ptype
                        ? "bg-red-600 text-white" 
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {pageTypeLabels[ptype]}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dynamic Content Sections */}
            <div className="space-y-12">
              {movie.contentSections?.map((section, idx) => (
                <section key={idx} className="prose prose-invert prose-zinc max-w-none">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    {section.type === "introduction" && <Info className="w-7 h-7 text-red-600" />}
                    {section.type === "plot" && <Film className="w-7 h-7 text-blue-600" />}
                    {section.type.includes("box-office") && <TrendingUp className="w-7 h-7 text-green-600" />}
                    {section.type.includes("budget") && <DollarSign className="w-7 h-7 text-amber-600" />}
                    {section.type.includes("cast") && <Users className="w-7 h-7 text-purple-600" />}
                    {section.type.includes("ott") && <Tv className="w-7 h-7 text-cyan-600" />}
                    {section.type.includes("ending") && <HelpCircle className="w-7 h-7 text-orange-600" />}
                    {section.type === "verdict" && <Star className="w-7 h-7 text-red-600" />}
                    {section.heading}
                  </h2>
                  <p className="text-zinc-300 leading-relaxed text-lg">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="pt-16 border-t border-white/10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-red-600" /> Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {[
                  {
                    question: `When was ${movie.movieTitle} released?`,
                    answer: `${movie.movieTitle} was officially released in ${movie.releaseYear}.`
                  },
                  {
                    question: `Who directed ${movie.movieTitle}?`,
                    answer: `${movie.movieTitle} was directed by ${movie.director?.[0] || 'the director'}.`
                  },
                  {
                    question: `Where can I watch ${movie.movieTitle}?`,
                    answer: `${movie.movieTitle} is available on ${movie.ott?.platform || 'streaming platforms'}.`
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all duration-300">
                    <h4 className="text-lg font-bold text-white mb-3 leading-relaxed">{faq.question}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              
              {/* Quick Stats */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-600" /> Core Intelligence
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Director", value: movie.director?.[0] || "N/A" },
                    { label: "Release Year", value: movie.releaseYear || "N/A" },
                    { label: "Genres", value: movie.genres?.slice(0, 2).join(", ") || "N/A" },
                    { label: "Rating", value: movie.rating || "N/A" }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-[11px] font-bold text-white uppercase text-right truncate">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Movies */}
              {movie.relatedMovies?.length > 0 && (
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-600" /> Related Intelligence
                  </h3>
                  <div className="space-y-4">
                    {movie.relatedMovies.slice(0, 3).map((related, idx) => (
                      <Link 
                        key={idx}
                        href={`/movie/${related.slug}`}
                        className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                          {related.coverImage ? (
                            <img 
                              src={related.coverImage} 
                              alt={related.movieTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-zinc-700" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors truncate">
                            {related.movieTitle}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            {related.releaseYear} • {related.category}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>

        </main>
      </div>
    </>
  );
}
