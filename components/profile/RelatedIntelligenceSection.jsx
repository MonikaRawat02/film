"use client";
import { useState } from "react";
import { Film, Building2, TrendingUp, BarChart3, Users, Briefcase, Globe, Star } from "lucide-react";

export default function RelatedIntelligenceSection({ celebrity }) {
  if (!celebrity) return null;

  const [hoverIndex, setHoverIndex] = useState(-1);

  const relatedData = celebrity.relatedIntelligence || [];
  const celebName = celebrity.heroSection?.name || "";

  const getIcon = (category, title) => {
    const text = (category + " " + title).toLowerCase();
    if (text.includes("movie") || text.includes("film")) return Film;
    if (text.includes("business") || text.includes("empire") || text.includes("company")) return Building2;
    if (text.includes("richest") || text.includes("wealth") || text.includes("money")) return TrendingUp;
    if (text.includes("impact") || text.includes("score") || text.includes("rank")) return BarChart3;
    if (text.includes("career") || text.includes("timeline")) return Briefcase;
    if (text.includes("global") || text.includes("world")) return Globe;
    if (text.includes("star") || text.includes("celebrity")) return Star;
    return Users;
  };

  const getTheme = (index) => {
    const themes = [
      { color: "#ef4444", bg: "bg-red-500/10 text-red-500" },    // Red
      { color: "#06b6d4", bg: "bg-cyan-500/10 text-cyan-500" }, // Cyan
      { color: "#eab308", bg: "bg-yellow-500/10 text-yellow-500" }, // Yellow
      { color: "#3b82f6", bg: "bg-blue-500/10 text-blue-500" }  // Blue
    ];
    return themes[index % themes.length];
  };

  return (
    <section className="bg-[#050505] py-20 border-t border-gray-900">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3">
            Related Intelligence
          </h2>
          <p className="text-gray-500 text-lg font-light">
            Deep dive into {celebName}&apos;s career, business, and impact
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedData.map((item, index) => {
            const Icon = getIcon(item.category, item.title);
            const theme = getTheme(index);
            const isHovered = hoverIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}
                style={{
                  borderColor: isHovered ? theme.color : "rgba(31, 41, 55, 1)",
                  boxShadow: isHovered ? `0 0 30px ${theme.color}44` : "none",
                  transform: isHovered ? "translateY(-4px)" : "none",
                }}
                className="group relative p-8 rounded-2xl border bg-[#0d0d12] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* High Bright Glow Background (matching AssetsLifestyleSection style) */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${theme.color}, transparent 70%)` }}
                />

                <div className="relative flex items-start gap-6 z-10">
                  {/* Icon Box */}
                  <div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${theme.bg} ${isHovered ? 'scale-110 shadow-lg' : ''}`}
                    style={{ 
                      backgroundColor: isHovered ? theme.color : undefined,
                      color: isHovered ? 'white' : undefined
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 
                      className="text-xl font-bold text-white mb-2 transition-colors duration-300"
                      style={{ color: isHovered ? theme.color : 'white' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                      {item.description}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                         style={{ color: theme.color }}>
                      <span>Read detailed analysis</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
