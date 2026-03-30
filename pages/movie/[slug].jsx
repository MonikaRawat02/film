import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  FileText, Clock, User, ChevronRight, Share2, ThumbsUp, Eye, ArrowLeft, 
  Quote, CheckCircle, Clapperboard, Film, Tv, PlaySquare, TrendingUp, 
  Users, Zap, Target, BookOpen, Award, BarChart3, ShieldCheck, Heart, 
  MessageSquare, Bookmark, Check, DollarSign, List, Info, HelpCircle
} from "lucide-react";

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
      return { notFound: true };
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

const categoryIcons = {
  Bollywood: Clapperboard,
  Hollywood: Film,
  WebSeries: Tv,
  OTT: PlaySquare,
  BoxOffice: TrendingUp,
  Celebrities: Users,
};

export default function MovieDetailPage({ article, pageType, slug }) {
  const router = useRouter();
  const Icon = categoryIcons[article.category] || FileText;
  const [scrollProgress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  const pageTitleSuffix = pageTitles[pageType] || pageTitles.overview;
  const fullTitle = `${article.movieTitle || article.title} (${article.releaseYear}) – ${pageTitleSuffix}`;

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

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans relative pt-16">
        
        {/* Reading Progress Bar */}
        <div className="fixed top-16 left-0 right-0 z-[100] h-1 bg-white/5">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Dynamic Header */}
        <nav className={`fixed top-16 left-0 right-0 z-[40] transition-all duration-500 ${scrollProgress > 5 ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
          <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
            <Link 
              href={`/category/${article.category.toLowerCase()}`}
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline uppercase tracking-widest">Back to {article.category}</span>
            </Link>
            
            <div className={`flex-1 px-8 transition-all duration-500 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <h2 className="text-[10px] font-black text-white truncate max-w-md mx-auto text-center hidden md:block uppercase tracking-[0.3em]">
                {article.movieTitle} – {pageType.replace("-", " ")}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="p-3 text-zinc-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSave}
                className={`p-3 transition-all rounded-xl border border-white/5 ${isSaved ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-400 bg-white/5 hover:bg-white/10'}`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </nav>

        {/* Immersive Hero Section */}
        <div className="relative w-full h-[60vh] flex items-end justify-start overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            {article.coverImage ? (
              <img 
                src={article.coverImage} 
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
                  <Target className="w-3 h-3" />
                  {article.category} Intelligence
                </span>
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">{pageType.replace("-", " ")}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                {fullTitle}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <main className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            
            {/* Quick Links for pSEO pages */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <List className="w-4 h-4" /> Jump to Intel
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Overview", suffix: "" },
                  { label: "Ending Explained", suffix: "-ending-explained" },
                  { label: "Box Office", suffix: "-box-office" },
                  { label: "Budget", suffix: "-budget" },
                  { label: "OTT Release", suffix: "-ott-release" },
                  { label: "Cast", suffix: "-cast" },
                ].map((link, idx) => (
                  <Link 
                    key={idx}
                    href={`/movie/${article.slug}${link.suffix}`}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      (pageType === "overview" && link.suffix === "") || (pageType !== "overview" && link.suffix === `-${pageType}`)
                        ? "bg-red-600 text-white" 
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dynamic Content Rendering based on pageType */}
            <div className="prose prose-invert prose-zinc max-w-none">
              {pageType === "overview" && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Info className="w-6 h-6 text-red-600" /> Movie Overview
                  </h2>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    {article.summary}
                  </p>
                  
                  {article.sections?.map((section, idx) => (
                    <div key={idx} className="mt-8">
                      <h3 className="text-xl font-bold text-white mb-4">{section.heading}</h3>
                      <p className="text-zinc-400 leading-relaxed">{section.content}</p>
                    </div>
                  ))}
                </section>
              )}

              {pageType === "box-office" && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-red-600" /> Box Office Collection Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Worldwide Collection</p>
                      <p className="text-3xl font-black text-white">{article.boxOffice?.worldwide || "TBA"}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">India Net Collection</p>
                      <p className="text-3xl font-black text-white">{article.boxOffice?.india || "TBA"}</p>
                    </div>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    The box office performance of {article.movieTitle} has been a major talking point in the industry. 
                    With a global reach and strong domestic interest, the numbers reflect the audience's massive reaction to this cinematic intelligence.
                  </p>
                </section>
              )}

              {pageType === "cast" && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-red-600" /> Cast & Character Intel
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {article.cast?.map((actor, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                          <User className="w-6 h-6 text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{actor.name}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{actor.role || "Actor"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Add more sections for other pageTypes as needed */}
            </div>

            {/* FAQ Section (Required for SEO) */}
            <div className="pt-16 border-t border-white/10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-red-600" /> Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {article.meta?.faq?.length > 0 ? (
                  article.meta.faq.map((item, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-white font-bold mb-3">{item.question}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-white font-bold mb-3">When was {article.movieTitle} released?</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{article.movieTitle} was released in the year {article.releaseYear}.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              {/* Internal Linking Engine */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-600" /> Related Intelligence
                </h3>
                <div className="space-y-3">
                  <Link href={`/discover/similar-to/${article.slug}`}>
                    <a className="block text-sm font-bold text-zinc-400 hover:text-white transition-colors">Movies Like {article.movieTitle}</a>
                  </Link>
                  {article.genres?.map(genre => (
                    <Link key={genre} href={`/discover/genre/${slugify(genre)}`}>
                      <a className="block text-sm font-bold text-zinc-400 hover:text-white transition-colors">Best {genre} Movies</a>
                    </Link>
                  ))}
                  <Link href={`/discover/year/${article.releaseYear}`}>
                    <a className="block text-sm font-bold text-zinc-400 hover:text-white transition-colors">Top Movies of {article.releaseYear}</a>
                  </Link>
                </div>
              </div>

              {/* Intelligence Summary */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-600" /> Core Intelligence
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Director", value: article.director?.join(", ") || "N/A" },
                    { label: "Producer", value: article.producer?.join(", ") || "N/A" },
                    { label: "Writer", value: article.writer?.join(", ") || "N/A" },
                    { label: "Budget", value: article.budget || "TBA" },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-[11px] font-bold text-white uppercase text-right max-w-[150px] truncate">{stat.value}</span>
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
