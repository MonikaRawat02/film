"use client";
import Link from "next/link";
import { useState } from "react";

export default function CompareTopSection({ celebrity }) {
  const baseName = celebrity?.heroSection?.name || "Unknown";
  const baseSlug = celebrity?.heroSection?.slug || "";
  const baseImage = celebrity?.heroSection?.profileImage || "/placeholder.jpg";
  const baseProfession = Array.isArray(celebrity?.heroSection?.profession)
    ? celebrity.heroSection.profession.join(", ")
    : celebrity?.heroSection?.profession || "N/A";
  const options = Array.isArray(celebrity?.celebrityComparisons?.comparisons)
    ? celebrity.celebrityComparisons.comparisons
    : [];
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [selectedB, setSelectedB] = useState(
    options[0]
      ? {
          name: options[0].name || "Select",
          slug: options[0].slug || "",
          image: options[0].image || "/placeholder.jpg",
          profession: "Actor, Producer",
        }
      : null
  );

  return (
    <section className="relative bg-[#0a0c14]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c14] via-[#0f1220] to-[#0a0c14]" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 pt-6 pb-10">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">Home</Link>
          <span>/</span>
          <Link href="/celebrities" className="hover:text-white transition-colors cursor-pointer">Celebrities</Link>
          <span>/</span>
          <Link href={`/celebrity/${baseSlug}/networth`} className="hover:text-white transition-colors cursor-pointer">{baseName}</Link>
          <span>/</span>
          <span className="text-red-400">Compare</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text mb-4">
          Compare Celebrity Net Worths: {baseName} {selectedB ? `vs ${selectedB.name}` : ""}
        </h1>
        <p className="text-gray-400 mb-8">
          Instant comparison of estimated net worth, career, and earnings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 text-sm text-gray-400">Celebrity A</label>
            <button
              className="w-full bg-[#0d1017] border border-gray-800 rounded-2xl p-4 text-left flex items-center justify-between hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img src={baseImage} alt={baseName} className="h-12 w-12 rounded-full object-cover border border-gray-800" />
                <div>
                  <div className="text-white font-semibold">{baseName}</div>
                  <div className="text-xs text-gray-400">{baseProfession}</div>
                </div>
              </div>
            </button>
          </div>

          <div className="relative">
            <label className="block mb-2 text-sm text-gray-400">Celebrity B</label>
            <button
              onClick={() => setOpen((v) => !v)}
              className="w-full bg-[#0d1017] border border-gray-800 rounded-2xl p-4 text-left flex items-center justify-between hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img src={selectedB?.image || "/placeholder.jpg"} alt={selectedB?.name || "Select"} className="h-12 w-12 rounded-full object-cover border border-gray-800" />
                <div>
                  <div className="text-white font-semibold">{selectedB?.name || "Select a celebrity"}</div>
                  <div className="text-xs text-gray-400">{selectedB ? "Actor, Producer" : "Choose to compare"}</div>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-4 h-4 text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {open && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-800 bg-[#0d1017] shadow-xl max-h-72 overflow-auto">
                <div className="p-2">
                  {(options.length ? options : []).map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedB({ name: opt.name || "Unknown", slug: opt.slug || "", image: opt.image || "/placeholder.jpg", profession: "Actor, Producer" }); setOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-left"
                    >
                      <img src={opt.image || "/placeholder.jpg"} alt={opt.name || "Celebrity"} className="h-10 w-10 rounded-full object-cover border border-gray-800" />
                      <div>
                        <div className="text-sm font-semibold text-white">{opt.name || "Unknown"}</div>
                        <div className="text-xs text-gray-400">Actor, Producer</div>
                      </div>
                    </button>
                  ))}
                  {!options.length && (
                    <div className="p-3 text-sm text-gray-500">No suggestions available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm text-gray-400">Currency</label>
          <div className="inline-flex items-center gap-3">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded-lg font-semibold ${currency === "USD" ? "bg-red-600 text-white" : "border border-gray-800 text-gray-300"}`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency("INR")}
              className={`px-4 py-2 rounded-lg font-semibold ${currency === "INR" ? "bg-red-600 text-white" : "border border-gray-800 text-gray-300"}`}
            >
              INR
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-gray-800 via-gray-900/50 to-transparent" />
      </div>
    </section>
  );
}
