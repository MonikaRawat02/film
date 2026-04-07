"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import OTTHeroSection from "../../components/category/ott/OTTHeroSection";
import OTTFilterBar from "../../components/category/ott/OTTFilterBar";
import OTTArticlesGrid from "../../components/category/ott/OTTArticlesGrid";
import OTTMovieIntelligence from "../../components/category/ott/OTTMovieIntelligence";
import { Smartphone, PlaySquare, Globe, ShieldCheck } from "lucide-react";

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
    console.error("Error fetching OTT articles:", error);
    return {
      props: {
        initialArticles: [],
      },
    };
  }
}

export default function OTTIndexPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
      <Head>
        <title>OTT Intelligence Hub | FilmyFire</title>
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
                    <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <OTTFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <OTTArticlesGrid initialArticles={initialArticles} activeFilter={activeFilter} />
        <OTTMovieIntelligence />
      </div>
    </>
  );
}

OTTIndexPage.noPadding = true;
