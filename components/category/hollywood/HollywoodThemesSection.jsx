'use client';

import { Compass, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HollywoodThemesSection() {
  const themes = [
    {
      title: "Best Sci-Fi Hollywood Movies",
      description: "Mind-bending science fiction from Blade Runner to Interstellar",
      count: 327,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-purple-500/20",
      accentColor: "text-purple-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-purple-600/20 to-pink-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Most Mind-Bending Films",
      description: "Movies that will twist your perception of reality",
      count: 196,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-indigo-500/20",
      accentColor: "text-indigo-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-indigo-600/20 to-blue-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Movies Like Inception",
      description: "Complex narratives and dream-within-dream concepts",
      count: 89,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-blue-500/20",
      accentColor: "text-blue-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-blue-600/20 to-cyan-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Best Psychological Thrillers",
      description: "Suspenseful stories that play with your mind",
      count: 243,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-red-500/20",
      accentColor: "text-red-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-red-600/20 to-orange-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Most Emotional Hollywood Movies",
      description: "Heart-wrenching dramas that moved audiences worldwide",
      count: 198,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-pink-500/20",
      accentColor: "text-pink-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-pink-600/20 to-rose-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Hidden Gem Films",
      description: "Underrated masterpieces you might have missed",
      count: 412,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-teal-500/20",
      accentColor: "text-teal-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-teal-600/20 to-green-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Best Plot Twist Movies",
      description: "Films with unforgettable shocking endings",
      count: 167,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-amber-500/20",
      accentColor: "text-amber-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-amber-600/20 to-yellow-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Epic Fantasy Adventures",
      description: "From Lord of the Rings to Harry Potter",
      count: 234,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-lime-500/20",
      accentColor: "text-lime-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-lime-600/20 to-emerald-600/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Time Travel Movies",
      description: "Exploring paradoxes and alternate timelines",
      count: 142,
      bgColor: "bg-[#1A1F30]",
      borderColor: "border-cyan-500/20",
      accentColor: "text-cyan-400",
      accentColorHover: "group-hover:text-pink-400",
      overlayGradient: "from-cyan-600/20 to-sky-600/20",
      iconColor: "text-pink-400",
    },
  ];

  return (
    <section className="py-8 md:py-10 bg-[#0A0E17] text-white border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-8 h-8 text-pink-400" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Discover Hollywood Movies by Themes
            </h2>
          </div>
          <p className="text-lg text-gray-400 max-w-3xl">
            Explore curated collections based on themes, emotions, and similarities. Each collection is algorithmically generated for maximum discovery.
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {themes.map((theme, i) => (
            <Link href="#" key={i} className={`group relative block p-6 rounded-2xl border ${theme.borderColor} ${theme.bgColor} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-pink-500/50 overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.overlayGradient} opacity-0 group-hover:opacity-70 transition-opacity duration-300`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Sparkles className={`w-6 h-6 ${theme.iconColor} transition-colors`} />
                  <ChevronRight className={`w-5 h-5 text-gray-500 ${theme.accentColorHover} transition-colors`} />
                </div>
                <h3 className={`text-xl font-bold text-white mb-2 ${theme.accentColorHover} transition-colors`}>{theme.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{theme.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                  <span>{theme.count} movies</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Collection */}
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-transparent backdrop-blur-sm mb-12">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
              🎬
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white">Featured Collection: Movies Like "Inception"</h3>
            <p className="mt-2 text-gray-300">
              Christopher Nolan's masterpiece inspired a new wave of complex, layered narratives in Hollywood cinema. Explore our curated collection of films with similar mind-bending concepts and intricate storytelling.
            </p>
            <div className="mt-4">
              <Link href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                Explore Collection <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Banner */}
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
          <p className="text-sm text-purple-300">
            <span className="font-bold">High-Traffic SEO Pages:</span> Each theme generates dedicated landing pages with movie recommendations • 1,000+ discovery collections
          </p>
        </div>

      </div>
    </section>
  );
}
