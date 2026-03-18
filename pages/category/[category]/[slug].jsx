import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FileText, Clock, User, ChevronRight, Share2, ThumbsUp, Eye, ArrowLeft,Quote,CheckCircle,Clapperboard,Film,Tv,PlaySquare,TrendingUp,Users, Zap,Target,BookOpen,Award,BarChart3,ShieldCheck,Heart,MessageSquare,Bookmark, Check
} from "lucide-react";

export async function getServerSideProps(context) {
  const { category, slug } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/${slug}`);
    const data = await res.json();

    if (!res.ok || !data.data) {
      return { notFound: true };
    }
    return {
      props: {
        article: data.data,
        category,
      },
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return { notFound: true };
  }
}

const categoryIcons = {
  Bollywood: Clapperboard,
  Hollywood: Film,
  WebSeries: Tv,
  OTT: PlaySquare,
  BoxOffice: TrendingUp,
  Celebrities: Users,
};

export default function ArticleDetailPage({ article, category }) {
  const router = useRouter();
  const Icon = categoryIcons[category] || FileText;
  const [scrollProgress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [contribution, setContribution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check local storage for like/save status
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
          text: article.summary || article.sections?.[0]?.content?.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
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

  const handleSubmitContribution = (e) => {
    e.preventDefault();
    if (!contribution.trim()) return;
    
    setIsSubmitting(true);
    // Mock submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setContribution("");
      alert("Intelligence contribution transmitted successfully.");
    }, 1500);
  };

  const handleDownload = () => {
    alert("Dossier generation in progress. Download will begin shortly.");
    // In a real app, this would trigger a PDF generation or link to a file
  };

  if (!article) return null;

  return (
    <>
      <Head>
        <title>{article.title} | Filmy Intelligence</title>
        <meta name="description" content={article.summary || article.sections?.[0]?.content?.substring(0, 160)} />
        {article.seo?.metaTitle && <title>{article.seo.metaTitle}</title>}
        {article.seo?.metaDescription && <meta name="description" content={article.seo.metaDescription} />}
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
              href={`/category/${category.toLowerCase()}`}
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all text-xs font-bold group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline uppercase tracking-widest">Back to {category}</span>
            </Link>
            
            <div className={`flex-1 px-8 transition-all duration-500 ${scrollProgress > 20 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <h2 className="text-[10px] font-black text-white truncate max-w-md mx-auto text-center hidden md:block uppercase tracking-[0.3em]">
                {article.title}
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
        <div className="relative w-full h-screen flex items-end justify-start overflow-hidden pt-16">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
            {article.coverImage ? (
              <img 
                src={article.coverImage} 
                alt=""
                className="w-full h-full object-cover scale-100 transition-transform duration-1000"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-60" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 pb-20 md:pb-24">
            <div className="max-w-5xl">
              <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Target className="w-3 h-3" />
                  {article.category} Intelligence
                </span>
                <div className="h-[1px] w-12 bg-white/20"></div>
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">{article.movieTitle || article.movieName}</span>
              </div>

              <h1 className="text-4xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-10 drop-shadow-2xl">
                {article.title}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-white/10 max-w-3xl">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Complexity</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <div key={i} className={`h-1 w-4 rounded-full ${i <= 4 ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-white/10'}`} />)}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Read Time</p>
                  <p className="text-white font-bold text-[11px] uppercase tracking-widest">{article.stats?.readTime || "5 MIN"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confidence</p>
                  <p className="text-white font-bold text-[11px] uppercase tracking-widest">98.4%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verified</p>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Scroll Indicator */}
          <div className="absolute bottom-10 right-10 z-10 hidden lg:block">
            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] rotate-90 mb-8">Scroll</span>
              <div className="w-[1px] h-20 bg-gradient-to-b from-white/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Main Content Architecture */}
        <main className="relative z-10 max-w-[1440px] mx-auto px-6 -mt-16 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Left Column: Intelligence Data */}
            <div className="lg:col-span-8 space-y-20">
              
              {/* Quick Summary Card */}
              {article.summary && (
                <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-24 h-24 text-red-600" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                      <BookOpen className="w-4 h-4" />
                      Executive Summary
                    </h3>
                    <p className="text-2xl md:text-3xl font-medium text-white leading-tight tracking-tight italic border-l-4 border-red-600 pl-8 py-2">
                      &quot;{article.summary}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Main Content Sections */}
              <div className="space-y-24">
                {(article.sections || []).map((section, idx) => (
                  <div key={idx} className="relative group">
                    {/* Section Numbering */}
                    <div className="absolute -left-12 top-0 text-7xl font-black text-white/5 select-none pointer-events-none group-hover:text-red-600/10 transition-colors">
                      0{idx + 1}
                    </div>
                    
                    <div className="space-y-8">
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none border-b border-white/5 pb-6">
                        {section.heading}
                      </h2>
                      <div className="text-lg md:text-xl text-zinc-400 leading-relaxed space-y-6 whitespace-pre-wrap font-medium tracking-wide">
                        {section.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verdict Section */}
              {article.verdict && (
                <div className="p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-red-600/10 to-transparent border border-red-600/20 relative overflow-hidden group shadow-2xl">
                  <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Award className="w-64 h-64 text-red-600" />
                  </div>
                  <h3 className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10">
                    <ShieldCheck className="w-4 h-4" />
                    Operational Verdict
                  </h3>
                  <p className="text-2xl md:text-4xl font-serif font-bold text-white leading-[1.2] tracking-tight relative z-10">
                    &quot;{article.verdict}&quot;
                  </p>
                </div>
              )}

              {/* Tags Interaction */}
              <div className="flex flex-wrap gap-3 pt-12 border-t border-white/5">
                {(article.tags || []).map((tag, i) => (
                  <span key={i} className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:border-red-600/50 hover:text-red-600 cursor-pointer transition-all active:scale-95">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Engagement Sector */}
              <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={handleLike}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 ${isLiked ? 'bg-red-600 border-red-600' : 'bg-white/5 border-white/5 group-hover:bg-red-600 group-hover:border-red-600'}`}>
                      <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-white fill-current' : 'text-zinc-400 group-hover:text-white'}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLiked ? 'text-red-500' : 'text-zinc-500'}`}>{isLiked ? 'Approved' : 'Approve'}</span>
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                      <Share2 className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Distribute</span>
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 ${isSaved ? 'bg-amber-600 border-amber-600' : 'bg-white/5 border-white/5 group-hover:bg-amber-600 group-hover:border-amber-600'}`}>
                      <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'text-white fill-current' : 'text-zinc-400 group-hover:text-white'}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSaved ? 'text-amber-500' : 'text-zinc-500'}`}>{isSaved ? 'Vaulted' : 'Vault'}</span>
                  </button>
                </div>

                <form 
                  onSubmit={handleSubmitContribution}
                  className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 w-full md:w-auto"
                >
                  <input 
                    type="text" 
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    placeholder="Contribute analysis..." 
                    className="bg-transparent border-none outline-none px-4 py-2 text-sm flex-1 md:w-64 text-white placeholder:text-zinc-600 font-bold"
                  />
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : <Check className="w-3 h-3" />}
                    {isSubmitting ? 'TRANSMITTING...' : 'SUBMIT'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Interaction & Meta */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Floating Meta Box */}
              <div className="sticky top-32 space-y-8">
                
                {/* Intel Dossier */}
                <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-600/10 blur-3xl rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-2">
                    <BarChart3 className="w-3 h-3 text-red-600" />
                    Intelligence Dossier
                  </h3>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <Award className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Author</p>
                        <p className="text-white font-bold text-xs uppercase tracking-widest">{article.author?.name || "Filmy Intel Team"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <Clock className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Published</p>
                        <p className="text-white font-bold text-xs uppercase tracking-widest">
                          {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <Target className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Subject</p>
                        <p className="text-white font-bold text-xs uppercase tracking-widest">{article.movieTitle || article.movieName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5">
                    <button 
                      onClick={handleDownload}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                    >
                      Download Full Report
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>
    </>
  );
}

ArticleDetailPage.noPadding = true;
