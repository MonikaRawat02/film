"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Search, Play, TrendingUp, X, Loader2, Star, Film, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

const categoryConfig = {
  Bollywood: {
    title: "Bollywood Intelligence Hub",
    subtitle: "Deep analysis of Hindi cinema including movie explanations, box office truth, OTT insights, and celebrity career intelligence.",
    searchPlaceholder: "Search Bollywood movies, actors, box office, or story explanations",
    quickTags: ["movie ending explained", "box office collection", "OTT release details", "actor career analysis"],
    primaryBtn: "Explore Bollywood Intelligence",
    secondaryBtn: "Trending Bollywood Explainers",
    gradient: "from-amber-200 via-amber-400 to-amber-200",
    accentColor: "amber",
  },
  Hollywood: {
    title: "Hollywood Movies, Actors, Box Office & OTT Intelligence",
    subtitle: "Explore thousands of Hollywood movies, celebrity profiles, streaming releases, and box office insights updated daily.",
    searchPlaceholder: "Search Hollywood movies, actors, franchises, or box office data",
    quickTags: ["Hollywood movies", "Hollywood actors", "Hollywood box office", "Hollywood OTT releases", "Hollywood film analysis"],
    primaryBtn: "Explore Hollywood Movies",
    secondaryBtn: "View Trending Films",
    gradient: "from-purple-300 via-pink-400 to-orange-400",
    accentColor: "purple",
    badgeText: "FilmyFire Intelligence Platform",
    description: "Hollywood cinema continues to dominate the global entertainment landscape, shaping cultural narratives and setting box office records worldwide. From blockbuster franchises to critically acclaimed independent films, the American film industry produces over 700 feature films annually, generating billions in revenue across theatrical releases and streaming platforms. FilmyFire provides comprehensive intelligence on Hollywood's evolving ecosystem, tracking everything from production trends and casting decisions to opening weekend performances and long-tail OTT streaming success. Our platform aggregates real-time data on thousands of movies, celebrity profiles, industry analysis, and viewing patterns to help enthusiasts, professionals, and investors understand the complex dynamics of modern Hollywood entertainment.",
  },
  WebSeries: {
    title: "Web Series Intelligence Hub",
    subtitle: "In-depth breakdown of episodic content across platforms including performance metrics and audience engagement.",
    searchPlaceholder: "Search web series, platforms, episodes, or viewership data",
    quickTags: ["season breakdown", "platform analytics", "viewership trends", "renewal status"],
    primaryBtn: "Explore Web Series Data",
    secondaryBtn: "Trending Series Analysis",
    gradient: "from-emerald-300 via-teal-400 to-cyan-400",
    accentColor: "emerald",
  },
  OTT: {
    title: "OTT Platform Intelligence Hub",
    subtitle: "Streaming platform analytics, content strategy breakdowns, and subscriber growth intelligence.",
    searchPlaceholder: "Search OTT platforms, originals, subscribers, or content libraries",
    quickTags: ["platform comparison", "original content", "subscriber growth", "content strategy"],
    primaryBtn: "Explore OTT Analytics",
    secondaryBtn: "Platform Performance Trends",
    gradient: "from-rose-300 via-red-400 to-orange-400",
    accentColor: "rose",
  },
  BoxOffice: {
    title: "Box Office Intelligence Hub",
    subtitle: "Real-time box office tracking, verdict analysis, and theatrical performance metrics.",
    searchPlaceholder: "Search box office collections, verdicts, records, or theatrical data",
    quickTags: ["daily collections", "verdict analysis", "all-time records", "territory breakdown"],
    primaryBtn: "Explore Box Office Data",
    secondaryBtn: "Current Theatrical Trends",
    gradient: "from-amber-300 via-orange-400 to-red-400",
    accentColor: "amber",
  },
  Celebrities: {
    title: "Celebrity Intelligence Hub",
    subtitle: "Career analytics, net worth breakdowns, filmography analysis, and brand endorsement intelligence.",
    searchPlaceholder: "Search celebrities, net worth, filmography, or endorsements",
    quickTags: ["net worth analysis", "career timeline", "brand deals", "upcoming projects"],
    primaryBtn: "Explore Celebrity Profiles",
    secondaryBtn: "Trending Celebrity News",
    gradient: "from-fuchsia-300 via-violet-400 to-purple-400",
    accentColor: "fuchsia",
  },
};

export default function CategoryHeroSection({ category }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const config = categoryConfig[category] || categoryConfig.Bollywood;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`/api/public/search?q=${encodeURIComponent(trimmedQuery)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleResultClick = (href) => {
    router.push(href);
    setShowDropdown(false);
    setQuery("");
  };

  // Hollywood-specific styling
  const isHollywood = category === "Hollywood";
  const bgGradient = isHollywood 
    ? "from-purple-900/20 via-pink-900/10 to-orange-900/20"
    : "from-amber-950/20 via-zinc-950 to-zinc-950";

  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient}`} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className={`text-center max-w-${isHollywood ? '6xl' : '4xl'} mx-auto`}>
          {/* Premium Badge - Hollywood style */}
          {isHollywood && config.badgeText && (
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-6 py-3 rounded-full mb-8 backdrop-blur-sm">
              <Flame className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">{config.badgeText}</span>
            </div>
          )}

          {!isHollywood && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500 font-medium">Premium Intelligence Platform</span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-6 ${isHollywood ? 'leading-tight' : ''}`}>
            {config.title}
          </h1>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed ${isHollywood ? 'max-w-3xl mx-auto' : ''}`}>
            {config.subtitle}
          </p>

          {/* Search Bar */}
          <div className={`relative max-w-${isHollywood ? '3xl' : '2xl'} mx-auto mb-8`} ref={dropdownRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={config.searchPlaceholder}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-12 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all shadow-2xl"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500 hover:text-white" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] backdrop-blur-2xl text-left">
                {loading ? (
                  <div className="p-10 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                    <p className="text-zinc-500 text-sm animate-pulse">Scanning intelligence database...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    <div className="p-3 border-b border-zinc-800/50 bg-white/[0.02]">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Intelligence Matches</span>
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.href)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group border-b border-zinc-800/30 last:border-0"
                      >
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-950 border border-zinc-800">
                          {result.image ? (
                            <img src={result.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {result.type === "Celebrity" ? <Star className="w-5 h-5 text-zinc-700" /> : <Film className="w-5 h-5 text-zinc-700" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${
                              result.type === "Article" ? "bg-blue-900/30 text-blue-400 border border-blue-800/30" :
                              result.type === "Celebrity" ? "bg-fuchsia-900/30 text-fuchsia-400 border border-fuchsia-800/30" :
                              "bg-emerald-900/30 text-emerald-400 border border-emerald-800/30"
                            }`}>
                              {result.type}
                            </span>
                            {result.category && (
                              <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">{result.category}</span>
                            )}
                          </div>
                          <h4 className="text-white font-medium group-hover:text-amber-400 transition-colors truncate">{result.title}</h4>
                          {result.description && (
                            <p className="text-xs text-zinc-500 truncate mt-0.5 line-clamp-1">{result.description}</p>
                          )}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                      <Search className="w-6 h-6 text-zinc-700" />
                    </div>
                    <p className="text-zinc-400 font-medium">No results found for "{query}"</p>
                    <p className="text-zinc-600 text-sm mt-1">Try searching for a different keyword</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Tags - Hollywood shows more tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {config.quickTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => setQuery(tag)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  isHollywood
                    ? "bg-zinc-800/50 border border-zinc-700 text-zinc-300 hover:border-purple-500/50 hover:text-purple-300"
                    : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg ${
              isHollywood
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            }`}>
              <Play className="w-5 h-5" />
              {config.primaryBtn}
            </button>
            <button className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
              isHollywood
                ? "bg-zinc-800/50 border border-zinc-700 hover:border-purple-500/50 text-zinc-300 hover:text-purple-300 backdrop-blur-sm"
                : "bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-500"
            }`}>
              <TrendingUp className="w-5 h-5" />
              {config.secondaryBtn}
            </button>
          </div>

          {/* Description Box - Hollywood only */}
          {isHollywood && config.description && (
            <div className="max-w-4xl mx-auto bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
              <p className="text-sm text-zinc-400 leading-relaxed text-left">
                {config.description}
              </p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </section>
  );
}
