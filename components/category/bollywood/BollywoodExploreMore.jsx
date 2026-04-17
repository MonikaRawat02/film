"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Film, Trophy, Users, Calendar, ChevronRight } from "lucide-react";

const iconMap = {
  Film: <Film className="w-6 h-6 text-amber-500" />,
  Trophy: <Trophy className="w-6 h-6 text-amber-500" />,
  Users: <Users className="w-6 h-6 text-amber-500" />,
  Calendar: <Calendar className="w-6 h-6 text-amber-500" />
};

export default function BollywoodExploreMore() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/public/bollywood-explore-stats");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch (error) {
        console.error("Error fetching bollywood explore stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-zinc-800 rounded mb-12"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-6"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-900/50 border-y border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 text-center mb-12 tracking-tight">
          Explore More Bollywood Intelligence
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 block"
            >
              <div className="mb-6">
                {iconMap[item.icon] || <Film className="w-6 h-6 text-amber-500" />}
              </div>
              <h3 className="text-lg font-semibold leading-tight mb-2 text-zinc-100 group-hover:text-amber-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-sm mb-6">
                {item.count}
              </p>
              <div className="flex items-center text-amber-500/50 group-hover:text-amber-500 transition-colors">
                <span className="text-sm font-medium mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
