'use client';

import { FileText, ChevronRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HollywoodIndustryAnalysis() {
  const articles = [
    {
      title: "Why Some Hollywood Movies Fail",
      description: "Deep dive into the financial, creative, and marketing factors that lead to box office disasters. From poor timing to audience disconnect.",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop",
      category: "Industry Analysis",
      readTime: "12 min read",
      tags: ["box office flops", "movie failures", "Hollywood economics"],
    },
    {
      title: "The Economics of Hollywood Franchises",
      description: "How Marvel, DC, and other franchises build billion-dollar ecosystems through strategic planning, character development, and universe building.",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
      category: "Financial Analysis",
      readTime: "15 min read",
      tags: ["MCU", "franchise strategy", "cinematic universe"],
    },
    {
      title: "OTT vs Cinema Revenue: The Shifting Landscape",
      description: "Analysis of how streaming platforms are reshaping Hollywood's revenue models, theatrical windows, and production strategies.",
      image: "https://images.unsplash.com/photo-1517604931442-71053e3e2c28?q=80&w=1000&auto=format&fit=crop",
      category: "Market Trends",
      readTime: "10 min read",
      tags: ["streaming revenue", "theatrical release", "Netflix strategy"],
    },
    {
      title: "Future of AI in Hollywood Filmmaking",
      description: "Exploring how artificial intelligence is transforming script analysis, visual effects, marketing, and audience targeting in modern cinema.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
      category: "Technology",
      readTime: "18 min read",
      tags: ["AI cinema", "machine learning VFX", "predictive analytics"],
    },
    {
      title: "The Star Power Index: Who Really Sells Tickets?",
      description: "Data-driven analysis of which actors and directors truly drive box office success in 2024 and beyond.",
      image: "https://images.unsplash.com/photo-1507676184212-d0370baf553c?q=80&w=1000&auto=format&fit=crop",
      category: "Celebrity Analysis",
      readTime: "14 min read",
      tags: ["box office draw", "celebrity value", "A-list actors"],
    },
    {
      title: "International Markets: Hollywood's Global Strategy",
      description: "How Hollywood studios are adapting content, marketing, and distribution for China, India, and emerging markets.",
      image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?q=80&w=1000&auto=format&fit=crop",
      category: "Global Trends",
      readTime: "16 min read",
      tags: ["international box office", "China market", "global cinema"],
    },
  ];

  return (
    <section className="py-8 md:py-10 bg-[#0A0E17] text-white border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <FileText className="w-8 h-8 text-orange-400" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Hollywood Industry Analysis
          </h2>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, i) => (
            <Link href="#" key={i} className="group flex flex-col bg-[#121826] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:scale-[1.02] backdrop-blur-[10px]">
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-orange-500/90 text-white shadow-lg">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors leading-tight line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{article.readTime}</span>
                  <TrendingUp className="w-4 h-4" />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-400 group-hover:border-orange-500/20 group-hover:text-gray-300 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center text-orange-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                  Read Analysis <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mb-12">
          <Link href="#" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-orange-500/50 text-orange-300 hover:bg-orange-500/10 transition-all group text-lg font-semibold">
            View All Industry Analysis Articles
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* SEO Banner */}
        <div className="mt-8 p-4 rounded-xl border border-orange-500/30 bg-orange-500/5 text-center">
          <p className="text-orange-300 text-sm">
            High-Value SEO Content: Each article optimized for industry keywords • 200+ in-depth analysis pieces
          </p>
        </div>

      </div>
    </section>
  );
}
