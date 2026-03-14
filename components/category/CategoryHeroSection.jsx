"use client";

import { Flame, Search, Play, TrendingUp } from "lucide-react";

const categoryConfig = {
  Bollywood: {
    title: "Bollywood Intelligence Hub",
    subtitle: "Deep analysis of Hindi cinema including movie explanations, box office truth, OTT insights, and celebrity career intelligence.",
    searchPlaceholder: "Search Bollywood movies, actors, box office, or story explanations",
    quickTags: ["movie ending explained", "box office collection", "OTT release details", "actor career analysis"],
    primaryBtn: "Explore Bollywood Intelligence",
    secondaryBtn: "Trending Bollywood Explainers",
    gradient: "from-amber-200 via-amber-400 to-amber-200",
    accentColor: "amber",
  },
  Hollywood: {
    title: "Hollywood Movies, Actors, Box Office & OTT Intelligence",
    subtitle: "Explore thousands of Hollywood movies, celebrity profiles, streaming releases, and box office insights updated daily.",
    searchPlaceholder: "Search Hollywood movies, actors, franchises, or box office data",
    quickTags: ["Hollywood movies", "Hollywood actors", "Hollywood box office", "Hollywood OTT releases", "Hollywood film analysis"],
    primaryBtn: "Explore Hollywood Movies",
    secondaryBtn: "View Trending Films",
    gradient: "from-purple-300 via-pink-400 to-orange-400",
    accentColor: "purple",
    badgeText: "FilmyFire Intelligence Platform",
    description: "Hollywood cinema continues to dominate the global entertainment landscape, shaping cultural narratives and setting box office records worldwide. From blockbuster franchises to critically acclaimed independent films, the American film industry produces over 700 feature films annually, generating billions in revenue across theatrical releases and streaming platforms. FilmyFire provides comprehensive intelligence on Hollywood's evolving ecosystem, tracking everything from production trends and casting decisions to opening weekend performances and long-tail OTT streaming success. Our platform aggregates real-time data on thousands of movies, celebrity profiles, industry analysis, and viewing patterns to help enthusiasts, professionals, and investors understand the complex dynamics of modern Hollywood entertainment.",
  },
  WebSeries: {
    title: "Web Series Intelligence Hub",
    subtitle: "In-depth breakdown of episodic content across platforms including performance metrics and audience engagement.",
    searchPlaceholder: "Search web series, platforms, episodes, or viewership data",
    quickTags: ["season breakdown", "platform analytics", "viewership trends", "renewal status"],
    primaryBtn: "Explore Web Series Data",
    secondaryBtn: "Trending Series Analysis",
    gradient: "from-emerald-300 via-teal-400 to-cyan-400",
    accentColor: "emerald",
  },
  OTT: {
    title: "OTT Platform Intelligence Hub",
    subtitle: "Streaming platform analytics, content strategy breakdowns, and subscriber growth intelligence.",
    searchPlaceholder: "Search OTT platforms, originals, subscribers, or content libraries",
    quickTags: ["platform comparison", "original content", "subscriber growth", "content strategy"],
    primaryBtn: "Explore OTT Analytics",
    secondaryBtn: "Platform Performance Trends",
    gradient: "from-rose-300 via-red-400 to-orange-400",
    accentColor: "rose",
  },
  BoxOffice: {
    title: "Box Office Intelligence Hub",
    subtitle: "Real-time box office tracking, verdict analysis, and theatrical performance metrics.",
    searchPlaceholder: "Search box office collections, verdicts, records, or theatrical data",
    quickTags: ["daily collections", "verdict analysis", "all-time records", "territory breakdown"],
    primaryBtn: "Explore Box Office Data",
    secondaryBtn: "Current Theatrical Trends",
    gradient: "from-amber-300 via-orange-400 to-red-400",
    accentColor: "amber",
  },
  Celebrities: {
    title: "Celebrity Intelligence Hub",
    subtitle: "Career analytics, net worth breakdowns, filmography analysis, and brand endorsement intelligence.",
    searchPlaceholder: "Search celebrities, net worth, filmography, or endorsements",
    quickTags: ["net worth analysis", "career timeline", "brand deals", "upcoming projects"],
    primaryBtn: "Explore Celebrity Profiles",
    secondaryBtn: "Trending Celebrity News",
    gradient: "from-fuchsia-300 via-violet-400 to-purple-400",
    accentColor: "fuchsia",
  },
};

export default function CategoryHeroSection({ category }) {
  const config = categoryConfig[category] || categoryConfig.Bollywood;

  // Hollywood-specific styling
  const isHollywood = category === "Hollywood";
  const bgGradient = isHollywood 
    ? "from-purple-900/20 via-pink-900/10 to-orange-900/20"
    : "from-amber-950/20 via-zinc-950 to-zinc-950";

  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient}`} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className={`text-center max-w-${isHollywood ? '6xl' : '4xl'} mx-auto`}>
          {/* Premium Badge - Hollywood style */}
          {isHollywood && config.badgeText && (
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-6 py-3 rounded-full mb-8 backdrop-blur-sm">
              <Flame className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">{config.badgeText}</span>
            </div>
          )}

          {!isHollywood && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full mb-6">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500 font-medium">Premium Intelligence Platform</span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-6 ${isHollywood ? 'leading-tight' : ''}`}>
            {config.title}
          </h1>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed ${isHollywood ? 'max-w-3xl mx-auto' : ''}`}>
            {config.subtitle}
          </p>

          {/* Search Bar */}
          <div className={`relative max-w-${isHollywood ? '3xl' : '2xl'} mx-auto mb-8`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder={config.searchPlaceholder}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all"
            />
          </div>

          {/* Quick Tags - Hollywood shows more tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {config.quickTags.map((tag, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  isHollywood
                    ? "bg-zinc-800/50 border border-zinc-700 text-zinc-300 hover:border-purple-500/50 hover:text-purple-300"
                    : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg ${
              isHollywood
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            }`}>
              <Play className="w-5 h-5" />
              {config.primaryBtn}
            </button>
            <button className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
              isHollywood
                ? "bg-zinc-800/50 border border-zinc-700 hover:border-purple-500/50 text-zinc-300 hover:text-purple-300 backdrop-blur-sm"
                : "bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-500"
            }`}>
              <TrendingUp className="w-5 h-5" />
              {config.secondaryBtn}
            </button>
          </div>

          {/* Description Box - Hollywood only */}
          {isHollywood && config.description && (
            <div className="max-w-4xl mx-auto bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
              <p className="text-sm text-zinc-400 leading-relaxed text-left">
                {config.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
