"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, Film, Award, Search, Loader2 } from "lucide-react";
export default function AllCelebrities() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        // Fetch all celebrities - ideally this should support pagination or search on backend
        const res = await fetch("/api/admin/celebrity/celebrityIntelligence?page=1&limit=100", {
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
          const fetchedItems = Array.isArray(data.data) ? data.data : [];
          setItems(fetchedItems);
          setFilteredItems(fetchedItems);
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = items.filter(item => 
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.slug && item.slug.toLowerCase().includes(lowerQuery))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  return (
    <div className="relative min-h-screen pb-20">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-[#0f0015]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-fuchsia-900/10 via-transparent to-transparent" />

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-10">
          
          {/* Content Area */}
          {error && (
            <div className="rounded-xl border border-red-600 bg-red-600/10 p-4 text-sm text-red-400 mb-8 text-center max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            </div>
            ) : filteredItems.length === 0 ? (
             <div className="text-center py-20">
               <p className="text-gray-400 text-lg">No celebrity profiles found matching &quot;{searchQuery}&quot;.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item, i) => {
                const name = item?.name || "";
                const netWorth = item?.netWorth || "";
                const films = item?.filmsCount ?? null;
                const awards = item?.awardsCount ?? null;
                const trend = item?.trendingPercentage ?? null;
                const slug = item?.slug || "";
                const image = item?.profileImage || "";
                
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
                      <h3 className="mb-4 text-3xl font-bold text-white leading-tight">{name}</h3>
                      
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
          )}
        </div>
      </div>
  );
}
