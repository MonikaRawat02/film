"use client";
import { useState } from "react";

export default function FAQSection({ celebrity }) {
  if (!celebrity) return null;
  const name = celebrity.heroSection?.name || "Unknown";
  const [expandedIndex, setExpandedIndex] = useState(0);

  const faqsData = celebrity.faqs || [];
  const faqs = faqsData.map(item => ({
    question: item.question,
    answer: item.answer
  }));

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-white">Frequently Asked </span>
            <span className="text-purple-400">Questions</span>
          </h2>
          <p className="text-gray-500 mt-2">
            Everything you need to know about {name}&apos;s wealth and career
          </p>
        </div>

        {/* FAQ Container */}
        <div className="bg-[#0d1017] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-800/50">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="transition-colors"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                >
                  <span className="text-sm sm:text-base font-medium text-white pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
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
                {expandedIndex === index && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
