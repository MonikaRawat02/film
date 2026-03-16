"use client";

import { Eye, AlertCircle, RefreshCw, Monitor, Users, ChevronRight } from "lucide-react";

const insights = [
  {
    category: "Industry Analysis",
    title: "Why Big Bollywood Films Fail",
    description: "Analysis of star-studded projects that underperformed despite massive budgets and marketing campaigns",
    readTime: "8 min read",
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />
  },
  {
    category: "Trend Analysis",
    title: "Why Remakes Struggle",
    description: "Deep dive into Bollywood's remake culture and why most fail to connect with modern audiences",
    readTime: "6 min read",
    icon: <RefreshCw className="w-5 h-5 text-amber-500" />
  },
  {
    category: "Digital Trends",
    title: "How OTT Impacts Bollywood",
    description: "Understanding the shift in viewing habits and its effect on theatrical releases and content creation",
    readTime: "10 min read",
    icon: <Monitor className="w-5 h-5 text-amber-500" />
  },
  {
    category: "Box Office Intelligence",
    title: "Star Power vs Story Power",
    description: "Data-driven analysis of whether star casting or compelling narratives drive box office success",
    readTime: "7 min read",
    icon: <Users className="w-5 h-5 text-amber-500" />
  }
];

export default function BollywoodIndustryInsights() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Eye className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight">Industry Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-amber-500/10 p-3 rounded-lg flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-block bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-400 mb-2 font-medium tracking-wider">
                  {item.category}
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-amber-500 transition-colors truncate">
                  {item.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
              {item.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">{item.readTime}</span>
              <button className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors font-semibold group/btn">
                Read Analysis 
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
