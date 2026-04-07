"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";
import CategoryFilterBar from "../../components/category/CategoryFilterBar";
import CategoryArticlesGrid from "../../components/category/CategoryArticlesGrid";
import { PlaySquare, Smartphone, Globe, ShieldCheck } from "lucide-react";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=OTT&limit=20`);
    const data = await res.json();

    return {
      props: {
        initialArticles: data.data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      props: {
        initialArticles: [],
      },
    };
  }
}

export default function OTTPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=OTT&limit=20");
        const data = await res.json();
        if (data.data) {
          setArticles(data.data);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = activeFilter === "All" 
    ? articles 
    : articles.filter(article => article.category === activeFilter);

  return (
    <>
      <Head>
        <title>OTT Platform Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Streaming platform analytics, content strategy breakdowns, and subscriber growth intelligence." />
      </Head>

      <div className="min-h-screen bg-black text-zinc-100">
        <CategoryHeroSection category="OTT" />
        
        {/* OTT Stats - Minimal Horizontal Bar */}
        <div className="border-y border-zinc-800/50 bg-zinc-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-8">
              {[
                { label: "Active Platforms", value: "12+", icon: Smartphone },
                { label: "Direct Releases", value: "85", icon: PlaySquare },
                { label: "Global Reach", value: "190+", icon: Globe },
                { label: "Rights Verified", value: "100%", icon: ShieldCheck },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <stat.icon className="w-5 h-5 text-zinc-600" />
                  <div>
                    <p className="text-xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-600">{stat.label}</p>
                  </div>
                  {i < 3 && <div className="w-px h-8 bg-zinc-800 hidden lg:block ml-8" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <CategoryFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} category="OTT" />
        
        {/* Articles with Magazine Header */}
        <div className="border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <h2 className="text-5xl font-bold text-white mb-3">Latest Intelligence</h2>
                <p className="text-zinc-500 text-lg">Curated insights from the OTT industry</p>
              </div>
              <div className="flex items-end justify-start md:justify-end">
                <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-zinc-400 font-medium">{filteredArticles.length} Articles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <CategoryArticlesGrid category="OTT" articles={filteredArticles} loading={loading} />
        
        {/* CTA - Stacked Card Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative">
            {/* Background Cards Stack */}
            <div className="absolute inset-0 flex flex-col gap-2 opacity-30">
              <div className="h-full bg-zinc-900 rounded-3xl border border-zinc-800 transform -rotate-2" />
              <div className="h-full bg-zinc-900 rounded-3xl border border-zinc-800 transform rotate-1" />
            </div>
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-12 md:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Content - 8 cols */}
                <div className="lg:col-span-8 space-y-8">
                  <div>
                    <span className="inline-block px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm font-semibold mb-6">
                      Featured Analysis
                    </span>
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                      OTT Digital Rights
                      <br />
                      <span className="text-zinc-600">Analysis Hub</span>
                    </h2>
                  </div>
                  
                  <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
                    Get exclusive intelligence on high-value digital rights deals, satellite distribution, and streaming performance metrics across all major Indian and International platforms.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="group px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/50 transition-all cursor-pointer">
                      <span className="text-zinc-300 group-hover:text-rose-400 font-medium">Netflix Originals</span>
                    </div>
                    <div className="group px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-purple-500/10 hover:border-purple-500/50 transition-all cursor-pointer">
                      <span className="text-zinc-300 group-hover:text-purple-400 font-medium">Prime Video Deals</span>
                    </div>
                    <div className="group px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all cursor-pointer">
                      <span className="text-zinc-300 group-hover:text-cyan-400 font-medium">Disney+ Performance</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual - 4 cols */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="relative">
                    {/* Glowing Background */}
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl" />
                    
                    {/* Rotating Border */}
                    <div className="relative w-64 h-64">
                      <div className="absolute inset-0 border-2 border-dashed border-rose-500/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                      
                      {/* Inner Content */}
                      <div className="absolute inset-4 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-full flex items-center justify-center">
                        <button className="group w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                          <PlaySquare className="w-12 h-12 text-white ml-1 group-hover:rotate-12 transition-transform" />
                        </button>
                      </div>
                      
                      {/* Orbiting Dots */}
                      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-cyan-500 rounded-full -translate-x-1/2 translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

OTTPage.noPadding = true;
