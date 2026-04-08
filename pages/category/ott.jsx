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
            <div className="shrink-0">
              <div className="w-48 h-48 rounded-full border-8 border-rose-500/10 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping" />
                <PlaySquare className="w-20 h-20 text-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

OTTPage.noPadding = true;
