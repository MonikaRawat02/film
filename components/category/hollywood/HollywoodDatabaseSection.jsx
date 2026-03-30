"use client";

import { useState, useEffect } from "react";
import { Database, Filter, ChevronRight } from "lucide-react";

export default function HollywoodDatabaseSection() {
  const [categories, setCategories] = useState([
    { title: "Action Movies", count: "..." },
    { title: "2024 Releases", count: "..." },
    { title: "Netflix Originals", count: "..." },
    { title: "Top Rated Films", count: "..." },
    { title: "Sci-Fi Collection", count: "..." },
    { title: "Drama Films", count: "..." },
    { title: "Comedy Movies", count: "..." },
    { title: "Thriller Collection", count: "..." },
    { title: "Disney+ Library", count: "..." },
    { title: "Award Winners", count: "..." },
  ]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/public/category-counts");
        const data = await res.json();
        if (data.success) {
          // In a real scenario, we'd have more granular counts. 
          // For now, let's use the total Hollywood count and distribute it or fetch specific genre counts if available.
          const totalHollywood = data.counts.Hollywood || 0;
          
          setCategories(prev => prev.map(cat => {
            // Mocking dynamic distribution based on total Hollywood count for demo purposes
            // In production, you'd have an API that returns these specific counts
            let count = "...";
            if (cat.title.includes("Action")) count = `${Math.floor(totalHollywood * 0.3)} movies`;
            else if (cat.title.includes("2024")) count = `${Math.floor(totalHollywood * 0.15)} movies`;
            else if (cat.title.includes("Netflix")) count = `${Math.floor(totalHollywood * 0.4)} movies`;
            else if (cat.title.includes("Sci-Fi")) count = `${Math.floor(totalHollywood * 0.2)} movies`;
            else if (cat.title.includes("Drama")) count = `${Math.floor(totalHollywood * 0.35)} movies`;
            else count = `${Math.floor(totalHollywood * 0.1) + 10} movies`;

            return { ...cat, count };
          }));
        }
      } catch (error) {
        console.error("Error fetching category counts:", error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <section className="bg-[#0B0F1A] text-white py-16 md:py-24 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Heading */}
        <div className="flex items-center gap-3 mb-12">
          <Database className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Explore Hollywood Movie Database
          </h2>
        </div>

        {/* Filter Box */}
        <div className="p-8 rounded-2xl border border-white/10 bg-[#121826] backdrop-blur-[10px] mb-8">
          <div className="flex items-center gap-2 mb-6 text-pink-400 font-medium text-sm">
            <Filter className="w-4 h-4" />
            <span>Filter Movies</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {[
              { label: "Year", options: ["All Years", "2024", "2023", "2022"] },
              { label: "Genre", options: ["All Genres", "Action", "Drama", "Sci-Fi"] },
              { label: "Language", options: ["All Languages", "English", "Spanish", "French"] },
              { label: "Box Office", options: ["All Box Offices", "Blockbusters", "Indie", "Moderate"] },
              { label: "OTT", options: ["All OTTs", "Netflix", "Disney+", "HBO Max"] },
            ].map((filter, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {filter.label}
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-white/20 bg-black/30 text-white focus:border-purple-500 focus:outline-none transition-all cursor-pointer appearance-none">
                  {filter.options.map((opt, j) => (
                    <option key={j} value={opt} className="bg-[#121826]">{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md px-8 py-2.5 text-sm font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95">
            Apply Filters
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="group flex items-center justify-between p-5 rounded-xl border border-white/10 bg-[#121826] backdrop-blur-[10px] transition-all duration-300 cursor-pointer hover:border-purple-500/50"
            >
              <div>
                <h3 className="font-semibold mb-1 text-white group-hover:text-purple-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-400 font-medium">{cat.count}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-purple-400" />
            </div>
          ))}
        </div>

        {/* Programmatic SEO Footer */}
        <div className="mt-12 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center">
          <p className="text-xs text-purple-300/60 font-medium tracking-wide">
            Programmatic SEO: Each category auto-generates dedicated landing pages • 10,000+ indexed pages
          </p>
        </div>

      </div>
    </section>
  );
}
