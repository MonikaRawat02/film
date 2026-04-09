import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Film, Star, TrendingUp, Loader2, X } from "lucide-react";
import { useRouter } from "next/router";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

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

  const handleResultClick = async (href, resultTitle, resultType) => {
    // Record the search
    try {
      await fetch("/api/public/record-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: resultTitle || query, 
          category: resultType === "Celebrity" ? "Celebrities" : (resultType === "Article" ? "Bollywood" : "BoxOffice")
        }),
      });
    } catch (err) {
      console.error("Failed to record search:", err);
    }

    router.push(href);
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <section id="hero" className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 text-center">
      {/* Background overlay to prevent content showing through transparent header */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-black via-black/95 to-transparent pointer-events-none lg:hidden" style={{ zIndex: 45 }} />
      <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none hidden lg:block" style={{ zIndex: 45 }} />
      <div className="space-y-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-600/10 bg-red-600/10 px-5 py-2.5 text-xs md:text-sm">
          <span className="block w-2 h-2 bg-red-600 rounded-full animate-pulse flex-shrink-0"></span>
          <span className="text-red-500 font-semibold text-sm uppercase tracking-wide">NOT JUST NEWS — IT&apos;S INTELLIGENCE</span>
        </div>

        <div>
          <h1 className="max-w-5xl mx-auto leading-tight text-white text-5xl md:text-6xl xl:text-7xl font-serif font-extrabold tracking-tight">
            Movies &amp; Web Series —
          </h1>
          <h2 className="max-w-5xl mx-auto text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight font-serif">
            <span className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 bg-clip-text text-transparent">
              Explained Beyond News
            </span>
          </h2>
        </div>

        <p className="mx-auto max-w-4xl text-2xl leading-relaxed font-light text-gray-300">
          Deep story explanations, box office truth, OTT insights &amp; celebrity intelligence — all in
          one authoritative platform.
        </p>

        <div className="max-w-3xl mx-auto mt-12 mb-10 px-4 sm:px-16 relative">
          <div className="relative" ref={dropdownRef}>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-red-500 transition-colors" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, web series, or actors..."
                className="w-full pl-16 pr-12 py-6 bg-white/5 backdrop-blur-xl rounded-2xl border-2 border-gray-800 text-lg text-white placeholder-gray-500 transition-all hover:border-gray-700 hover:bg-white/10 focus:outline-none focus:border-red-600/50 focus:bg-white/10 shadow-2xl"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-white" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-[#0d0d0d] border border-gray-800/50 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] backdrop-blur-2xl">
                {loading ? (
                  <div className="p-10 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                    <p className="text-gray-500 text-sm animate-pulse">Scanning database...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    <div className="p-3 border-b border-gray-800/50 bg-white/[0.02]">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Intelligence Matches</span>
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.href, result.title, result.type)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left group border-b border-gray-800/30 last:border-0"
                      >
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-800">
                          {result.image ? (
                            <img src={result.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {result.type === "Celebrity" ? <Star className="w-5 h-5 text-gray-700" /> : <Film className="w-5 h-5 text-gray-700" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${
                              result.type === "Article" ? "bg-blue-900/30 text-blue-400 border border-blue-800/30" :
                              result.type === "Celebrity" ? "bg-amber-900/30 text-amber-400 border border-amber-800/30" :
                              "bg-green-900/30 text-green-400 border border-green-800/30"
                            }`}>
                              {result.type}
                            </span>
                            {result.category && (
                              <span className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">{result.category}</span>
                            )}
                          </div>
                          <h4 className="text-white font-medium group-hover:text-red-500 transition-colors truncate">{result.title}</h4>
                          {result.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{result.description}</p>
                          )}
                        </div>
                        <TrendingUp className="w-4 h-4 text-gray-700 group-hover:text-red-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                      <Search className="w-6 h-6 text-gray-700" />
                    </div>
                    <p className="text-gray-400 font-medium">No results found for &quot;{query}&quot;</p>
                    <p className="text-gray-600 text-sm mt-1">Try searching for a different keyword</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-gray-500 text-sm mt-4">
              Try: &quot;Inception ending&quot; · &quot;Avatar box office&quot; · &quot;SRK net worth&quot;
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 mt-14 mb-10">
          <Link
            href="/create"
            className="group inline-flex items-center gap-2 rounded-2xl px-10 py-5 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 shadow-sm transition active:scale-95 hover:from-red-500 hover:to-red-600"
          >
            Explore Intelligence Pages
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <Link
            href="/trending-explainers"
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-gray-800 bg-white/5 backdrop-blur-md px-10 py-5 text-base font-semibold text-white transition hover:border-gray-700 hover:bg-white/10 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
            Trending Explainers
          </Link>
        </div>

        <div className="mx-auto max-w-3xl mt-20 border-t border-gray-800/50 pt-20 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">5,000+</div>
            <div className="text-sm text-gray-400">Intelligence Articles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">2M+</div>
            <div className="text-sm text-gray-400">Monthly Readers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-sm text-gray-400">Verified Content</div>
          </div>
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

