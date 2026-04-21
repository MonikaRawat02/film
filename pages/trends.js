// pages/trends.js
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Youtube, ArrowUpRight, TrendingUp, Eye, Clock, Zap, Filter, X } from "lucide-react";

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

  const StatBadge = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3 h-3" style={{ color }} />
      <span className="text-[10px] text-zinc-500">{label}:</span>
      <span className="text-[10px] text-white font-semibold">{value}</span>
    </div>
  );

  const getScoreColor = (score) => {
    if (score >= 80) return "#ef4444";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#eab308";
    return "#6b7280";
  };

  return (
    <>
      <Head>
        <title>Google & YouTube Trends | Live Trending Data | FilmFire</title>
        <meta name="description" content="Real-time trending data from Google and YouTube. Track viral topics, search trends, and what's hot right now." />
        <meta name="keywords" content="google trends, youtube trends, viral topics, trending now, search trends" />
      </Head>

      <div className="min-h-screen" style={{ background: "#080808" }}>
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-red-600/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-12 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                  <Globe className="w-8 h-8 text-blue-500 relative z-10" />
                </div>
                <span className="text-2xl font-black text-zinc-700">+</span>
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                  <Youtube className="w-8 h-8 text-red-500 relative z-10" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
                Google & YouTube{" "}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
                  Trends
                </span>
              </h1>
              
              <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                Real-time trending data from the world's largest search and video platforms
              </p>
              
              {/* Stats Cards */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{googleTrends.length}</p>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Google Trends</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{youtubeTrends.length}</p>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">YouTube Trends</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Live</p>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Real-time Updates</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 py-8">
          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="sticky top-20 z-20 bg-[#080808]/80 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Source Tabs */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "All Trends", icon: TrendingUp, color: "#a855f7" },
                  { id: "google", label: "Google", icon: Globe, color: "#4285f4" },
                  { id: "youtube", label: "YouTube", icon: Youtube, color: "#ff0000" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-white to-white/90 text-black shadow-lg"
                        : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" style={{ color: tab.color }} />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-white/[0.1] text-white border border-white/[0.1]"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search trends by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-10 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.05] transition-all"
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
            </div>
          </motion.div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-zinc-500">
                Showing <span className="text-white font-bold">{displayedItems.length}</span> trending items
              </p>
            </div>
            <button
              onClick={fetchTrends}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Trends Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/[0.03] rounded-2xl h-80" />
                </div>
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
                <Zap className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-lg">No trends found</p>
              <p className="text-zinc-600 text-sm mt-2">Try adjusting your filters or search term</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedItems.map((item, index) => (
                <motion.div
                  key={item._id || item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-2xl overflow-hidden border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300"
                  style={{ background: item.sourceBg }}
                >
                  {/* Image Section */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.image || item.metadata?.thumbnail || item.poster || item.metadata?.coverImage || "/api/placeholder/400/300"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/400/300";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    
                    {/* Source Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/[0.1]">
                        <item.sourceIcon className="w-3 h-3" style={{ color: item.sourceColor }} />
                        <span className="text-[9px] font-black text-white uppercase tracking-wider">
                          {item.source}
                        </span>
                      </div>
                    </div>

                    {/* Score Badge */}
                    {(item.score || item.trendScore) && (
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                          <Zap className="w-2.5 h-2.5 text-yellow-500" />
                          <span className="text-[10px] font-bold text-white">
                            Score: {item.score || item.trendScore}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span 
                        className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ 
                          color: item.sourceColor,
                          backgroundColor: `${item.sourceColor}15`
                        }}
                      >
                        {item.type || item.category || "Trending"}
                      </span>
                      {item.isLive && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                          Live
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-opacity-80 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                      {item.description || item.overview || "No description available"}
                    </p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {(item.score || item.trendScore) && (
                        <StatBadge 
                          icon={Zap} 
                          label="Trend Score" 
                          value={item.score || item.trendScore} 
                          color={getScoreColor(item.score || item.trendScore)}
                        />
                      )}
                      {(item.traffic || item.viewCount) && (
                        <StatBadge 
                          icon={Eye} 
                          label="Traffic" 
                          value={item.formattedViews} 
                          color="#60a5fa"
                        />
                      )}
                      {item.rank && (
                        <StatBadge 
                          icon={TrendingUp} 
                          label="Rank" 
                          value={`#${item.rank}`} 
                          color="#34d399"
                        />
                      )}
                      {item.readTime && (
                        <StatBadge 
                          icon={Clock} 
                          label="Read Time" 
                          value={item.readTime} 
                          color="#a855f7"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
                      <Link
                        href={item.slug ? (item.category === "Celebrity" ? `/celebrity/${item.slug}` : `/intelligence/${item.slug}`) : "#"}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white/[0.05] text-white/80 hover:bg-white/[0.1] hover:text-white transition-all"
                      >
                        View Details
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More / Refresh Section */}
          {!loading && displayedItems.length > 0 && (
            <div className="text-center mt-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTrends}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-red-500/10 border border-white/[0.1] text-white text-sm font-semibold hover:from-blue-500/20 hover:to-red-500/20 transition-all"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
                Refresh Latest Trends
              </motion.button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="border-t border-white/[0.05] mt-12 py-8 text-center">
          <p className="text-xs text-zinc-600">
            Data updates in real-time • Source: Google Trends API & YouTube Analytics
          </p>
        </div>
      </div>

      {/* Global Styles for scrollbar */}
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom scrollbar for the page */
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