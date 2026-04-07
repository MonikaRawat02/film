"use client";

import { Flame, Search, Play, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function OTTHeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const query = searchQuery.trim();
      if (query.length < 2) return;

      router.push(`/box-office?search=${encodeURIComponent(query)}`);

      try {
        fetch("/api/public/record-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, category: "OTT" }),
        });
      } catch (err) {
        console.error("Failed to record search:", err);
      }
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    router.push(`/box-office?search=${encodeURIComponent(tag)}`);
    
    fetch("/api/public/record-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: tag, category: "OTT" }),
    });
  };

  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-950/20 via-zinc-950 to-zinc-950" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full mb-6">
            <Flame className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-rose-500 font-medium">OTT Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-rose-200 via-rose-400 to-rose-200 bg-clip-text text-transparent mb-6">
            OTT & Streaming Intelligence Hub
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed">
            Streaming platform analytics, content strategy breakdowns, and subscriber growth intelligence across Netflix, Prime, Disney+ and more.
          </p>

          <div className="relative max-w-2xl mx-auto mb-6">
            <button 
              onClick={handleSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-rose-500 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Search OTT movies, platform deals, or streaming analytics"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["Netflix movie analysis", "Prime Video deals", "Disney+ Hotstar stats", "streaming rights analysis"].map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-rose-500 hover:border-rose-500/30 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40">
              <Play className="w-5 h-5" />
              Explore OTT Intelligence
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900/50 border border-zinc-800 hover:border-rose-500/30 text-zinc-300 hover:text-rose-500 px-8 py-4 rounded-xl font-semibold transition-all">
              <TrendingUp className="w-5 h-5" />
              Trending Streaming Reports
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
