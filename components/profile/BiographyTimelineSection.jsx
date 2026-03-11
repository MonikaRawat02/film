"use client";
import { useState } from "react";

export default function BiographyTimelineSection({ celebrity }) {
  if (!celebrity) return null;
  const [expandedIndex, setExpandedIndex] = useState(0);

  const biographyTimeline = celebrity.biographyTimeline || [];
  const timelineItems = biographyTimeline.map(item => ({
    period: item.period,
    title: item.title,
    subtitle: item.subDescription,
    content: item.description,
    hasFullStory: false
  }));

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-white">Biography </span>
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Timeline</span>
          </h2>
          <p className="text-slate-400">
            Journey from Delhi to becoming the King of Bollywood
          </p>
        </div>

        {/* Timeline */}
        <div className="relative w-full">
          {/* Center spine */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/20 to-purple-500/20" />

          {/* Timeline Items */}
          <div className="space-y-6 md:space-y-8">
            {timelineItems.map((item, index) => (
              <div key={index} className="relative pr-8 md:px-12 pl-12 md:pl-0">
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-6 z-10">
                  <div className={`h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ${expandedIndex === index ? "ring-4 ring-purple-500/30" : "ring-2 ring-white/10"}`} />
                </div>

                <div
                  className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                  onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                >
                  <div className="p-5 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 bg-gradient-to-r from-blue-500/20 to-purple-400/20 text-purple-300">
                          {item.period}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-base text-slate-400">{item.subtitle}</p>
                      </div>
                      <button className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer">
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${
                            expandedIndex === index ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    {expandedIndex === index && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                          {item.content}
                        </p>
                        {item.hasFullStory && (
                          <span className="mt-4 inline-flex text-sm text-blue-400 hover:text-blue-300 transition-colors items-center gap-1 cursor-pointer">
                            Read full story
                            <span>→</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
