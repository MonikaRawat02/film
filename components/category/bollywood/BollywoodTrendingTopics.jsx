"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/router";

export default function BollywoodTrendingTopics() {
  const [trendingIntelligence, setTrendingIntelligence] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/admin/celebrity/celebrityIntelligence?page=1&limit=8");
        const data = await res.json();
        if (data.data) {
          setTrendingIntelligence(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch trending intelligence:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleTopicClick = (slug) => {
    router.push(`/celebrity/${slug}/profile`);
  };

  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight">Trending Bollywood Intelligence</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : trendingIntelligence.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {trendingIntelligence.map((item, idx) => (
              <button
                key={item.slug || idx}
                onClick={() => handleTopicClick(item.slug)}
                className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-lg px-4 py-3 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-amber-500/70 group-hover:text-amber-500" />
                  <span className="text-zinc-200 font-medium group-hover:text-amber-500 transition-colors capitalize">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <p className="text-zinc-500 text-xs">{item.profession}</p>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <p className="text-amber-500/70 text-[10px] font-bold">+{item.trendingPercentage}%</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 italic">No trending intelligence available.</p>
          </div>
        )}
      </div>
    </section>
  );
}
