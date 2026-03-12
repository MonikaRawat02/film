"use client";
import { useState } from "react";

const data = [
  "Who is richer between these celebrities?",
  "How accurate are these net worth estimates?",
  "Do IPL teams and businesses count in net worth?",
  "How do net worth trends compare over time?",
];

export default function CompareFAQ() {
  const [open, setOpen] = useState(-1);
  return (
    <section className="lg:px-8 py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white text-xl font-semibold mb-6">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {data.map((q, i) => (
              <div key={i} className="border border-gray-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-medium">{q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${open === i ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {open === i ? (
                  <div className="px-4 pb-4 text-gray-400 leading-relaxed">
                    Based on verified estimates from multiple sources including Forbes, Celebrity Net Worth,
                    and industry reports, the comparison shows the estimated net worth difference. These
                    figures include earnings from films, endorsements, businesses, and investments.
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
