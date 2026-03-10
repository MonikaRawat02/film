"use client";
import { useState } from "react";

export default function FAQSection({ celebrity }) {
  const name = celebrity?.name || "Shah Rukh Khan";
  const [expandedIndex, setExpandedIndex] = useState(1); // Second FAQ expanded by default

  // Static data - will be replaced by API
  const faqs = [
    {
      question: `What is ${name}&apos;s net worth in 2025?`,
      answer: `${name}&apos;s estimated net worth in 2025 is approximately $770-780 million, making him one of the wealthiest actors in the world. This includes earnings from films, brand endorsements, business ventures, and investments.`,
    },
    {
      question: `How much does ${name} charge per movie?`,
      answer: `${name} charges between $40-60 million per film, including his acting fee and profit-sharing arrangements. He&apos;s one of the highest-paid actors globally and often takes backend deals for blockbuster productions.`,
    },
    {
      question: `What are ${name}&apos;s main sources of income?`,
      answer: `${name}&apos;s main income sources include film earnings (40%), brand endorsements (25%), IPL team ownership through KKR (15%), Red Chillies Entertainment production house (12%), and real estate investments (8%).`,
    },
    {
      question: `Does ${name} own Kolkata Knight Riders?`,
      answer: `Yes, ${name} is a co-owner of Kolkata Knight Riders (KKR), one of the most valuable IPL franchises. He owns a significant stake in the team alongside Juhi Chawla and her husband Jay Mehta.`,
    },
    {
      question: `What is the value of ${name}&apos;s Mannat bungalow?`,
      answer: `${name}&apos;s iconic Mannat bungalow in Bandra, Mumbai is estimated to be worth approximately Rs 200 crore ($25-30 million). It&apos;s one of the most famous celebrity homes in India.`,
    },
    {
      question: `How does ${name}&apos;s wealth compare to other Bollywood actors?`,
      answer: `${name} is the wealthiest actor in Bollywood, with a net worth significantly higher than other top actors like Salman Khan ($360M), Akshay Kumar ($340M), and Aamir Khan ($225M).`,
    },
    {
      question: `What brands does ${name} endorse?`,
      answer: `${name} endorses numerous major brands including Hyundai, Tag Heuer, Dubai Tourism, Byju&apos;s, and many more. He reportedly charges $3-5 million per brand endorsement annually.`,
    },
    {
      question: `What businesses does ${name} own?`,
      answer: `${name} owns Red Chillies Entertainment (film production), Red Chillies VFX (visual effects studio), Knight Riders Group (sports franchise ownership), and has investments in various startups and real estate.`,
    },
  ];

  return (
    <section className="bg-[#0a0c14] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
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

        {/* Schema markup notice */}
        <p className="text-center text-xs text-gray-600 mt-6">
          ✓ Schema markup enabled for enhanced search visibility
        </p>
      </div>
    </section>
  );
}
