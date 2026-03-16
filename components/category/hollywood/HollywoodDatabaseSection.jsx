"use client";

import { Database, Filter, ChevronRight } from "lucide-react";

export default function HollywoodDatabaseSection() {
  const categories = [
    { title: "Action Movies", count: "2,847 movies" },
    { title: "2024 Releases", count: "342 movies" },
    { title: "Netflix Originals", count: "1,523 movies" },
    { title: "Top Rated Films", count: "500 movies" },
    { title: "Sci-Fi Collection", count: "1,891 movies" },
    { title: "Drama Films", count: "3,214 movies" },
    { title: "Comedy Movies", count: "2,156 movies" },
    { title: "Thriller Collection", count: "1,678 movies" },
    { title: "Disney+ Library", count: "987 movies" },
    { title: "Award Winners", count: "423 movies" },
  ];

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
