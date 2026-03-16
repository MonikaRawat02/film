"use client";

import { TrendingUp } from "lucide-react";

const trendingTopics = [
  { topic: "Bollywood movie ending explained", searches: "12.5K searches" },
  { topic: "highest box office collection Bollywood", searches: "8.2K searches" },
  { topic: "Bollywood actor net worth", searches: "6.8K searches" },
  { topic: "Bollywood OTT releases", searches: "5.3K searches" },
  { topic: "Animal movie explained", searches: "15.2K searches" },
  { topic: "Pathaan box office collection", searches: "9.1K searches" },
  { topic: "Shah Rukh Khan career", searches: "7.5K searches" },
  { topic: "Bollywood movie budget", searches: "4.9K searches" },
  { topic: "Jawan ending meaning", searches: "11.3K searches" },
  { topic: "Bollywood flop movies 2024", searches: "3.7K searches" },
  { topic: "Deepika Padukone upcoming movies", searches: "6.2K searches" },
  { topic: "Bollywood vs Hollywood box office", searches: "4.1K searches" }
];

export default function BollywoodTrendingTopics() {
  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight">Most Searched Bollywood Topics</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {trendingTopics.map((item, idx) => (
            <button
              key={idx}
              className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-lg px-4 py-3 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-amber-500/70 group-hover:text-amber-500" />
                <span className="text-zinc-200 font-medium group-hover:text-amber-500 transition-colors">
                  {item.topic}
                </span>
              </div>
              <p className="text-zinc-500 text-xs ml-6">{item.searches}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
