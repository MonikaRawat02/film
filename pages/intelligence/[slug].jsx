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
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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

      <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 mt-12">
        {/* Header Hero Section */}
        <div className="relative w-full h-[60vh] lg:h-[70vh] overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-cover scale-105 blur-sm opacity-30 absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
          
          <div className="relative z-10 h-full mx-auto max-w-[1400px] px-6 lg:px-12 flex flex-col justify-end pb-20">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-[0.2em] mb-12 group cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back
            </button>

            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${getCategoryColor(item.category)} text-white shadow-lg flex items-center gap-2`}>
                  {getCategoryIcon(item.category)}
                  {item.category}
                </span>
                <span className="h-1 w-1 bg-gray-700 rounded-full" />
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.movieName}</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-serif font-black text-white leading-[1.1] tracking-tight mb-10">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 text-sm text-gray-500 font-bold uppercase tracking-[0.1em]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>{item.readTime || "5 MIN READ"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-red-500" />
                  <span>{item.views || "0K"} VIEWS</span>
                </div>
                {/* <div className="flex items-center gap-6 ml-auto">
                  <button className="hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
                  <button className="hover:text-white transition-colors"><Bookmark className="w-4 h-4" /></button>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              {/* Featured Image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] mb-12 border border-gray-800 shadow-2xl">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="prose prose-invert prose-red max-w-none">
                <div className="text-xl lg:text-2xl text-gray-300 leading-relaxed font-light mb-12 first-letter:text-6xl first-letter:font-black first-letter:text-red-500 first-letter:mr-4 first-letter:float-left whitespace-pre-line">
                  {item.description}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-10">
              <div className="p-8 rounded-[2rem] bg-gray-900/30 border border-gray-800 backdrop-blur-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-red-500 mb-6">Intelligence Metadata</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Context</p>
                    <p className="text-white font-medium">{item.movieName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Intelligence Layer</p>
                    <p className="text-white font-medium">{item.category} Intelligence</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Updated</p>
                    <p className="text-white font-medium">{new Date(item.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* FilmyFire Intelligence */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

IntelligenceDetailPage.noPadding = true;
