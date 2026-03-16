"use client";

import { Film, ChevronRight } from "lucide-react";

export default function BollywoodFooterSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-6 tracking-tight">
          Understand Bollywood Beyond Reviews
        </h2>
        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
          Go deeper than ratings and reviews. Explore data-driven insights, story analysis, and career intelligence.
        </p>
        <button className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 px-8 py-4 rounded-lg text-lg font-semibold transition-colors group">
          <Film className="w-5 h-5" />
          <span>Explore All Bollywood Intelligence</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
