import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { slugify } from "../../lib/slugify";
import { 
  FileText, Clock, User, ChevronRight, Share2, ThumbsUp, Eye, ArrowLeft, 
  Quote, CheckCircle, Clapperboard, Film, Tv, PlaySquare, TrendingUp, 
  Users, Zap, Target, BookOpen, Award, BarChart3, ShieldCheck, Heart, 
  MessageSquare, Bookmark, Check, DollarSign, List, Info, HelpCircle, Calendar, Globe
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

// Dynamic FAQ Generator Function
function generateFAQs(article, pageType) {
  const movieTitle = article.movieTitle;
  const releaseYear = article.releaseYear;
  const director = article.director?.[0] || "the director";
  const cast = article.cast?.slice(0, 3).map(c => c.name).join(", ") || "the cast";
  const genres = article.genres?.join(", ") || "action";
  const budget = article.budget || "N/A";
  const boxOffice = article.stats?.worldwide || article.boxOffice?.worldwide || "N/A";
  const ottPlatform = article.ott?.platform || "streaming platforms";
  const rating = article.rating || "N/A";

  // Base FAQs that work for all movies
  const baseFAQs = [
    {
      question: `When was ${movieTitle} released?`,
      answer: `${movieTitle} was officially released in ${releaseYear}. The film premiered in theaters worldwide and later became available on ${ottPlatform}.`
    },
    {
      question: `Who directed ${movieTitle}?`,
      answer: `${movieTitle} was directed by ${director}, who brought their unique vision to this ${genres} film. The director is known for their distinctive storytelling style and visual approach.`
    },
    {
      question: `What is the story of ${movieTitle} about?`,
      answer: article.summary || `Without revealing spoilers, ${movieTitle} explores themes common to the ${genres} genre. The film follows a compelling narrative that keeps audiences engaged throughout.`
    }
  ];

  // Page-specific FAQs
  const pageSpecificFAQs = {
    "overview": [
      {
        question: `Where can I watch ${movieTitle}?`,
        answer: `${movieTitle} is available for streaming on ${ottPlatform}. You can also catch it in select theaters depending on your location. Check local listings for showtimes.`
      },
      {
        question: `What is the IMDb rating of ${movieTitle}?`,
        answer: `${movieTitle} currently holds an IMDb rating of ${rating}/10. Audience reception has been ${parseFloat(rating) >= 7 ? 'positive' : 'mixed'}, with critics praising various aspects of the production.`
      }
    ],
    "box-office": [
      {
        question: `How much did ${movieTitle} collect at the box office?`,
        answer: `${movieTitle} grossed approximately ${boxOffice} worldwide. The film's commercial performance varied across different markets, with particularly strong showing in domestic circuits.`
      },
      {
        question: `Was ${movieTitle} a hit or flop?`,
        answer: `Based on its box office collection of ${boxOffice} against a budget of ${budget}, ${movieTitle} can be considered ${parseInt(boxOffice) > parseInt(budget) * 2 ? 'a commercial success' : 'an average performer'}. The film's profitability also includes revenue from digital and satellite rights.`
      },
      {
        question: `Which regions contributed most to ${movieTitle}'s box office?`,
        answer: `${movieTitle} performed exceptionally well in key markets including Mumbai, Delhi-NCR, and overseas territories like UAE and USA. The film showed strong occupancy in multiplexes and single-screen theaters alike.`
      }
    ],
    "budget": [
      {
        question: `What was the budget of ${movieTitle}?`,
        answer: `${movieTitle} was made on an estimated budget of ${budget}. This includes production costs, marketing expenses, and distribution charges. The budget reflects the film's scale and ambition.`
      },
      {
        question: `Did ${movieTitle} recover its budget?`,
        answer: `Yes, ${movieTitle} successfully recovered its budget through a combination of theatrical collections, digital streaming rights, satellite rights, and music sales. The film's OTT deal with ${ottPlatform} was particularly lucrative.`
      },
      {
        question: `How does ${movieTitle}'s budget compare to other films in the genre?`,
        answer: `With a budget of ${budget}, ${movieTitle} ranks among the ${genres.toLowerCase()} films with significant production investment. The allocation covered extensive VFX work, elaborate sets, and high-profile cast remuneration.`
      }
    ],
    "ending-explained": [
      {
        question: `Does ${movieTitle} have a sequel or prequel?`,
        answer: `As of now, there's no official announcement regarding a sequel or prequel to ${movieTitle}. However, given the film's ${boxOffice !== 'N/A' ? 'commercial performance' : 'reception'}, future installments remain a possibility.`
      },
      {
        question: `What is the main message of ${movieTitle}?`,
        answer: `${movieTitle} explores deeper themes beneath its ${genres} exterior. The film delivers commentary on human nature, relationships, and societal expectations, leaving audiences with thought-provoking takeaways.`
      }
    ],
    "ott-release": [
      {
        question: `Is ${movieTitle} available on Netflix/Prime/other platforms?`,
        answer: `${movieTitle} is exclusively available on ${ottPlatform}. The digital streaming rights were acquired as part of a strategic distribution deal, making it accessible to subscribers of the platform.`
      },
      {
        question: `When did ${movieTitle} start streaming on OTT?`,
        answer: `${movieTitle} began streaming on ${ottPlatform} shortly after its theatrical run. The exact OTT release date typically falls 4-8 weeks after the cinema premiere, depending on box office performance.`
      }
    ],
    "cast": [
      {
        question: `Who are the main actors in ${movieTitle}?`,
        answer: `${movieTitle} stars ${cast}. The ensemble cast brings depth to their characters, with each actor contributing to the film's overall impact through powerful performances.`
      },
      {
        question: `Are there any cameo appearances in ${movieTitle}?`,
        answer: `${movieTitle} features several surprise cameo appearances that enhance the viewing experience. These special appearances add layers to the narrative and provide memorable moments for audiences.`
      }
    ],
    "review-analysis": [
      {
        question: `What are critics saying about ${movieTitle}?`,
        answer: `Critics have given ${movieTitle} ${parseFloat(rating) >= 7 ? 'largely positive' : 'mixed'} reviews, with praise for ${parseFloat(rating) >= 7 ? 'its direction, performances, and technical brilliance' : 'certain aspects while noting areas that could have been stronger'}. The film holds a rating of ${rating}/10.`
      },
      {
        question: `Is ${movieTitle} worth watching?`,
        answer: `${movieTitle} offers ${parseFloat(rating) >= 7 ? 'a compelling cinematic experience with strong performances and engaging storytelling' : 'entertainment value, though it may not meet all expectations'}. Fans of the ${genres} genre will find plenty to appreciate.`
      }
    ]
  };

  // Combine base FAQs with page-specific ones
  const specificFAQs = pageSpecificFAQs[pageType] || pageSpecificFAQs.overview;
  
  // Return first 5-6 FAQs (mix of base and specific)
  return [...baseFAQs.slice(0, 3), ...specificFAQs.slice(0, 3)].slice(0, 6);
}

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
  const [faqs, setFaqs] = useState([]);
  const [loadingFAQs, setLoadingFAQs] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
      const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
      setIsLiked(likedArticles.includes(article?._id));
      setIsSaved(savedArticles.includes(article?._id));
    }
  }, [article?._id]);

  // Fetch dynamic FAQs from AI
  useEffect(() => {
    async function loadFAQs() {
      try {
        setLoadingFAQs(true);
        const res = await fetch('/api/movie/generate-faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, pageType })
        });
        
        if (res.ok) {
          const result = await res.json();
          setFaqs(result.data || []);
        } else {
          console.error('Failed to fetch FAQs');
        }
      } catch (error) {
        console.error('FAQ fetch error:', error);
      } finally {
        setLoadingFAQs(false);
      }
    }

    loadFAQs();
  }, [slug, pageType]);

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

      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans relative pt-16 top-0">
        
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
            
            <div className={`flex-1 px-8 transition-all duration-500 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none top-0'}`}>
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
              {pageType === "box-office" && (
                <>
                  {/* Hero Stats - Opening Weekend Focus */}
                  <section className="mb-12">
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
                          <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Worldwide Total</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2">
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
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">India Net</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2">
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
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Opening Day</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2">
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
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
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
                      {article.boxOffice?.territorialBreakdown?.length > 0 && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Territorial Distribution</h4>
                          <div className="space-y-4">
                            {article.boxOffice.territorialBreakdown.map((region, idx) => (
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
                      )}

                      {/* Overseas Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {article.boxOffice?.overseasMarkets?.length > 0 && (
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-cyan-400" /> Overseas Markets
                            </h4>
                            <div className="space-y-3">
                              {article.boxOffice.overseasMarkets.map((market, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                  <span className="text-sm text-zinc-400">{market.market}</span>
                                  <span className="text-sm font-bold text-white">{market.amount || "N/A"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Verdict */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-red-400" /> Box Office Verdict
                          </h4>
                          <div className="text-center py-8">
                            <div className="inline-block px-6 py-3 rounded-full bg-red-600/20 border border-red-500/30 mb-4">
                              <span className="text-2xl font-black text-red-400 uppercase tracking-widest">
                                {article.boxOffice?.verdict || article.stats?.verdict || "Average"}
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
              
              {loadingFAQs ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                      <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : faqs.length > 0 ? (
                <div className="space-y-6">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all duration-300">
                      <h4 className="text-lg font-bold text-white mb-3 leading-relaxed">{faq.question}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-zinc-400 text-sm">Loading FAQs...</p>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              {/* Related Movies - Powered by Recommendation Engine */}
              {article.relatedMovies && article.relatedMovies.length > 0 && (
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-600" /> Related Intelligence
                  </h3>
                  <div className="space-y-4">
                    {article.relatedMovies.map((movie, idx) => (
                      <Link 
                        key={idx}
                        href={`/movie/${movie.slug}`}
                        className="group block"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                          {movie.coverImage ? (
                            <img 
                              src={movie.coverImage} 
                              alt={movie.movieTitle}
                              className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-24 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Film className="w-6 h-6 text-zinc-700" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors truncate mb-1">
                              {movie.movieTitle}
                            </h4>
                            <p className="text-[10px] text-zinc-500 mb-2">{movie.releaseYear}</p>
                            {movie.similarityScore && (
                              <span className={`inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                                movie.similarityScore >= 80 ? 'bg-green-500/20 text-green-400' :
                                movie.similarityScore >= 60 ? 'bg-blue-500/20 text-blue-400' :
                                'bg-zinc-700 text-zinc-400'
                              }`}>
                                {movie.matchLevel || `${movie.similarityScore}% Match`}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fallback: Basic Internal Linking (if no related movies yet) */}
              {(!article.relatedMovies || article.relatedMovies.length === 0) && (
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-600" /> Related Intelligence
                  </h3>
                  <div className="space-y-3">
                    <Link href={`/discover/similar-to/${article.slug}`} className="block text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                      Movies Like {article.movieTitle}
                    </Link>
                    {article.genres?.map(genre => (
                      <Link key={genre} href={`/discover/genre/${slugify(genre)}`} className="block text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                        Best {genre} Movies
                      </Link>
                    ))}
                    <Link href={`/discover/year/${article.releaseYear}`} className="block text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                      Top Movies of {article.releaseYear}
                    </Link>
                  </div>
                </div>
              )}

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
              
              {/* OTT Platform Badge - Clickable Link */}
              {article.ott?.platform && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Tv className="w-4 h-4 text-red-600" /> Stream Now
                  </h3>
                  <Link href={`/ott/${slugify(article.ott.platform)}`} className="block group">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Available On</p>
                          <p className="text-lg font-black text-white group-hover:text-red-500 transition-colors">
                            {article.ott.platform}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/30 transition-all">
                          <svg className="w-5 h-5 text-red-600 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                  </Link>
                  {article.ott?.releaseDate && (
                    <p className="text-[10px] text-zinc-500 mt-3 uppercase tracking-wider">
                      Streaming since {new Date(article.ott.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
// import { useState, useEffect, useRef } from "react";
// import Head from "next/head";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { slugify } from "../../lib/slugify";
// import { 
//   FileText, Clock, User, ChevronRight, Share2, ThumbsUp, Eye, ArrowLeft, 
//   Quote, CheckCircle, Clapperboard, Film, Tv, PlaySquare, TrendingUp, 
//   Users, Zap, Target, BookOpen, Award, BarChart3, ShieldCheck, Heart, 
//   MessageSquare, Bookmark, Check, DollarSign, List, Info, HelpCircle, Calendar, Globe,
//   ChevronDown, Star, ExternalLink, Sparkles
// } from "lucide-react";

// export async function getServerSideProps(context) {
//   const { slug } = context.params;
//   const protocol = context.req.headers["x-forwarded-proto"] || "http";
//   const host = context.req.headers.host;
//   const baseUrl = `${protocol}://${host}`;

//   try {
//     const res = await fetch(`${baseUrl}/api/articles/get-by-slug?slug=${slug}`);
//     const data = await res.json();

//     if (!res.ok || !data.data) {
//       return { notFound: true };
//     }

//     const article = data.data;
//     let pageType = "overview";

//     if (slug.endsWith("-ending-explained")) pageType = "ending-explained";
//     else if (slug.endsWith("-box-office")) pageType = "box-office";
//     else if (slug.endsWith("-budget")) pageType = "budget";
//     else if (slug.endsWith("-ott-release")) pageType = "ott-release";
//     else if (slug.endsWith("-cast")) pageType = "cast";
//     else if (slug.endsWith("-review-analysis")) pageType = "review-analysis";
//     else if (slug.endsWith("-hit-or-flop")) pageType = "hit-or-flop";

//     return {
//       props: {
//         article,
//         pageType,
//         slug,
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching article for pSEO:", error);
//     return { notFound: true };
//   }
// }

// const pageTitles = {
//   overview: "Full Analysis, Box Office & OTT Details",
//   "ending-explained": "Ending Explained & Hidden Meanings",
//   "box-office": "Box Office Collection & Financial Report",
//   budget: "Budget, Production Costs & Profit Analysis",
//   "ott-release": "OTT Release Date & Streaming Platform Details",
//   cast: "Cast, Characters & Performance Analysis",
//   "review-analysis": "Critical Review & Audience Reaction Analysis",
//   "hit-or-flop": "Hit or Flop? Verdict & Performance Analysis",
// };

// // Enhanced FAQ Generator with dropdown structure
// function generateFAQs(article, pageType) {
//   const movieTitle = article.movieTitle;
//   const releaseYear = article.releaseYear;
//   const director = article.director?.[0] || "the director";
//   const cast = article.cast?.slice(0, 3).map(c => c.name).join(", ") || "the cast";
//   const genres = article.genres?.join(", ") || "action";
//   const budget = article.budget || "N/A";
//   const boxOffice = article.stats?.worldwide || article.boxOffice?.worldwide || "N/A";
//   const ottPlatform = article.ott?.platform || "streaming platforms";
//   const rating = article.rating || "N/A";

//   const baseFAQs = [
//     {
//       question: `When was ${movieTitle} released?`,
//       answer: `${movieTitle} was officially released in ${releaseYear}. The film premiered in theaters worldwide and later became available on ${ottPlatform}.`
//     },
//     {
//       question: `Who directed ${movieTitle}?`,
//       answer: `${movieTitle} was directed by ${director}, who brought their unique vision to this ${genres} film. The director is known for their distinctive storytelling style and visual approach.`
//     },
//     {
//       question: `What is the story of ${movieTitle} about?`,
//       answer: article.summary || `Without revealing spoilers, ${movieTitle} explores themes common to the ${genres} genre. The film follows a compelling narrative that keeps audiences engaged throughout.`
//     }
//   ];

//   const pageSpecificFAQs = {
//     "overview": [
//       {
//         question: `Where can I watch ${movieTitle}?`,
//         answer: `${movieTitle} is available for streaming on ${ottPlatform}. You can also catch it in select theaters depending on your location. Check local listings for showtimes.`
//       },
//       {
//         question: `What is the IMDb rating of ${movieTitle}?`,
//         answer: `${movieTitle} currently holds an IMDb rating of ${rating}/10. Audience reception has been ${parseFloat(rating) >= 7 ? 'positive' : 'mixed'}, with critics praising various aspects of the production.`
//       },
//       {
//         question: `Is ${movieTitle} worth watching?`,
//         answer: `${movieTitle} offers ${parseFloat(rating) >= 7 ? 'a compelling cinematic experience with strong performances and engaging storytelling' : 'entertainment value, though it may not meet all expectations'}. Fans of the ${genres} genre will find plenty to appreciate.`
//       }
//     ],
//     "box-office": [
//       {
//         question: `How much did ${movieTitle} collect at the box office?`,
//         answer: `${movieTitle} grossed approximately ${boxOffice} worldwide. The film's commercial performance varied across different markets, with particularly strong showing in domestic circuits.`
//       },
//       {
//         question: `Was ${movieTitle} a hit or flop?`,
//         answer: `Based on its box office collection of ${boxOffice} against a budget of ${budget}, ${movieTitle} can be considered ${parseInt(boxOffice) > parseInt(budget) * 2 ? 'a commercial success' : 'an average performer'}. The film's profitability also includes revenue from digital and satellite rights.`
//       },
//       {
//         question: `Which regions contributed most to ${movieTitle}'s box office?`,
//         answer: `${movieTitle} performed exceptionally well in key markets including Mumbai, Delhi-NCR, and overseas territories like UAE and USA. The film showed strong occupancy in multiplexes and single-screen theaters alike.`
//       }
//     ],
//     "budget": [
//       {
//         question: `What was the budget of ${movieTitle}?`,
//         answer: `${movieTitle} was made on an estimated budget of ${budget}. This includes production costs, marketing expenses, and distribution charges. The budget reflects the film's scale and ambition.`
//       },
//       {
//         question: `Did ${movieTitle} recover its budget?`,
//         answer: `Yes, ${movieTitle} successfully recovered its budget through a combination of theatrical collections, digital streaming rights, satellite rights, and music sales. The film's OTT deal with ${ottPlatform} was particularly lucrative.`
//       }
//     ],
//     "ending-explained": [
//       {
//         question: `Does ${movieTitle} have a sequel or prequel?`,
//         answer: `As of now, there's no official announcement regarding a sequel or prequel to ${movieTitle}. However, given the film's ${boxOffice !== 'N/A' ? 'commercial performance' : 'reception'}, future installments remain a possibility.`
//       },
//       {
//         question: `What is the main message of ${movieTitle}?`,
//         answer: `${movieTitle} explores deeper themes beneath its ${genres} exterior. The film delivers commentary on human nature, relationships, and societal expectations, leaving audiences with thought-provoking takeaways.`
//       }
//     ],
//     "ott-release": [
//       {
//         question: `Is ${movieTitle} available on Netflix/Prime/other platforms?`,
//         answer: `${movieTitle} is exclusively available on ${ottPlatform}. The digital streaming rights were acquired as part of a strategic distribution deal.`
//       },
//       {
//         question: `When did ${movieTitle} start streaming on OTT?`,
//         answer: `${movieTitle} began streaming on ${ottPlatform} shortly after its theatrical run. The exact OTT release date typically falls 4-8 weeks after the cinema premiere.`
//       }
//     ],
//     "cast": [
//       {
//         question: `Who are the main actors in ${movieTitle}?`,
//         answer: `${movieTitle} stars ${cast}. The ensemble cast brings depth to their characters, with each actor contributing to the film's overall impact.`
//       },
//       {
//         question: `Are there any cameo appearances in ${movieTitle}?`,
//         answer: `${movieTitle} features several surprise cameo appearances that enhance the viewing experience. These special appearances add layers to the narrative.`
//       }
//     ],
//     "review-analysis": [
//       {
//         question: `What are critics saying about ${movieTitle}?`,
//         answer: `Critics have given ${movieTitle} ${parseFloat(rating) >= 7 ? 'largely positive' : 'mixed'} reviews, with praise for ${parseFloat(rating) >= 7 ? 'its direction, performances, and technical brilliance' : 'certain aspects while noting areas that could have been stronger'}. The film holds a rating of ${rating}/10.`
//       },
//       {
//         question: `Is ${movieTitle} worth watching?`,
//         answer: `${movieTitle} offers ${parseFloat(rating) >= 7 ? 'a compelling cinematic experience' : 'entertainment value'}. ${parseFloat(rating) >= 7 ? 'Highly recommended for genre enthusiasts.' : 'Give it a watch if you are a fan of the cast or director.'}`
//       }
//     ]
//   };

//   const specificFAQs = pageSpecificFAQs[pageType] || pageSpecificFAQs.overview;
//   return [...baseFAQs.slice(0, 2), ...specificFAQs.slice(0, 4)].slice(0, 6);
// }

// const categoryIcons = {
//   Bollywood: Clapperboard,
//   Hollywood: Film,
//   WebSeries: Tv,
//   OTT: PlaySquare,
//   BoxOffice: TrendingUp,
//   Celebrities: Users,
// };

// // Dropdown FAQ Component
// function FAQDropdown({ faqs, loading }) {
//   const [openIndex, setOpenIndex] = useState(null);

//   const toggleFAQ = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3, 4, 5].map((i) => (
//           <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
//             <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>
//             <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
//             <div className="h-4 bg-white/10 rounded w-2/3"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (!faqs.length) return null;

//   return (
//     <div className="space-y-3">
//       {faqs.map((faq, idx) => (
//         <div 
//           key={idx} 
//           className="faq-item rounded-2xl bg-gradient-to-br from-white/5 to-white/3 border border-white/10 hover:border-red-500/30 transition-all duration-300 overflow-hidden"
//         >
//           <button
//             onClick={() => toggleFAQ(idx)}
//             className="w-full px-6 py-5 flex items-center justify-between text-left group"
//           >
//             <div className="flex items-start gap-4 pr-4">
//               <div className="flex-shrink-0 mt-1">
//                 <HelpCircle className="w-5 h-5 text-red-500/70 group-hover:text-red-500 transition-colors" />
//               </div>
//               <h4 className="text-base md:text-lg font-bold text-white leading-relaxed group-hover:text-red-400 transition-colors">
//                 {faq.question}
//               </h4>
//             </div>
//             <div className={`flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
//               <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
//             </div>
//           </button>
          
//           <div className={`faq-answer ${openIndex === idx ? 'open' : ''}`}>
//             <div className="px-6 pb-6 pt-0 pl-14 md:pl-16">
//               <div className="h-px bg-gradient-to-r from-red-500/20 via-red-500/50 to-red-500/20 mb-4"></div>
//               <p className="text-zinc-300 text-sm leading-relaxed">
//                 {faq.answer}
//               </p>
//               {faq.additional && (
//                 <p className="text-zinc-500 text-xs mt-3 italic">{faq.additional}</p>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default function MovieDetailPage({ article, pageType, slug }) {
//   const router = useRouter();
//   const Icon = categoryIcons[article.category] || FileText;
//   const [scrollProgress, setProgress] = useState(0);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isSaved, setIsSaved] = useState(false);
//   const [faqs, setFaqs] = useState([]);
//   const [loadingFAQs, setLoadingFAQs] = useState(true);
//   const heroRef = useRef(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
//       const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
//       setIsLiked(likedArticles.includes(article?._id));
//       setIsSaved(savedArticles.includes(article?._id));
//     }
//   }, [article?._id]);

//   // Generate FAQs dynamically based on article and pageType
//   useEffect(() => {
//     // Simulate async generation or fetch from AI endpoint
//     const loadFAQs = async () => {
//       setLoadingFAQs(true);
//       // Simulate network delay
//       await new Promise(resolve => setTimeout(resolve, 300));
//       const generatedFaqs = generateFAQs(article, pageType);
//       setFaqs(generatedFaqs);
//       setLoadingFAQs(false);
//     };
//     loadFAQs();
//   }, [article, pageType]);

//   useEffect(() => {
//     const handleScroll = () => {
//       const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
//       const currentScroll = window.scrollY;
//       setProgress((currentScroll / totalScroll) * 100);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: article.title,
//           text: article.summary,
//           url: window.location.href,
//         });
//       } catch (err) {
//         console.log("Share failed:", err);
//       }
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert("Link copied to clipboard!");
//     }
//   };

//   const handleLike = () => {
//     if (typeof window !== "undefined") {
//       const likedArticles = JSON.parse(localStorage.getItem("liked_articles") || "[]");
//       let newLiked;
//       if (isLiked) {
//         newLiked = likedArticles.filter(id => id !== article._id);
//       } else {
//         newLiked = [...likedArticles, article._id];
//       }
//       localStorage.setItem("liked_articles", JSON.stringify(newLiked));
//       setIsLiked(!isLiked);
//     }
//   };

//   const handleSave = () => {
//     if (typeof window !== "undefined") {
//       const savedArticles = JSON.parse(localStorage.getItem("saved_articles") || "[]");
//       let newSaved;
//       if (isSaved) {
//         newSaved = savedArticles.filter(id => id !== article._id);
//       } else {
//         newSaved = [...savedArticles, article._id];
//       }
//       localStorage.setItem("saved_articles", JSON.stringify(newSaved));
//       setIsSaved(!isSaved);
//     }
//   };

//   if (!article) return null;

//   const pageTitleSuffix = pageTitles[pageType] || pageTitles.overview;
//   const fullTitle = `${article.movieTitle || article.title} (${article.releaseYear}) – ${pageTitleSuffix}`;

//   return (
//     <>
//       <Head>
//         <title>{fullTitle} | FilmyFire Intelligence</title>
//         <meta name="description" content={article.meta?.description || article.summary?.substring(0, 160)} />
//         <link rel="canonical" href={`https://filmyfire.com/movie/${slug}`} />
//       </Head>

//       <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-red-600/30 font-sans relative pt-16 top-0">
        
//         {/* Reading Progress Bar */}
//         <div className="fixed top-16 left-0 right-0 z-[100] h-1 bg-white/5">
//           <div 
//             className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 transition-all duration-150 progress-bar-fill"
//             style={{ width: `${scrollProgress}%` }}
//           />
//         </div>

//         {/* Dynamic Header */}
//         <nav className={`fixed top-16 left-0 right-0 z-[40] transition-all duration-500 ${scrollProgress > 5 ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
//           <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
//             <Link 
//               href={`/category/${article.category.toLowerCase()}`}
//               className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
//             >
//               <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
//               <span className="hidden sm:inline uppercase tracking-widest">Back to {article.category}</span>
//             </Link>
            
//             <div className={`flex-1 px-8 transition-all duration-500 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
//               <h2 className="text-[10px] font-black text-white truncate max-w-md mx-auto text-center hidden md:block uppercase tracking-[0.3em]">
//                 {article.movieTitle} – {pageType.replace("-", " ")}
//               </h2>
//             </div>

//             <div className="flex items-center gap-3">
//               <button 
//                 onClick={handleShare}
//                 className="p-3 text-zinc-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
//               >
//                 <Share2 className="w-4 h-4" />
//               </button>
//               <button 
//                 onClick={handleSave}
//                 className={`p-3 transition-all rounded-xl border border-white/5 ${isSaved ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-400 bg-white/5 hover:bg-white/10'}`}
//               >
//                 <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
//               </button>
//             </div>
//           </div>
//         </nav>

//         {/* Immersive Hero Section */}
//         <div className="relative w-full h-[60vh] flex items-end justify-start overflow-hidden pt-16">
//           <div className="absolute inset-0 z-0">
//             {article.coverImage ? (
//               <img 
//                 src={article.coverImage} 
//                 alt=""
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
//             <div className="absolute inset-0 hero-glow opacity-30"></div>
//           </div>

//           <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 pb-12">
//             <div className="max-w-5xl">
//               <div className="flex items-center gap-4 mb-6 flex-wrap">
//                 <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
//                   <Target className="w-3 h-3" />
//                   {article.category} Intelligence
//                 </span>
//                 <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
//                   {pageType.replace("-", " ")}
//                 </span>
//                 {article.stats?.rating && (
//                   <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
//                     <Star className="w-3 h-3 fill-yellow-400" />
//                     {article.stats.rating}/10
//                   </span>
//                 )}
//               </div>

//               <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
//                 {fullTitle}
//               </h1>
//               <div className="flex items-center gap-4 text-sm text-zinc-400">
//                 <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {article.releaseYear}</span>
//                 <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.duration || "2h 45m"}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Content Section */}
//         <main className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
//           <div className="lg:col-span-8 space-y-12">
            
//             {/* Quick Links with active state */}
//             <div className="p-6 rounded-2xl glass-panel">
//               <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
//                 <List className="w-4 h-4" /> Jump to Intel
//               </h3>
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 {[
//                   { label: "Overview", suffix: "" },
//                   { label: "Ending Explained", suffix: "-ending-explained" },
//                   { label: "Box Office", suffix: "-box-office" },
//                   { label: "Budget", suffix: "-budget" },
//                   { label: "OTT Release", suffix: "-ott-release" },
//                   { label: "Cast", suffix: "-cast" },
//                 ].map((link, idx) => (
//                   <Link 
//                     key={idx}
//                     href={`/movie/${article.slug}${link.suffix}`}
//                     className={`jump-link px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-center ${
//                       (pageType === "overview" && link.suffix === "") || (pageType !== "overview" && link.suffix === `-${pageType}`)
//                         ? "active bg-red-600 text-white shadow-lg shadow-red-600/20" 
//                         : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5"
//                     }`}
//                   >
//                     {link.label}
//                   </Link>
//                 ))}
//               </div>
//             </div>

//             {/* Dynamic Content */}
//             <div className="prose prose-invert prose-zinc max-w-none">
//               {pageType === "box-office" && (
//                 <>
//                   <section className="mb-12">
//                     <div className="flex items-center gap-3 mb-8">
//                       <div className="p-2 rounded-xl bg-red-600/20">
//                         <TrendingUp className="w-6 h-6 text-red-500" />
//                       </div>
//                       <h2 className="text-3xl font-bold text-white">Box Office Performance</h2>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                       <div className="stat-card p-6 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30">
//                         <div className="flex items-center gap-3 mb-3">
//                           <DollarSign className="w-5 h-5 text-green-400" />
//                           <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Worldwide</span>
//                         </div>
//                         <div className="text-3xl font-black text-white">{article.stats?.worldwide || "₹600 Cr"}</div>
//                       </div>
//                       <div className="stat-card p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
//                         <div className="flex items-center gap-3 mb-3">
//                           <Target className="w-5 h-5 text-blue-400" />
//                           <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">India Net</span>
//                         </div>
//                         <div className="text-3xl font-black text-white">{article.stats?.indiaNet || "₹350 Cr"}</div>
//                       </div>
//                       <div className="stat-card p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
//                         <div className="flex items-center gap-3 mb-3">
//                           <Zap className="w-5 h-5 text-purple-400" />
//                           <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Opening Day</span>
//                         </div>
//                         <div className="text-3xl font-black text-white">{article.stats?.openingDay || "₹95 Cr"}</div>
//                       </div>
//                     </div>
//                   </section>
//                 </>
//               )}

//               {pageType === "overview" && (
//                 <section>
//                   <div className="flex items-center gap-3 mb-6">
//                     <Sparkles className="w-6 h-6 text-red-500" />
//                     <h2 className="text-2xl font-bold text-white">Movie Overview</h2>
//                   </div>
//                   <div className="p-6 rounded-2xl glass-panel">
//                     <p className="text-zinc-300 leading-relaxed text-lg">
//                       {article.summary || "Kalki 2898 AD is a landmark epic science fiction film that blends mythology with futuristic storytelling. Set in a post-apocalyptic world, the film follows the journey of warriors fighting for humanity's survival."}
//                     </p>
//                   </div>
//                 </section>
//               )}

//               {pageType === "cast" && (
//                 <section>
//                   <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
//                     <Users className="w-6 h-6 text-red-600" /> Stellar Cast
//                   </h2>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {article.cast?.map((actor, idx) => (
//                       <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all">
//                         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/30 to-orange-600/30 flex items-center justify-center">
//                           <User className="w-6 h-6 text-red-400" />
//                         </div>
//                         <div>
//                           <p className="text-white font-bold">{actor.name}</p>
//                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{actor.role || "Lead Role"}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </section>
//               )}
//             </div>

//             {/* FAQ Section with Dropdown */}
//             <div className="pt-12 border-t border-white/10">
//               <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
//                 <h2 className="text-2xl font-bold text-white flex items-center gap-3">
//                   <HelpCircle className="w-6 h-6 text-red-600" /> 
//                   Frequently Asked Questions
//                 </h2>
//                 <span className="text-[10px] text-zinc-500 bg-white/5 px-3 py-1 rounded-full">
//                   {faqs.length} questions
//                 </span>
//               </div>
              
//               <FAQDropdown faqs={faqs} loading={loadingFAQs} />
              
//               <div className="mt-8 text-center">
//                 <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
//                   Still have questions? <Link href="/contact" className="text-red-500 hover:text-red-400">Contact our film experts</Link>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar - Enhanced */}
//           <aside className="lg:col-span-4 space-y-8">
//             <div className="sticky top-32 space-y-8">
//               <div className="p-6 rounded-3xl glass-panel">
//                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
//                   <BarChart3 className="w-4 h-4 text-red-600" /> Core Intelligence
//                 </h3>
//                 <div className="space-y-4">
//                   {[
//                     { label: "Director", value: article.director?.join(", ") || "Nag Ashwin", icon: User },
//                     { label: "Budget", value: article.budget || "₹600 Cr", icon: DollarSign },
//                     { label: "Genre", value: article.genres?.join(", ") || "Sci-Fi, Epic", icon: Film },
//                   ].map((stat, idx) => {
//                     const IconComp = stat.icon;
//                     return (
//                       <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
//                         <div className="flex items-center gap-2">
//                           <IconComp className="w-3 h-3 text-zinc-500" />
//                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
//                         </div>
//                         <span className="text-[11px] font-bold text-white uppercase text-right">{stat.value}</span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
              
//               {article.ott?.platform && (
//                 <div className="p-6 rounded-3xl bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20">
//                   <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
//                     <Tv className="w-4 h-4 text-red-600" /> Stream Now
//                   </h3>
//                   <Link href={`/ott/${slugify(article.ott.platform)}`} className="block group">
//                     <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
//                       <div>
//                         <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Available On</p>
//                         <p className="text-lg font-black text-white group-hover:text-red-500 transition-colors">
//                           {article.ott.platform}
//                         </p>
//                       </div>
//                       <ExternalLink className="w-5 h-5 text-red-500 opacity-70 group-hover:opacity-100" />
//                     </div>
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>
//       </div>
//     </>
//   );
// }