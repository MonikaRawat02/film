"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, BarChart3, TrendingDown, ChevronRight, Award } from "lucide-react";
import Link from "next/link";

export default function HollywoodBoxOfficeSection() {
  const [stats, setStats] = useState([
    {
      title: "Top Grossing All-Time",
      value: "$2.9B",
      movie: "Avatar",
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      color: "border-green-500/30",
      bg: "bg-green-500/5",
      badgeBg: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      title: "Opening Weekend Records",
      value: "$357M",
      movie: "Avengers: Endgame",
      icon: <BarChart3 className="w-5 h-5 text-orange-400" />,
      color: "border-orange-500/30",
      bg: "bg-orange-500/5",
      badgeBg: "bg-orange-500/10",
      textColor: "text-orange-400",
    },
    {
      title: "Most Profitable Films",
      value: "1,200% ROI",
      movie: "Paranormal Activity",
      icon: <DollarSign className="w-5 h-5 text-purple-400" />,
      color: "border-purple-500/30",
      bg: "bg-purple-500/5",
      badgeBg: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      title: "Biggest Box Office Flops",
      value: "-$175M",
      movie: "John Carter",
      icon: <TrendingDown className="w-5 h-5 text-red-400" />,
      color: "border-red-500/30",
      bg: "bg-red-500/5",
      badgeBg: "bg-red-500/10",
      textColor: "text-red-400",
    },
  ]);

  const [topMovies, setTopMovies] = useState([
    { rank: "#1", movie: "Avatar", year: 2009, gross: "$2.923B", isTop: true },
    { rank: "#2", movie: "Avengers: Endgame", year: 2019, gross: "$2.799B" },
    { rank: "#3", movie: "Avatar: The Way of Water", year: 2022, gross: "$2.320B" },
    { rank: "#4", movie: "Titanic", year: 1997, gross: "$2.264B" },
    { rank: "#5", movie: "Star Wars: The Force Awakens", year: 2015, gross: "$2.071B" },
  ]);

  useEffect(() => {
     const fetchBoxOfficeData = async () => {
       try {
         const res = await fetch("/api/public/box-office");
         const data = await res.json();
         if (data.success && data.data.length > 0) {
           // Sorting by collection (assuming worldwide gross is stored here)
           // Note: In a real app, you'd want to parse these strings into numbers for sorting
           const sorted = [...data.data].sort((a, b) => {
             const valA = parseFloat(a.collection.replace(/[^0-9.]/g, ''));
             const valB = parseFloat(b.collection.replace(/[^0-9.]/g, ''));
             return valB - valA;
           });

          // Update Top 5 Table
          const top5 = sorted.slice(0, 5).map((item, idx) => ({
            rank: `#${idx + 1}`,
            movie: item.movieName,
            year: new Date(item.createdAt).getFullYear(), // Fallback to year if not in model
            gross: item.collection,
            isTop: idx === 0
          }));
          setTopMovies(top5);

          // Update Stats Cards with dynamic values
          setStats(prev => {
            const newStats = [...prev];
            newStats[0].movie = sorted[0].movieName;
            newStats[0].value = sorted[0].collection;
            
            // Find a flop (negative ROI or low collection)
            const flop = sorted.find(m => m.verdict.toLowerCase().includes('flop'));
            if (flop) {
              newStats[3].movie = flop.movieName;
              newStats[3].value = flop.collection;
            }
            return newStats;
          });
        }
      } catch (error) {
        console.error("Error fetching box office data:", error);
      }
    };
    fetchBoxOfficeData();
  }, []);

  return (
    <section className="bg-[#0A0E17] text-white py-8 md:py-10 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Heading */}
        <div className="flex items-center gap-3 mb-12">
          <DollarSign className="w-8 h-8 text-green-400" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Hollywood Box Office Reports
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border ${stat.color} ${stat.bg} backdrop-blur-[10px] transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-6">
                {stat.icon}
                <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${stat.badgeBg} ${stat.textColor}`}>
                  View All
                </span>
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-2">{stat.title}</h3>
              <div className={`text-[30px] font-bold mb-2 ${stat.textColor}`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 font-medium">{stat.movie}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121826] overflow-hidden backdrop-blur-[10px]">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-[20px] font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Top 5 Highest-Grossing Hollywood Movies
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400">Rank</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400">Movie Title</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400">Year</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Worldwide Gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topMovies.map((movie, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition-colors border-b border-white/5">
                    <td className={`px-6 py-4 text-sm font-bold ${movie.rank === '#3' || movie.isTop ? 'text-orange-400' : 'text-gray-500'}`}>
                      {movie.rank} {movie.isTop && <span className="ml-1 text-[10px]">👑</span>}
                    </td>
                    <td className="px-6 py-4 text-[16px] font-medium text-white group-hover:text-emerald-400 transition-colors">
                      {movie.movie}
                    </td>
                    <td className="px-6 py-4 text-[16px] text-gray-400">
                      {movie.year}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-400 font-bold text-lg">
                        {movie.gross}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-white/5 text-center">
            <Link href="#" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
              View Complete Top 100 List →
            </Link>
          </div>
        </div>

        {/* Footer Links Bar */}
        <div className="mt-8 p-4 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
          <p className="text-green-300 text-sm">
            SEO Pages Generated:{" "}
            <Link href="/hollywood/box-office/top-grossing" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
              /hollywood/box-office/top-grossing
            </Link>
            {" • "}
            <Link href="/hollywood/box-office/weekend-records" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
              /hollywood/box-office/weekend-records
            </Link>
            {" • "}
            <span className="text-green-300">Updated weekly</span>
          </p>
        </div>

      </div>
    </section>
  );
}
