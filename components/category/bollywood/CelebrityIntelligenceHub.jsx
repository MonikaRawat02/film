"use client";

import { useRef } from "react";
import { Users, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";

const celebrities = [
  {
    name: "Shah Rukh Khan",
    status: "Peak Renaissance",
    score: 98,
    projects: "Pathaan, Jawan, Dunki",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500"
  },
  {
    name: "Ranbir Kapoor",
    status: "Critical Success",
    score: 92,
    projects: "Animal, Tu Jhoothi Main Makkaar",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500"
  },
  {
    name: "Deepika Padukone",
    status: "Global Star",
    score: 95,
    projects: "Pathaan, Fighter, Project K",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500"
  },
  {
    name: "Alia Bhatt",
    status: "Award Season Dominance",
    score: 94,
    projects: "Gangubai, Brahmastra, RRR",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500"
  },
  {
    name: "Salman Khan",
    status: "Box Office Sultan",
    score: 88,
    projects: "Tiger 3, Kisi Ka Bhai",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500"
  },
  {
    name: "Hrithik Roshan",
    status: "Action Icon",
    score: 90,
    projects: "Fighter, Vikram Vedha",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500"
  }
];

export default function CelebrityIntelligenceHub() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Celebrity Intelligence Hub</h2>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          <div className="flex gap-6 min-w-max">
            {celebrities.map((celeb, idx) => (
              <div 
                key={idx} 
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden w-72 flex-shrink-0 group hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img 
                    src={celeb.image} 
                    alt={celeb.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500/90 backdrop-blur-sm text-zinc-950 text-xs px-3 py-1 rounded-full font-bold">
                      {celeb.status}
                    </span>
                  </div>
                  
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    <TrendingUp className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-bold text-amber-500">{celeb.score}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{celeb.name}</h3>
                  <div className="mb-4">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Latest Projects</p>
                    <p className="text-xs text-zinc-400 line-clamp-1">{celeb.projects}</p>
                  </div>
                  
                  <button className="flex items-center gap-1 text-amber-500 text-xs font-bold group/btn">
                    <span>View Career Intelligence</span>
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
