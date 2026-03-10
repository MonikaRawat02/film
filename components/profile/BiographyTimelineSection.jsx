"use client";
import { useState } from "react";

export default function BiographyTimelineSection({ celebrity }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Static data - will be replaced by API
  const timelineItems = [
    {
      period: "1965-1988",
      title: "Early Life",
      subtitle: "Born in New Delhi, educated at Hansraj College",
      content:
        "Shah Rukh Khan was born on November 2, 1965, in New Delhi, India. He completed his schooling at St. Columba's School and graduated with a bachelor's degree in Economics from Hansraj College. Khan began his career in theatre and television before transitioning to films.",
      hasFullStory: true,
    },
    {
      period: "1988-1992",
      title: "Career Beginning",
      subtitle: "Television breakthrough with Fauji and Circus",
      content:
        "Khan made his television debut with the series Fauji in 1988, followed by Circus in 1989. His charismatic screen presence quickly made him a household name on Indian television.",
      hasFullStory: false,
    },
    {
      period: "1992-1995",
      title: "Breakthrough",
      subtitle: "Film debut and rise to stardom with DDLJ",
      content:
        "His film career began with Deewana (1992). The iconic Dilwale Dulhania Le Jayenge (1995) established him as the 'King of Romance' in Bollywood.",
      hasFullStory: false,
    },
    {
      period: "1995-2005",
      title: "Global Expansion",
      subtitle: "International recognition and blockbuster success",
      content:
        "During this decade, Shah Rukh Khan became a global icon with films like Kuch Kuch Hota Hai, Mohabbatein, and Kal Ho Naa Ho, establishing a massive international fan base.",
      hasFullStory: false,
    },
    {
      period: "2005-2015",
      title: "Business Empire",
      subtitle: "Red Chillies Entertainment and KKR ownership",
      content:
        "Khan expanded into production with Red Chillies Entertainment and became co-owner of Kolkata Knight Riders IPL team, diversifying his income streams significantly.",
      hasFullStory: false,
    },
    {
      period: "2015-Present",
      title: "Legacy Era",
      subtitle: "Continued dominance and new milestones",
      content:
        "With blockbusters like Pathaan (2023), Shah Rukh Khan continues to break records and remains one of the most influential figures in global entertainment.",
      hasFullStory: false,
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-white">Biography </span>
            <span className="text-yellow-400">Timeline</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Journey from Delhi to becoming the King of Bollywood
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Continuous Vertical Line */}
          <div className="absolute right-8 sm:right-12 top-0 bottom-0 w-0.5 bg-purple-500/30" />

          {/* Timeline Items */}
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={index} className="relative pr-16 sm:pr-20">
                {/* Timeline Dot - positioned at right edge */}
                <div className="absolute right-[26px] sm:right-[42px] top-6 z-10">
                  <div
                    className={`w-3 h-3 bg-purple-500 rounded-full ${
                      expandedIndex === index ? "ring-4 ring-purple-500/30" : ""
                    }`}
                  />
                </div>

                {/* Card */}
                <div
                  className={`bg-[#0d1017] rounded-xl border-l-2 border-t border-r border-b transition-all duration-300 cursor-pointer ${
                    expandedIndex === index
                      ? "border-l-purple-500 border-t-gray-800 border-r-gray-800 border-b-gray-800"
                      : "border-l-purple-500/50 border-t-gray-800 border-r-gray-800 border-b-gray-800 hover:border-l-purple-500"
                  }`}
                  onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full mb-3">
                          {item.period}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-400">{item.subtitle}</p>
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

                    {/* Expanded Content */}
                    {expandedIndex === index && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                          {item.content}
                        </p>
                        {item.hasFullStory && (
                          <button className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer">
                            Read full story
                            <span>→</span>
                          </button>
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
