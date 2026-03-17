import { TrendingUp, Film, BarChart3, Tv, Star, Funnel, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

const TrendingCard = ({ 
  title, 
  description, 
  image, 
  category, 
  categoryGradient,
  rating, 
  views, 
  readTime,
  slug
}) => {
  const getHref = () => {
    if (!slug) return "#";
    return `/intelligence/${slug}`;
  };

  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Hover Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-0 group-hover:opacity-[0.20] transition-opacity duration-500 pointer-events-none z-0`} />
      
      {/* Image Container with Overlay */}
      <div className="relative aspect-[9/16] overflow-hidden z-10">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className={`px-4 py-2 rounded-xl text-xs tracking-wide backdrop-blur-xl border border-white/20 bg-gradient-to-r ${categoryGradient} shadow-lg`}>
            <span className="text-white font-medium">
              {category}
            </span>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="lucide lucide-star w-4 h-4 text-yellow-400 fill-yellow-400">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="text-sm font-semibold text-white">{rating}</span>
          </div>
        </div>
        
        {/* Stats Row - Bottom of Image */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye w-3.5 h-3.5 text-zinc-300">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="text-xs font-medium text-zinc-300">{views}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-3.5 h-3.5 text-zinc-300">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-xs font-medium text-zinc-300">{readTime}</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 relative z-10">
        <h3 className="text-2xl mb-3 text-white">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 mb-5 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        {/* View Intelligence Button */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${categoryGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl shadow-lg`} />
          <Link 
            href={getHref()}
            className="relative w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-white transition-all overflow-hidden group/btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye w-4 h-4">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>View Intelligence</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">
              <path d="M7 7h10v10"/>
              <path d="M7 17 17 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function TrendingIntelligenceSection() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: "All", label: "All Intelligence", icon: Funnel },
    { id: "Explained", label: "Story Explained", icon: Film },
    { id: "Box Office", label: "Box Office Intelligence", icon: BarChart3 },
    { id: "OTT", label: "OTT Performance", icon: Tv },
    { id: "Celebrity", label: "Celebrity Intelligence", icon: Star },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = "/api/trending-intelligence";
        if (activeFilter === "Celebrity") {
          endpoint = "/api/trending-celebrities";
        }
        const res = await fetch(endpoint);
        const json = await res.json();
        if (json.success) {
          setTrendingData(json.data);
        }
      } catch (error) {
        console.error(`Error fetching trending data for ${activeFilter}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeFilter]);

  const getCategoryDetails = (cat) => {
    switch (cat) {
      case "Explained":
        return {
          label: "Story Explained",
          gradient: "from-blue-500 to-cyan-500",
        };
      case "Box Office":
        return {
          label: "Box Office Intelligence",
          gradient: "from-green-500 to-emerald-500",
        };
      case "OTT":
        return {
          label: "OTT Performance Analysis",
          gradient: "from-purple-500 to-pink-500",
        };
      case "Celebrity":
        return {
          label: "Celebrity Intelligence",
          gradient: "from-amber-500 to-red-500",
        };
      default:
        return {
          label: cat,
          gradient: "from-gray-500 to-zinc-500",
        };
    }
  };

  const filteredData = activeFilter === "All" 
    ? trendingData 
    : activeFilter === "Celebrity"
    ? trendingData
    : trendingData.filter(item => item.category === activeFilter);

  return (
    <section className="py-16" id="trending-intelligence">
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-black/95 backdrop-blur-2xl shadow-2xl shadow-purple-500/10 border-b border-white/5 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 ${
                    isActive
                      ? "text-white bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 shadow-lg shadow-purple-500/30"
                      : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                  <span className="relative z-10">{filter.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg shadow-red-500/30">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-4xl text-white font-sans">Trending Intelligence</h2>
          <p className="text-sm text-zinc-400 mt-1">Most viewed analyses this week</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map((item, index) => {
              const details = getCategoryDetails(item.category);
              return (
                <TrendingCard 
                  key={item._id || index} 
                  {...item} 
                  category={details.label}
                  categoryGradient={details.gradient}
                  rating={item.rating || "8.5"} // Default rating if missing
                />
              );
            })}
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg">No intelligence found for this category.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
