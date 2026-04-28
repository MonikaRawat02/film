// pages/trends.js - Complete New UI Design
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Youtube, ArrowUpRight, TrendingUp, Eye, Clock, Zap, 
  Filter, X, BarChart3, Activity, Calendar, ChevronRight, Star
} from "lucide-react";

export default function TrendsPage() {
  const [googleTrends, setGoogleTrends] = useState([]);
  const [youtubeTrends, setYoutubeTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const [googleRes, youtubeRes] = await Promise.all([
        fetch("/api/trending/google-trends").then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch("/api/trending/youtube-trends").then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      const google = (googleRes.success && Array.isArray(googleRes.data) ? googleRes.data : []).map(item => ({
        ...item,
        source: "google",
        sourceIcon: Globe,
        sourceColor: "#4285f4",
        sourceBg: "rgba(66,133,244,0.1)",
        type: item.type || item.category || "trending",
        formattedViews: item.traffic ? `${(item.traffic / 1000).toFixed(0)}K searches` : 
                        item.viewCount ? `${(item.viewCount / 1000).toFixed(1)}K views` : "N/A"
      }));

      const youtube = (youtubeRes.success && Array.isArray(youtubeRes.data) ? youtubeRes.data : []).map(item => ({
        ...item,
        source: "youtube",
        sourceIcon: Youtube,
        sourceColor: "#ff0000",
        sourceBg: "rgba(255,0,0,0.1)",
        type: item.type || item.category || "viral",
        formattedViews: item.viewCount ? `${(item.viewCount / 1000).toFixed(1)}K views` :
                        item.traffic ? `${(item.traffic / 1000).toFixed(0)}K searches` : "N/A"
      }));

      setGoogleTrends(google);
      setYoutubeTrends(youtube);
    } catch (error) {
      console.error("Error fetching trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const allItems = [...googleTrends, ...youtubeTrends];
    const categories = new Set(allItems.map(item => item.type || item.category || "trending"));
    return ["all", ...Array.from(categories)];
  };

  const getDisplayedItems = () => {
    let items = [];
    if (activeTab === "all") {
      items = [...googleTrends, ...youtubeTrends];
    } else if (activeTab === "google") {
      items = googleTrends;
    } else {
      items = youtubeTrends;
    }
    
    if (selectedCategory !== "all") {
      items = items.filter(item => (item.type || item.category) === selectedCategory);
    }
    
    if (searchTerm) {
      items = items.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.overview?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items.sort((a, b) => (b.score || b.trendScore || 0) - (a.score || a.trendScore || 0));
  };

  const displayedItems = getDisplayedItems();
  const categories = getCategories();

  // ─── NEW COMPONENTS ─────────────────────────────────────────────────────
  
  const TrendCard = ({ item, index }) => {
    const SourceIcon = item.sourceIcon;
    const href = item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#";
    const score = item.score || item.trendScore || 0;
    const scoreColor = score >= 80 ? "#ef4444" : score >= 60 ? "#f59e0b" : score >= 40 ? "#eab308" : "#6b7280";
    
    return (
      <div
        key={item._id || item.id || index}
        className="group" >
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] transition-colors duration-200">
          {/* Image with Overlay */}
          <div className="relative h-48 overflow-hidden bg-zinc-900">
            <img
              src={item.image || item.metadata?.thumbnail || item.poster || item.metadata?.coverImage || "/placeholder.jpg"}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.target.src = "/placeholder.jpg"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10">
                  <SourceIcon className="w-3.5 h-3.5" style={{ color: item.sourceColor }} />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">{item.source}</span>
                </div>
                {item.isLive && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/90 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase">Live</span>
                  </div>
                )}
              </div>
              
              {/* Score Badge - Simple */}
              {score > 0 && (
                <div className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] font-bold text-white">Score: {score}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            {/* Category */}
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                style={{ 
                  color: item.sourceColor,
                  backgroundColor: `${item.sourceColor}15`
                }}
              >
                {item.type || item.category || "Trending"}
              </span>
              {item.rank && (
                <span className="text-[9px] font-bold text-zinc-500">Rank #{item.rank}</span>
              )}
            </div>
            
            {/* Title */}
            <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
              {item.title}
            </h3>
            
            {/* Description */}
            <p className="text-xs text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
              {item.description || item.overview || "Trending topic with significant search interest."}
            </p>
            
            {/* Stats Row */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.05]">
              {item.traffic || item.viewCount ? (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-semibold text-zinc-400">{item.formattedViews}</span>
                </div>
              ) : null}
              {item.readTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-semibold text-zinc-400">{item.readTime}</span>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <Link
              href={href}
              className="group/btn inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/[0.05] text-white text-xs font-semibold hover:bg-white/[0.1] transition-all"
            >
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  const HotIndexBar = ({ google, youtube }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Google Trends", value: google.length, icon: Globe, color: "#4285f4" },
        { label: "YouTube Trends", value: youtube.length, icon: Youtube, color: "#ff0000" },
        { label: "Total Items", value: google.length + youtube.length, icon: BarChart3, color: "#a855f7" },
        { label: "Live Updates", value: "Real-time", icon: Activity, color: "#10b981" }
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-white/[0.05] p-4 bg-white/[0.02]">
          <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.color }} />
          <p className="text-lg font-bold text-white">{stat.value}</p>
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  );
  
  const CategoryPill = ({ category, count, isActive, onClick, color }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
        isActive 
          ? "bg-white text-black border-white shadow-lg" 
          : "bg-white/[0.03] text-zinc-400 border-white/[0.05] hover:bg-white/[0.08] hover:text-white hover:border-white/[0.1]"
      }`}
    >
      <span>{category}</span>
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
          isActive ? "bg-black/10 text-black/60" : "bg-white/[0.05] text-zinc-500"
        }`}>
          {count}
        </span>
      )}
    </motion.button>
  );

  return (
    <>
      <Head>
        <title>Google & YouTube Trends | Live Trending Data | FilmFire</title>
        <meta name="description" content="Real-time trending data from Google and YouTube. Track viral topics, search trends, and what's hot right now." />
        <meta name="keywords" content="google trends, youtube trends, viral topics, trending now, search trends" />
      </Head>

      <div className="min-h-screen pt-24" style={{ background: "#080808" }}>
        {/* Simple Hero Section */}
        <div className="border-b border-white/[0.05]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-red-500" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Trending Data</h1>
                  <p className="text-xs text-zinc-500 mt-0.5">Real-time insights from Google & YouTube</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-zinc-400">{googleTrends.length} Google</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-zinc-400">{youtubeTrends.length} YouTube</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Live</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-8">
          {/* Stats Overview */}
          {!loading && <HotIndexBar google={googleTrends} youtube={youtubeTrends} />}
          
          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sticky top-20 z-20 bg-[#080808]/90 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Source Tabs */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "All", icon: TrendingUp, color: "#a855f7" },
                  { id: "google", label: "Google", icon: Globe, color: "#4285f4" },
                  { id: "youtube", label: "YouTube", icon: Youtube, color: "#ff0000" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-black shadow-lg"
                        : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                   >
                    <tab.icon className="w-4 h-4" style={{ color: tab.color }} />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search trends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.05] transition-all"
                />
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-zinc-600 hover:text-white transition-colors" />
                  </button>
                )}
              </div>
              
              {/* Refresh Button */}
              <motion.button
                onClick={fetchTrends}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white text-sm font-bold hover:bg-white/[0.08] transition-all">
                <Zap className="w-4 h-4 text-yellow-500" />
                Refresh
              </motion.button>
            </div>
            
            {/* Category Pills */}
            {categories.length > 1 && (
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {categories.map((cat) => {
                    const count = cat === "all" 
                      ? googleTrends.length + youtubeTrends.length
                      : [...googleTrends, ...youtubeTrends].filter(i => (i.type || i.category) === cat).length;
                    return (
                      <CategoryPill
                        key={cat}
                        category={cat}
                        count={count}
                        isActive={selectedCategory === cat}
                        onClick={() => setSelectedCategory(cat)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-500">
              Showing <span className="text-white font-bold">{displayedItems.length}</span> trends
            </p>
          </div>

          {/* Trends Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="h-48 bg-white/[0.03] rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-16 bg-white/[0.05] rounded" />
                    <div className="h-4 w-full bg-white/[0.05] rounded" />
                    <div className="h-3 w-full bg-white/[0.03] rounded" />
                    <div className="h-3 w-2/3 bg-white/[0.03] rounded" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 flex-1 bg-white/[0.05] rounded-xl" />
                      <div className="h-8 w-8 bg-white/[0.05] rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
                <Filter className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">No trends found</p>
              <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedItems.map((item, index) => (
                <TrendCard key={item._id || item.id || index} item={item} index={index} />
              ))}
            </div>
          )}
          
          {/* Bottom CTA */}
          {!loading && displayedItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-red-500/20 blur-3xl rounded-full" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchTrends}
                  className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-red-500/10 border border-white/[0.1] text-white text-sm font-bold hover:from-blue-500/20 hover:to-red-500/20 transition-all shadow-2xl"
                >
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>Refresh Latest Trends</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.05] mt-12 py-8 text-center">
          <p className="text-xs text-zinc-600">
            Real-time data • Google Trends API & YouTube Analytics • Updated continuously
          </p>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
    </>
  );
}