"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, Film, Award, Search, Loader2 } from "lucide-react";
export default function AllCelebrities() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;
  
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    // Only skip if currently loading the first page
    if (loading && page === 1) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(
      entries => {
        // Trigger only if element is visible AND we have more data AND not already loading
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of element is visible
    );
    
    if (node) observer.current.observe(node);
  }, [hasMore, loadingMore, page]);

  const fetchCelebrities = async (pageNum, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const queryParam = searchQuery.trim() !== "" ? `&q=${encodeURIComponent(searchQuery)}` : "";
      const url = `/api/admin/celebrity/celebrityIntelligence?page=${pageNum}&limit=${LIMIT}${queryParam}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load celebrity intelligence");
      }
      
      const fetchedItems = data.data || [];
      
      if (isLoadMore) {
        setFilteredItems(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(item => item._id));
          const uniqueNewItems = fetchedItems.filter(item => !existingIds.has(item._id));
          return [...prev, ...uniqueNewItems];
        });
      } else {
        setFilteredItems(fetchedItems);
      }
      
      setHasMore(fetchedItems.length === LIMIT);
      
    } catch (e) {
      setError(e.message || "Error loading data");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchCelebrities(page, true);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    setFilteredItems([]);
    setHasMore(true);
    
    const timer = setTimeout(() => {
      fetchCelebrities(1);
    }, searchQuery.trim() !== "" ? 300 : 0);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Remove the old local filtering useEffect


  return (
    <div className="relative bg-[#0f0015] pb-20 pt-16">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-[#0f0015]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-fuchsia-900/10 via-transparent to-transparent" />

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          
          {/* Search Header */}
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Celebrity Intelligence Hub
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Explore deep-dive analysis, net worth reports, and career stats of the world's most influential personalities.
            </p>
            
            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-fuchsia-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search celebrities (e.g. Ranveer Singh, Shah Rukh Khan...)"
                className="block w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-4 flex items-center">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

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
                    key={item._id || i}
                    ref={filteredItems.length === i + 1 ? lastElementRef : null}
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

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="mt-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
              <p className="text-gray-500 text-sm font-medium animate-pulse uppercase tracking-[0.2em]">Analyzing More Profiles...</p>
            </div>
          )}
        </div>
      </div>
  );
}

AllCelebrities.noPadding = true;
