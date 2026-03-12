"use client";
import { Film } from "lucide-react";
import { useState } from "react";

export default function CreateHero() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="font-sans">
      <div className="relative mx-auto max-w-[1055px] px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
          <Film className="w-5 h-5 text-red-500" />
          <span className="text-sm tracking-wider">FILMYFIRE INTELLIGENCE</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl mb-6 bg-gradient-to-r from-white via-purple-200 to-red-200 bg-clip-text text-transparent leading-tight font-sans tracking-tight font-semibold">
            Explore Cinema
            <span className="block bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-sans">
            Discover deep story explanations, box office insights, OTT analytics, and celebrity
            intelligence across Bollywood, Hollywood, and web series.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">
              <input
                type="text"
                placeholder="Search movies, web series, actors, or explanations..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full h-16 bg-transparent border-0 px-6 py-5 text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
              />
            </div>
            
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50">
                <div className="text-xs text-zinc-500 mb-3 font-medium">POPULAR SEARCHES</div>
                <ul className="space-y-1">
                  <li>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                      Animal ending explained
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                      Avatar box office
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                      Shah Rukh Khan career
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                      Mirzapur Season 3
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-film w-4 h-4">
                <path d="M10.5 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L10.5 2Z"/>
                <path d="M10 2v6a2 2 0 0 0 2 2h6"/>
              </svg>
              Movie endings
            </button>
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3 w-4 h-4">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
              Box office reports
            </button>
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tv w-4 h-4">
                <path d="M21 19V2H3v17"/>
                <path d="M3 15h18"/>
                <path d="M3 8a2 2 0 0 1 2-2h3V2h8v4h3a2 2 0 0 1 2 2v11"/>
              </svg>
              OTT analysis
            </button>
            <button type="button" className="group/chip relative overflow-hidden px-5 py-2.5 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-full text-sm transition-all hover:scale-105 hover:border-white/20 text-gray-300 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-4 h-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Celebrity intelligence
            </button>
          </div>
        </div>
      </div>
      
      {/* Sticky Filter Bar - Separate Section */}
      <div className="sticky top-0 z-40 transition-all duration-300 bg-black/95 backdrop-blur-2xl shadow-2xl shadow-purple-500/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
            <button className="group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 text-white bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-funnel w-5 h-5 text-zinc-500 flex-shrink-0">
                <path d="M11 20h2"/>
                <path d="m19 9-6.7-6.7a2 2 0 0 0-2.6 0L3 9"/>
                <path d="M21 9H3"/>
                <path d="M3 9v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/>
              </svg>
              <span className="relative z-10">All Intelligence</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
            
            <button className="group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800/50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-film w-4 h-4">
                <path d="M10.5 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L10.5 2Z"/>
                <path d="M10 2v6a2 2 0 0 0 2 2h6"/>
              </svg>
              <span>Story Explained</span>
            </button>
            
            <button className="group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800/50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3 w-4 h-4">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
              <span>Box Office Intelligence</span>
            </button>
            
            <button className="group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800/50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tv w-4 h-4">
                <path d="M21 19V2H3v17"/>
                <path d="M3 15h18"/>
                <path d="M3 8a2 2 0 0 1 2-2h3V2h8v4h3a2 2 0 0 1 2 2v11"/>
              </svg>
              <span>OTT Performance</span>
            </button>
            
            <button className="group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800/50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star w-4 h-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>Celebrity Intelligence</span>
            </button>
            
            <button className="group relative px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-2 text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800/50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-4 h-4">
                <path d="M22 7 13.5 15.5 8.5 10.5 2 17"/>
                <path d="M16 7h6v6"/>
              </svg>
              <span>Industry Insights</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
