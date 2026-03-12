"use client";

import { TrendingUp } from "lucide-react";

const TrendingCard = ({ 
  title, 
  description, 
  image, 
  category, 
  categoryColor, 
  categoryGradient,
  rating, 
  views, 
  readTime 
}) => {
  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Hover Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-0 group-hover:opacity-[0.20] transition-opacity duration-500 pointer-events-none z-0`} />
      
      {/* Image Container with Overlay */}
      <div className="relative aspect-[9/16] overflow-hidden z-10">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 scale-100 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className={`px-4 py-2 rounded-xl text-xs tracking-wide backdrop-blur-xl border border-white/20 bg-gradient-to-r ${categoryGradient} shadow-lg`}>
            <span className="text-white font-medium">
              {category}
            </span>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="lucide lucide-star w-4 h-4 text-yellow-400 fill-yellow-400">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className="text-sm font-semibold text-white">{rating}</span>
          </div>
        </div>
        
        {/* Stats Row - Bottom of Image */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye w-3.5 h-3.5 text-zinc-300">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className="text-xs font-medium text-zinc-300">{views}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-3.5 h-3.5 text-zinc-300">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-xs font-medium text-zinc-300">{readTime}</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 relative z-10">
        <h3 className="text-2xl mb-3 text-white">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 mb-5 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        {/* View Intelligence Button */}
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${categoryGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl shadow-lg`} />
          <button className="relative w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-white transition-all overflow-hidden group/btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye w-4 h-4">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>View Intelligence</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">
              <path d="M7 7h10v10"/>
              <path d="M7 17 17 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TrendingIntelligenceSection() {
  const trendingData = [
    {
      title: "Animal",
      description: "Deep dive into the psychological transformation of Ranvijay and the symbolism behind the climax.",
      image: "/uploads/animal.jpg",
      category: "Story Explained",
      categoryColor: "bg-blue-500/90",
      categoryGradient: "from-blue-500 to-cyan-500",
      rating: "8.5",
      views: "2.4M",
      readTime: "12 min"
    },
    {
      title: "Avatar: The Way of Water",
      description: "Analysis of how Cameron achieved $2.3B worldwide and reasons for big-budget filmmaking.",
      image: "/uploads/avatar.jpg",
      category: "Box Office Intelligence",
      categoryColor: "bg-emerald-500/90",
      categoryGradient: "from-green-500 to-emerald-500",
      rating: "9.2",
      views: "3.1M",
      readTime: "15 min"
    },
    {
      title: "Mirzapur Season 3",
      description: "How Mirzapur became Prime Video's biggest Indian web series and its audience retention patterns.",
      image: "/uploads/mirzapur.jpg",
      category: "OTT Performance Analysis",
      categoryColor: "bg-purple-500/90",
      categoryGradient: "from-purple-500 to-pink-500",
      rating: "8.8",
      views: "1.9M",
      readTime: "10 min"
    },
    {
      title: "Ranbir Kapoor",
      description: "From Barfi to Animal: analyzing career choices and evolution as Bollywood's versatile star.",
      image: "/uploads/ranbir.jpg",
      category: "Career Intelligence",
      categoryColor: "bg-orange-500/90",
      categoryGradient: "from-orange-500 to-red-500",
      rating: "9",
      views: "2.2M",
      readTime: "18 min"
    },
    {
      title: "The Dark Knight",
      description: "Exploring the philosophical depth and moral complexity behind Nolan's masterpiece.",
      image: "/uploads/dark-knight.jpg",
      category: "Movie DNA Analysis",
      categoryColor: "bg-indigo-500/90",
      categoryGradient: "from-indigo-500 to-purple-500",
      rating: "9.5",
      views: "4.2M",
      readTime: "20 min"
    },
    {
      title: "Jawan",
      description: "Shah Rukh Khan's comeback strategy and how Jawan became a pan-India blockbuster phenomenon.",
      image: "/uploads/jawan.jpg",
      category: "Box Office Intelligence",
      categoryColor: "bg-teal-500/90",
      categoryGradient: "from-teal-500 to-cyan-500",
      rating: "8.7",
      views: "2.6M",
      readTime: "14 min"
    }
  ];

  return (
    <section className="py-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg shadow-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up w-7 h-7 text-white">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
        </div>
        <div>
          <h2 className="text-4xl text-white font-sans">Trending Intelligence</h2>
          <p className="text-sm text-zinc-400 mt-1">Most viewed analyses this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trendingData.map((item, index) => (
          <TrendingCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}
