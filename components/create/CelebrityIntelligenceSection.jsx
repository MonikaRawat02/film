"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, TrendingUp, Award } from "lucide-react";

const celebrities = [
  {
    name: "Ranbir Kapoor",
    image: "/uploads/salmankhan.jpeg",
    score: 92,
    status: "Peak",
    statusColor: "from-green-500/20 to-emerald-500/20",
    statusTextColor: "text-green-400",
    trending: "Top 2 Trending",
    recentProjects: ["Animal", "Tu Jhoothi Main Makkaar"],
  },
  {
    name: "Alia Bhatt",
    image: "/uploads/salmankhan.jpeg",
    score: 94,
    status: "Peak",
    statusColor: "from-green-500/20 to-emerald-500/20",
    statusTextColor: "text-green-400",
    trending: "Top 4 Trending",
    recentProjects: ["Rocky Aur Rani", "Jigra"],
  },
  {
    name: "Shah Rukh Khan",
    image: "/uploads/ShahRukhKhan.jpeg",
    score: 96,
    status: "Peak",
    statusColor: "from-blue-500/20 to-cyan-500/20",
    statusTextColor: "text-blue-400",
    trending: "Top 6 Trending",
    recentProjects: ["Pathaan", "Jawan", "Dunki"],
  },
  {
    name: "Deepika Padukone",
    image: "/uploads/Ajaydevgan.avif",
    score: 93,
    status: "Rising",
    statusColor: "from-purple-500/20 to-pink-500/20",
    statusTextColor: "text-purple-400",
    trending: "Top 8 Trending",
    recentProjects: ["Pathaan", "Fighter", "Kalki 2898 AD"],
  },
  {
    name: "Vicky Kaushal",
    image: "/uploads/AmirKhan.jpeg",
    score: 88,
    status: "Reinvention",
    statusColor: "from-amber-500/20 to-orange-500/20",
    statusTextColor: "text-amber-400",
    trending: "Top 10 Trending",
    recentProjects: ["Sam Bahadur", "Dunki", "Chhaava"],
  },
  {
    name: "Katrina Kaif",
    image: "/uploads/Amitabh-bachchan.webp",
    score: 85,
    status: "Peak",
    statusColor: "from-rose-500/20 to-red-500/20",
    statusTextColor: "text-rose-400",
    trending: "Top 12 Trending",
    recentProjects: ["Tiger 3", "Merry Christmas"],
  },
];

function CelebrityCard({ celebrity }) {
  return (
    <div className="group relative flex-shrink-0 w-[320px] bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 snap-start">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={celebrity.image}
          alt={celebrity.name}
          className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        
        {/* Score Badge - Top Left */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10">
          <Award className="w-4 h-4 text-yellow-400" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-zinc-400">Score</span>
            <span className="text-sm font-semibold text-white">{celebrity.score}</span>
          </div>
        </div>
        
        {/* Status Badge - Top Right */}
        <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${celebrity.statusColor} border border-white/10 ${celebrity.statusTextColor}`}>
          <TrendingUp className="w-3 h-3" />
          {celebrity.status}
        </div>
        
        {/* Trending Badge - Bottom */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-xl rounded-lg px-3 py-1.5 border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span className="text-xs text-zinc-300">{celebrity.trending}</span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
          {celebrity.name}
        </h3>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-5">Recent Projects</p>
        
        {/* Recent Projects Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {celebrity.recentProjects.map((project, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-zinc-800/80 rounded-lg text-xs text-zinc-300 border border-zinc-700/50"
            >
              {project}
            </span>
          ))}
        </div>
        
        {/* View Button */}
        <button className="group/btn relative w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-white transition-all overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <span className="relative z-10">View Career Intelligence</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 relative z-10">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function CelebrityIntelligenceSection() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = 336;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg shadow-red-500/30">
            <Star className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl text-white font-sans">Celebrity Intelligence</h2>
            <p className="text-sm text-zinc-400 mt-1">Track career trajectories and industry positioning</p>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all hover:scale-105 group"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all hover:scale-105 group"
          >
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden snap-x snap-mandatory scroll-smooth"
      >
        {celebrities.map((celebrity, index) => (
          <CelebrityCard key={index} celebrity={celebrity} />
        ))}
      </div>
    </section>
  );
}
