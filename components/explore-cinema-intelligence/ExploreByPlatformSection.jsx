"use client";

import { Tv, BarChart3, Play, Clapperboard, ArrowUpRight } from "lucide-react";

const platforms = [
  {
    name: "Netflix Analysis",
    articles: "2.5K+",
    description: "Explore hit shows, content strategy, and viewership patterns on the world's leading streaming platform",
    gradient: "from-red-500/20 to-orange-500/20",
    baseColor: "bg-gradient-to-br from-red-600 to-red-700",
    icon: Play,
  },
  {
    name: "Amazon Prime Analysis",
    articles: "1.8K+",
    description: "Deep dive into Prime Video originals, regional content strategy and their performance metrics",
    gradient: "from-blue-500/20 to-cyan-500/20",
    baseColor: "bg-gradient-to-br from-blue-600 to-cyan-600",
    icon: Tv,
  },
  {
    name: "Disney+ Hotstar",
    articles: "1.2K+",
    description: "Analyzing Indian originals, sports streaming impact, and family entertainment dynamics",
    gradient: "from-indigo-500/20 to-purple-500/20",
    baseColor: "bg-gradient-to-br from-indigo-600 to-purple-600",
    icon: Clapperboard,
  },
  {
    name: "Theatrical Releases",
    articles: "3.1K+",
    description: "Box office intelligence, theatrical performance analytics, and post-pandemic cinema trends",
    gradient: "from-amber-500/20 to-orange-500/20",
    baseColor: "bg-gradient-to-br from-orange-500 to-red-600",
    icon: BarChart3,
  },
];

const stats = [
  { value: "8.6K+", label: "Total Articles" },
  { value: "250K+", label: "Active Users" },
  { value: "1.2K+", label: "Intelligence Reports" },
  { value: "50+", label: "Weekly Updates" },
];

function PlatformCard({ platform }) {
  const Icon = platform.icon;
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-800/50 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 h-[320px]">
      {/* Base Background */}
      <div className={`absolute inset-0 ${platform.baseColor}`} />
      
      {/* Gradient Overlay - Always visible with subtle opacity */}
      <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} blur-2xl`} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-8">
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-auto">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-1">{platform.name}</h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 w-fit">
                <BarChart3 className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/90">{platform.articles} Articles</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-base text-white/80 leading-relaxed mb-6">
          {platform.description}
        </p>
        
        {/* Explore Button */}
        <button className="group/btn relative w-full flex items-center justify-between px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl text-sm font-medium text-white transition-all overflow-hidden">
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
          <span className="relative z-10">Explore Platform</span>
          <ArrowUpRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function ExploreByPlatformSection() {
  return (
    <section className="py-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30">
          <Tv className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-4xl text-white font-sans">Explore by Platform</h2>
          <p className="text-zinc-500 text-sm mt-1">Platform-specific intelligence and analytics</p>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {platforms.map((platform, index) => (
          <PlatformCard key={index} platform={platform} />
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-5 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl text-center hover:border-zinc-700/50 transition-all"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
