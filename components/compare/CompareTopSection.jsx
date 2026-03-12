"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

function CelebrityDropdown({ label, selected, onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch celebrities on open or search
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const url = query
          ? `/api/admin/celebrity/celebrityIntelligence?q=${encodeURIComponent(query)}&limit=20`
          : `/api/admin/celebrity/celebrityIntelligence?limit=20`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(Array.isArray(data.data) ? data.data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [open, query]);

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
          <img
            src={selected?.image || "/placeholder.jpg"}
            alt={selected?.name || "Select"}
            className="w-10 h-10 rounded-full object-cover"
          />
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
          <div className="overflow-y-auto max-h-80">
            {loading && (
              <div className="p-4 text-sm text-gray-500 text-center">Loading...</div>
            )}
            {!loading && results.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center">No celebrities found</div>
            )}
            {!loading && results.map((opt, i) => {
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
                  className={`w-full p-3 flex items-center gap-3 hover:bg-gray-800 transition-colors text-left ${
                    isSelected ? "bg-indigo-600/60" : ""
                  }`}
                >
                  <img
                    src={opt.profileImage || "/placeholder.jpg"}
                    alt={opt.name || "Celebrity"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-white">{opt.name || "Unknown"}</div>
                    <div className="text-sm text-gray-400">{opt.profession || "Actor, Producer"}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompareTopSection({ celebrityA, celebrityB, onSelectA, onSelectB }) {
  const [currency, setCurrency] = useState("USD");

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
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
          <div className="mb-6">
            <h1 className="text-5xl mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Compare Celebrity Net Worths: {selectedA?.name}{selectedB ? ` vs ${selectedB.name}` : ""}
            </h1>
            <p className="text-gray-400 text-lg">
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
