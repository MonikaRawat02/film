"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, User } from "lucide-react";

function CelebrityDropdown({ label, selected, onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ref = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch celebrities on open or search or page change
  const fetchCelebrities = useCallback(async (isNextPage = false) => {
    if (loading || (!hasMore && isNextPage)) return;
    
    setLoading(true);
    const currentPage = isNextPage ? page + 1 : 1;
    
    try {
      const url = query
        ? `/api/admin/celebrity/celebrityIntelligence?q=${encodeURIComponent(query)}&page=${currentPage}&limit=20`
        : `/api/admin/celebrity/celebrityIntelligence?page=${currentPage}&limit=20`;
      
      const res = await fetch(url);
      const data = await res.json();
      const newResults = Array.isArray(data.data) ? data.data : [];
      
      if (isNextPage) {
        setResults(prev => [...prev, ...newResults]);
        setPage(currentPage);
      } else {
        setResults(newResults);
        setPage(1);
      }
      
      setHasMore(newResults.length === 20);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, page, loading, hasMore]);

  // Initial fetch and search fetch
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      fetchCelebrities(false);
    }, 200);
    return () => clearTimeout(timeout);
  }, [open, query]);

  // Infinite scroll handler
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      fetchCelebrities(true);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block mb-2 text-sm text-gray-400">{label}</label>
      <button
        onClick={() => { if (!disabled) setOpen((v) => !v); }}
        className={`w-full bg-gray-900/50 border rounded-lg p-4 flex items-center justify-between transition-colors ${
          open ? "border-[#DC2626]" : "border-gray-800 hover:border-[#DC2626]"
        } ${disabled ? "cursor-default opacity-80" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
            {selected?.image && selected.image !== "/placeholder.jpg" ? (
              <img
                src={selected.image}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div className="text-left">
            <div className="text-white font-semibold">{selected?.name || "Select a celebrity"}</div>
            <div className="text-sm text-gray-400">{selected?.profession || "Choose to compare"}</div>
          </div>
        </div>
        {!disabled && (
          open
            ? <ChevronUp className="w-5 h-5 text-gray-400" />
            : <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-800">
            <div className="relative">
              <Search className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search celebrities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div 
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto max-h-80 no-scrollbar"
          >
            {!loading && results.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center italic">No celebrities found matching "{query}"</div>
            )}
            {results.map((opt, i) => {
              const isSelected = selected?.slug === opt.slug;
              return (
                <button
                  key={i}
                  onClick={() => {
                    onSelect({
                      name: opt.name || "Unknown",
                      slug: opt.slug || "",
                      image: opt.profileImage || "/placeholder.jpg",
                      profession: opt.profession || "Actor, Producer",
                    });
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all border-b border-gray-800/30 last:border-0 group ${
                    isSelected ? "bg-red-600/10 border-l-4 border-l-red-600" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-800 group-hover:ring-red-600/30 transition-all">
                    {opt.profileImage && opt.profileImage !== "/placeholder.jpg" ? (
                      <img
                        src={opt.profileImage}
                        alt={opt.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate group-hover:text-red-400 transition-colors">
                      {opt.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {Array.isArray(opt.profession) ? opt.profession.join(", ") : opt.profession || "Actor, Producer"}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
                  )}
                </button>
              );
            })}
            
            {loading && (
              <div className="p-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                {page > 1 ? "Loading more..." : "Loading..."}
              </div>
            )}
            
            {!loading && hasMore && results.length >= 20 && (
              <div className="p-2 text-[10px] text-gray-600 text-center uppercase tracking-widest opacity-50">
                Scroll for more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompareTopSection({ celebrityA, celebrityB, onSelectA, onSelectB, currency, setCurrency }) {
  const formatSelection = (celeb) => {
    if (!celeb) return null;
    return {
      name: celeb.heroSection?.name || "Select",
      slug: celeb.heroSection?.slug || "",
      image: celeb.heroSection?.profileImage || "/placeholder.jpg",
      profession: Array.isArray(celeb.heroSection?.profession)
        ? celeb.heroSection.profession.join(", ")
        : celeb.heroSection?.profession || "Actor, Producer",
    };
  };

  const selectedA = formatSelection(celebrityA);
  const selectedB = formatSelection(celebrityB);

  // Update URL when selections change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (selectedA?.slug) {
        // We can't easily change the path slug without a reload in standard Next.js without router.push
        // but we can at least keep 'with' query param in sync
      }
      if (selectedB?.slug) {
        url.searchParams.set("with", selectedB.slug);
        window.history.pushState({}, "", url.toString());
      }
    }
  }, [selectedA, selectedB]);

  return (
    <div className="bg-[#0a0a0a]">
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors cursor-pointer">Home</Link>
            <span>/</span>
            <Link href="/celebrities" className="hover:text-white transition-colors cursor-pointer">Celebrities</Link>
            <span>/</span>
            {selectedA && (
              <>
                <Link href={`/celebrity/${selectedA.slug}/networth`} className="hover:text-white transition-colors cursor-pointer">{selectedA.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-red-400">Compare</span>
          </div>

          {/* Title */}
          <div className="mb-3">
            <h1 className="text-5xl mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Compare Celebrity Net Worths: {selectedA?.name}{selectedB ? ` vs ${selectedB.name}` : ""}
            </h1>
            <p className="text-gray-400 text-lg mb-3">
              Instant comparison of estimated net worth, career, and earnings.
            </p>
          </div>

          {/* Dropdowns */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <CelebrityDropdown
              label="Celebrity A"
              selected={selectedA}
              onSelect={(celeb) => onSelectA(celeb.slug)}
            />
            <CelebrityDropdown
              label="Celebrity B"
              selected={selectedB}
              onSelect={(celeb) => onSelectB(celeb.slug)}
            />
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-3 pb-2">
            <span className="text-sm text-gray-400">Currency:</span>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currency === "USD" ? "bg-red-600 text-white" : "border border-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency("INR")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currency === "INR" ? "bg-red-600 text-white" : "border border-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              INR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
