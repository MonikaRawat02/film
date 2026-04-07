"use client";

import { useState } from "react";
import Head from "next/head";
import OTTHeroSection from "../../components/category/ott/OTTHeroSection";
import OTTFilterBar from "../../components/category/ott/OTTFilterBar";
import OTTArticlesGrid from "../../components/category/ott/OTTArticlesGrid";
import OTTMovieIntelligence from "../../components/category/ott/OTTMovieIntelligence";
import { PlaySquare, Smartphone, Globe, ShieldCheck } from "lucide-react";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=OTT&limit=12`);
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

  return (
    <>
      <Head>
        <title>OTT Platform Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Streaming platform analytics, content strategy breakdowns, and subscriber growth intelligence across Netflix, Prime, Disney+ and more." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <OTTHeroSection />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Active Platforms", value: "12+", icon: Smartphone, color: "text-rose-500" },
              { label: "Direct Releases", value: "85", icon: PlaySquare, color: "text-red-500" },
              { label: "Global Reach", value: "190+", icon: Globe, color: "text-orange-500" },
              { label: "Rights Verified", value: "100%", icon: ShieldCheck, color: "text-amber-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-rose-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-zinc-800 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-600">{stat.label}</p>
                  </div>
                  {i < 3 && <div className="w-px h-8 bg-zinc-800 hidden lg:block ml-8" />}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        <OTTFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <OTTArticlesGrid initialArticles={initialArticles} activeFilter={activeFilter} />
        <OTTMovieIntelligence />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-r from-rose-900/20 to-zinc-900/40 p-12 rounded-3xl border border-rose-500/20">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-6">OTT Digital Rights Analysis</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Get exclusive intelligence on high-value digital rights deals, satellite distribution, and streaming performance metrics across all major Indian and International platforms.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-zinc-800 rounded-lg text-sm text-zinc-300 border border-zinc-700">Netflix Originals</div>
                <div className="px-4 py-2 bg-zinc-800 rounded-lg text-sm text-zinc-300 border border-zinc-700">Prime Video Deals</div>
                <div className="px-4 py-2 bg-zinc-800 rounded-lg text-sm text-zinc-300 border border-zinc-700">Disney+ Performance</div>
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
