"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";
import CategoryFilterBar from "../../components/category/CategoryFilterBar";
import CategoryArticlesGrid from "../../components/category/CategoryArticlesGrid";
import { TrendingUp, DollarSign, BarChart3, Trophy } from "lucide-react";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=BoxOffice&limit=20`);
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

export default function BoxOfficePage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=BoxOffice&limit=20");
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
        <title>Box Office Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Real-time box office tracking, verdict analysis, and theatrical performance metrics." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <CategoryHeroSection category="BoxOffice" />
        
        {/* Box Office Metrics Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Collection", value: "₹4,250Cr", icon: DollarSign, color: "text-amber-500" },
              { label: "Hit Ratio", value: "42%", icon: BarChart3, color: "text-orange-500" },
              { label: "Top Performer", value: "Animal", icon: Trophy, color: "text-yellow-500" },
              { label: "Growth Rate", value: "+18%", icon: TrendingUp, color: "text-red-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-amber-500/30 transition-all">
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

        <CategoryFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} category="BoxOffice" />
        <CategoryArticlesGrid category="BoxOffice" articles={filteredArticles} loading={loading} />
        
        {/* All-Time Records */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">All-Time Box Office Records</h2>
            <p className="text-zinc-400">The highest grossing films in cinematic history</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Highest Opening Day", movie: "RRR", collection: "₹223Cr" },
              { title: "Highest Worldwide", movie: "Dangal", collection: "₹2,024Cr" },
              { title: "Highest Domestic", movie: "Baahubali 2", collection: "₹1,030Cr" },
            ].map((record, i) => (
              <div key={i} className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-8 rounded-2xl group hover:border-amber-500/30 transition-all">
                <h4 className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4">{record.title}</h4>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors">{record.movie}</p>
                  <p className="text-xl font-bold text-amber-500">{record.collection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

BoxOfficePage.noPadding = true;
