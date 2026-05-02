"use client";

import { useRef, useState, useEffect } from "react";
import { Users, TrendingUp, ChevronRight, ChevronLeft, Loader2, Star, Film } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CelebrityIntelligenceHub({ industry = "" }) {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        const timestamp = Date.now();
        const url = industry 
          ? `/api/admin/celebrity/celebrityIntelligence?industry=${industry}&page=1&limit=15&t=${timestamp}&cache=no-store`
          : `/api/admin/celebrity/celebrityIntelligence?page=1&limit=15&t=${timestamp}&cache=no-store`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          // Female-specific names for better fallback image selection
          const femaleNames = ['priyanka', 'deepika', 'alia', 'katrina', 'anushka', 'kareena', 'aishwarya', 'ramya', 'ramani', 'tanwi', 'bhattacharya', 'shraddha', 'kiara', 'sara', 'janhvi', 'ananya', 'kriti', 'disha', 'nora'];
          
          const mappedCelebs = data.data.map(c => {
            const name = c.name || "Unknown";
            
            return {
              name: name,
              profession: c.profession || "Actor",
              popularityScore: c.trendingPercentage || 0,
              recentMovie: c.netWorth || "N/A",
              // Only use real image from database, no fallback stock photos
              profileImage: c.profileImage || null,
              hasRealImage: !!c.profileImage,
              slug: c.slug,
              careerStage: "Peak",
              filmsCount: c.filmsCount || 0
            };
          });
          
          // Sort by popularity (trendingPercentage) descending
          mappedCelebs.sort((a, b) => b.popularityScore - a.popularityScore);
          
          setCelebrities(mappedCelebs);
        } else {
          console.warn('No celebrity data returned from API');
        }
      } catch (error) {
        console.error("Error fetching celebrities for hub:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCelebrities();
  }, [industry]);

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
          
          {!loading && celebrities.length > 0 && (
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
          )}
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl w-72 h-96 animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : celebrities.length > 0 ? (
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
                  {/* Actor Image */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-zinc-800">
                    {celeb.hasRealImage ? (
                      <>
                        <Image 
                          src={celeb.profileImage} 
                          alt={celeb.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          sizes="288px"
                          onError={(e) => {
                            // If image fails to load, show placeholder icon
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        
                        {/* Fallback container for broken images */}
                        <div className="absolute inset-0 items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900" style={{display: 'none'}}>
                          <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-zinc-700/50 flex items-center justify-center border-2 border-zinc-600">
                              <svg className="w-12 h-12 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                            </div>
                            <p className="text-zinc-500 text-xs font-medium">No Photo Available</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Show profile icon for celebrities without images
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <div className="text-center">
                          <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-zinc-700/50 flex items-center justify-center border-2 border-zinc-600">
                            <svg className="w-12 h-12 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                          <p className="text-zinc-500 text-xs font-medium">No Photo Available</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    
                    {/* Profession Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-500/90 backdrop-blur-sm text-zinc-950 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        {celeb.profession}
                      </span>
                    </div>
                    
                    {/* Popularity Score */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/90 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-bold text-amber-500">{celeb.popularityScore}%</span>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Name */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{celeb.name}</h3>
                    
                    {/* Recent Movie */}
                    <div className="mb-4">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Recent Movie</p>
                      <p className="text-xs text-zinc-400 line-clamp-1 flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        {celeb.recentMovie}
                      </p>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                      <span>{celeb.filmsCount} Films</span>
                      <span className="text-amber-500 font-semibold">{celeb.careerStage}</span>
                    </div>
                    
                    {/* CTA */}
                    <Link 
                      href={`/celebrity/${celeb.slug}/profile`}
                      className="flex items-center gap-1 text-amber-500 text-xs font-bold group/btn"
                    >
                      <span>View Full Profile</span>
                      <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 italic">No celebrity intelligence available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
