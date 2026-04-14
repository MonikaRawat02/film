"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, Film, Award } from "lucide-react";

export default function CelebritySection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        const res = await fetch("/api/admin/celebrity/celebrityIntelligence?page=1&limit=8", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load celebrity intelligence");
        }
        if (!ignore) {
          setItems(Array.isArray(data.data) ? data.data : []);
        }
      } catch (e) {
        if (!ignore) setError(e.message || "Error loading data");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section id="celebrities" className="relative py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0f0015] via-fuchsia-900/20 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 mb-10">
          <div className="space-y-3">
            <div className="inline-block px-4 py-2 bg-purple-600/10 border border-purple-600/30 rounded-full">
              <span className="text-purple-500 font-semibold text-sm uppercase tracking-wider">
                VERIFIED PROFILES
              </span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-white mb-4">
              Celebrity Intelligence
            </h2>
            <p className="text-gray-400 text-xl">
              Comprehensive career analytics &amp; verified data
            </p>
          </div>
          <Link
            href="/celebrities"
            className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            All Celebrity Profiles
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-600 bg-red-600/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(loading ? new Array(4).fill(null) : items).map((item, i) => {
            // Support both direct properties and nested heroSection properties
            const name = item?.heroSection?.name || item?.name || "";
            const netWorth = item?.netWorth || "";
            const films = item?.filmsCount ?? null;
            const awards = item?.awardsCount ?? null;
            const trend = item?.trendingPercentage ?? null;
            const slug = item?.heroSection?.slug || item?.slug || "";
            const image = item?.heroSection?.profileImage || item?.profileImage || "";
            
            return (
              <div
                key={i}
                className="group relative h-[420px] w-full overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${image || '/placeholder.jpg'})` }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                
                {/* Top Right Trend */}
                {trend != null && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 backdrop-blur-md border border-emerald-500/20">
                     <TrendingUp className="w-4 h-4 text-emerald-400" />
                     <span className="text-sm font-bold text-emerald-400">+{trend}%</span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-6">
                  {/* Name */}
                  <h3 className="mb-4 text-3xl font-bold text-white leading-tight truncate">{name}</h3>
                  
                  {/* Net Worth Card */}
                  <div className="mb-3 rounded-lg bg-black/40 p-3 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-3">
                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                         <DollarSign className="h-5 w-5" />
                       </div>
                       <div>
                         <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Net Worth</div>
                         <div className="text-base font-bold text-white">{netWorth || "N/A"}</div>
                       </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                     {/* Films */}
                     <div className="rounded-lg bg-black/40 p-3 backdrop-blur-sm border border-white/10 flex items-center gap-3">
                       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                         <Film className="h-4 w-4" />
                       </div>
                       <div>
                         <div className="text-xs font-medium text-gray-400 uppercase">Films</div>
                         <div className="text-sm font-bold text-white">{films || "0"}+</div>
                       </div>
                     </div>

                     {/* Awards */}
                     <div className="rounded-lg bg-black/40 p-3 backdrop-blur-sm border border-white/10 flex items-center gap-3">
                       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                         <Award className="h-4 w-4" />
                       </div>
                       <div>
                         <div className="text-xs font-medium text-gray-400 uppercase">Awards</div>
                         <div className="text-sm font-bold text-white">{awards || "0"}</div>
                       </div>
                     </div>
                  </div>

                  {/* Button */}
                  <Link
                    href={slug ? `/celebrity/${slug}/networth` : "#"}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] hover:shadow-purple-900/40 active:scale-95"
                  >
                    View Complete Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
