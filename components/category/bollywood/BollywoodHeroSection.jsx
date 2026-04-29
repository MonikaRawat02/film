"use client";

import { Flame, Search, Play, TrendingUp, Loader2, X, Film } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function BollywoodHeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`/api/public/search?q=${encodeURIComponent(trimmedQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleResultClick = async (href, resultTitle, resultType) => {
    // Record the search
    try {
      await fetch("/api/public/record-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: resultTitle || searchQuery, 
          category: "Bollywood"
        }),
      });
    } catch (err) {
      console.error("Failed to record search:", err);
    }

    router.push(href);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const query = searchQuery.trim();
      if (query.length < 2) return;

      // If there are results, navigate to the first result
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        handleResultClick(firstResult.href, firstResult.title, firstResult.type);
      } else {
        // No results found, show message
        setShowDropdown(true);
      }

      // Record the search analytics asynchronously (securely in background)
      try {
        fetch("/api/public/record-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, category: "Bollywood" }),
        });
      } catch (err) {
        console.error("Failed to record search:", err);
      }
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setShowDropdown(true);
    
    // Record analytics
    fetch("/api/public/record-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: tag, category: "Bollywood" }),
    });
  };

  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-zinc-950" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500 font-medium">Premium Intelligence Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-6">
            Bollywood Intelligence Hub
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed">
            Deep analysis of Hindi cinema including movie explanations, box office truth, OTT insights, and celebrity career intelligence.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6" ref={dropdownRef}>
            <button 
              onClick={handleSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-amber-500 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Search Bollywood movies, actors, box office, or story explanations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 max-h-96 overflow-y-auto z-50">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    <span className="ml-2 text-zinc-400">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={result.id || index}
                        onClick={() => handleResultClick(result.href, result.title, result.type)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors text-left"
                      >
                        {result.image ? (
                          <img 
                            src={result.image} 
                            alt={result.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-zinc-800 rounded flex items-center justify-center">
                            <Film className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 font-medium truncate">{result.title}</p>
                          <p className="text-zinc-500 text-sm truncate">{result.description || result.type}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full flex-shrink-0">
                          {result.type}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="py-8 text-center">
                    <p className="text-zinc-400">No results found for "{searchQuery}"</p>
                    <p className="text-zinc-600 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["movie ending explained", "box office collection", "OTT release details", "actor career analysis"].map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40">
              <Play className="w-5 h-5" />
              Explore Bollywood Intelligence
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-500 px-8 py-4 rounded-xl font-semibold transition-all">
              <TrendingUp className="w-5 h-5" />
              Trending Bollywood Explainers
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
