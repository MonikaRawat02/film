"use client";
import { Film, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CreateHero() {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const debounceTimer = useRef(null);

  const fetchResults = async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchResults(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = (href) => {
    router.push(href);
    setIsFocused(false);
  };

  return (
    <section className="font-sans">
      <div className="relative mx-auto max-w-[1055px] px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
          <Film className="w-5 h-5 text-red-500" />
          <span className="text-sm tracking-wider">FILMYFIRE INTELLIGENCE</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl mb-6 bg-gradient-to-r from-white via-purple-200 to-red-200 bg-clip-text text-transparent leading-tight font-sans tracking-tight font-semibold">
            Explore Cinema
            <span className="block bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-sans">
            Discover deep story explanations, box office insights, OTT analytics, and celebrity
            intelligence across Bollywood, Hollywood, and web series.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.length >= 2) {
                    router.push(`/intelligence?search=${encodeURIComponent(searchQuery)}`);
                    setIsFocused(false);
                  }
                }}
                placeholder="Search movies, web series, actors, or explanations..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full h-16 bg-transparent border-0 px-6 py-5 text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-zinc-500" />
                )}
              </div>
            </div>
            
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 max-h-[400px] overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <>
                    <div className="text-xs text-zinc-500 mb-3 font-medium">POPULAR SEARCHES</div>
                    <ul className="space-y-1">
                      <li>
                        <button 
                          onClick={() => setSearchQuery("Animal ending explained")}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          Animal ending explained
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => setSearchQuery("Avatar box office")}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          Avatar box office
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => setSearchQuery("Shah Rukh Khan career")}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          Shah Rukh Khan career
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => setSearchQuery("Mirzapur Season 3")}
                          className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          Mirzapur Season 3
                        </button>
                      </li>
                    </ul>
                  </>
                ) : results.length > 0 ? (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.href)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-all group/item text-left"
                      >
                        <div className="w-12 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-white/5 group-hover/item:border-white/10 transition-colors">
                          {result.image ? (
                            <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white group-hover/item:text-red-400 transition-colors line-clamp-1">
                              {result.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                              {result.type}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                            {result.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : !isLoading && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-zinc-500 italic">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-film w-4 h-4">
                <path d="M10.5 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L10.5 2Z"/>
                <path d="M10 2v6a2 2 0 0 0 2 2h6"/>
              </svg>
              Movie endings
            </button>
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3 w-4 h-4">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
              Box office reports
            </button>
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tv w-4 h-4">
                <path d="M21 19V2H3v17"/>
                <path d="M3 15h18"/>
                <path d="M3 8a2 2 0 0 1 2-2h3V2h8v4h3a2 2 0 0 1 2 2v11"/>
              </svg>
              OTT analysis
            </button>
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-4 h-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Celebrity intelligence
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
