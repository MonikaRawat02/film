import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Share2, Bookmark, BarChart, Film, Tv, Star } from "lucide-react";

export default function IntelligenceDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/public/trending-intelligence/${slug}`);
        const data = await res.json();
        if (data.success) {
          setItem(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch intelligence detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin "></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-serif font-black text-white mb-4">Intelligence Not Found</h1>
        <p className="text-gray-400 mb-8">The deep-dive you're looking for doesn't exist or has been moved.</p>
        <button 
          onClick={() => router.back()}
          className="text-red-500 font-black text-sm uppercase tracking-widest hover:text-red-400 transition-colors cursor-pointer"
        >
          Back
        </button>
      </div>
    );
  }

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Explained": return <Film className="w-4 h-4" />;
      case "Box Office": return <BarChart className="w-4 h-4" />;
      case "OTT": return <Tv className="w-4 h-4" />;
      case "Celebrity": return <Star className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Explained": return "from-purple-600 to-indigo-600";
      case "Box Office": return "from-emerald-600 to-teal-600";
      case "OTT": return "from-blue-600 to-cyan-600";
      case "Celebrity": return "from-orange-600 to-red-600";
      default: return "from-gray-600 to-zinc-600";
    }
  };

  return (
    <>
      <Head>
        <title>{item.title} | FilmyFire Intelligence</title>
      </Head>

      <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 pt-16">
        {/* Header Hero Section */}
        <div className="relative w-full h-[40vh] sm:h-[45vh] lg:h-[50vh] overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-cover scale-105 opacity-40 absolute inset-0 transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
          
          <div className="relative z-10 h-full mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 flex flex-col justify-center pt-8 sm:pt-12">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 sm:mb-8 group cursor-pointer w-fit"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back
            </button>

            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${getCategoryColor(item.category)} text-white shadow-lg flex items-center gap-2 transition-all hover:brightness-110`}>
                  {getCategoryIcon(item.category)}
                  {item.category}
                </span>
                <span className="h-1 w-1 bg-gray-700 rounded-full hidden sm:block" />
                <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate max-w-[150px] sm:max-w-none">{item.movieName}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-black text-white leading-[1.2] sm:leading-[1.1] tracking-tight mb-6 sm:mb-8">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-[11px] sm:text-sm text-gray-500 font-bold uppercase tracking-[0.1em]">
                <div className="flex items-center gap-2 group transition-colors hover:text-gray-300">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                  <span>{item.readTime || "5 MIN READ"}</span>
                </div>
                <div className="flex items-center gap-2 group transition-colors hover:text-gray-300">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                  <span>{item.views || "0K"} VIEWS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 pb-24 sm:pb-32 mt-4 sm:mt-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-8">
              {/* Featured Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-[2.5rem] mb-10 sm:mb-12 border border-gray-800 shadow-2xl group">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="prose prose-invert prose-red max-w-none px-2 sm:px-0">
                <div className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-[1.7] sm:leading-relaxed font-light mb-12 first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-black first-letter:text-red-500 first-letter:mr-3 sm:first-letter:mr-4 first-letter:float-left whitespace-pre-line">
                  {item.description}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8 sm:space-y-10">
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-gray-900/30 border border-gray-800 backdrop-blur-sm sticky top-24">
                <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-red-500 mb-6 sm:mb-8 flex items-center gap-2">
                  <div className="w-4 h-[2px] bg-red-600" />
                  Intelligence Metadata
                </h3>
                <div className="space-y-6 sm:space-y-8">
                  <div className="group">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-red-500/50 transition-colors">Context</p>
                    <p className="text-white text-sm sm:text-base font-medium">{item.movieName}</p>
                  </div>
                  <div className="group">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-red-500/50 transition-colors">Intelligence Layer</p>
                    <p className="text-white text-sm sm:text-base font-medium">{item.category} Intelligence</p>
                  </div>
                  <div className="group">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-red-500/50 transition-colors">Updated</p>
                    <p className="text-white text-sm sm:text-base font-medium">{new Date(item.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-gray-800/50">
                  <div className="flex items-center justify-between gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-white/5 border border-gray-800 hover:bg-white/10 transition-all group">
                      <Share2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Share</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-white/5 border border-gray-800 hover:bg-white/10 transition-all group">
                      <Bookmark className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Save</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Related/Action Items could go here */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

IntelligenceDetailPage.noPadding = true;
