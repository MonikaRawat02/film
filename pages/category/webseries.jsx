"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";
import CategoryFilterBar from "../../components/category/CategoryFilterBar";
import CategoryArticlesGrid from "../../components/category/CategoryArticlesGrid";
import { Play, TrendingUp, Calendar, Tv } from "lucide-react";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=WebSeries&limit=20`);
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

export default function WebSeriesPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=WebSeries&limit=20");
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
        <title>Web Series Intelligence Hub | FilmyFire</title>
        <meta name="description" content="In-depth breakdown of episodic content across platforms including performance metrics and audience engagement." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <CategoryHeroSection category="WebSeries" />
        
        {/* Quick Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Series Analyzed", value: "36+", icon: Tv, color: "text-emerald-500" },
              { label: "New This Month", value: "12", icon: Play, color: "text-cyan-500" },
              { label: "Trending Now", value: "8", icon: TrendingUp, color: "text-teal-500" },
              { label: "Upcoming", value: "15", icon: Calendar, color: "text-blue-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all">
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

        <CategoryFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} category="WebSeries" />
        <CategoryArticlesGrid category="WebSeries" articles={filteredArticles} loading={loading} />
        
        {/* Featured Platforms */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Content by Platform</h2>
            <p className="text-zinc-400">Discover web series from your favorite streaming platforms</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {["Netflix", "Prime Video", "Disney+", "Hotstar", "ZEE5", "SonyLIV"].map((platform, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 transition-all cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <p className="text-lg font-bold text-white group-hover:text-emerald-500 transition-colors">{platform}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

WebSeriesPage.noPadding = true;
