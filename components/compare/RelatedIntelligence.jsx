"use client";
import { ExternalLink } from "lucide-react";

export default function RelatedIntelligence() {
  return (
    <section className="lg:px-8 py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-6">Related Intelligence</h2>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white text-xl font-semibold mb-6">Related Intelligence &amp; Insights</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Full profile of Tom Cruise",
                desc: "Explore complete biography, filmography, and career insights",
                img: "https://images.unsplash.com/photo-1608571425696-95bdfcaa78e0?q=80&w=1200&auto=format&fit=crop",
              },
              {
                title: "Top 10 Richest Actors in Bollywood",
                desc: "Comprehensive ranking of net worth across Indian cinema",
                img: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop",
              },
              {
                title: "Celebrity Investment Portfolios 2026",
                desc: "How top celebrities diversify their wealth",
                img: "https://images.unsplash.com/photo-1763848255138-59a5cb0024a527?crop=entropy&auto=format&w=1200&q=80",
              },
            ].map((card, i) => (
              <a
                key={i}
                href="#"
                className="group bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden hover:border-[#DC2626] transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white group-hover:text-[#DC2626] transition-colors">
                      {card.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{card.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
