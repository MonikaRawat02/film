"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

export default function FAQSection({ celebrity }) {
  if (!celebrity) return null;
  const name = celebrity.heroSection?.name || "Unknown";
  const slug = celebrity.heroSection?.slug;

  const [expandedIndex, setExpandedIndex] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [loadingFAQs, setLoadingFAQs] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    async function loadFAQs() {
      try {
        setLoadingFAQs(true);
        setError(null);
        const res = await fetch("/api/celebrity/generate-faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });

        if (res.ok) {
          const result = await res.json();
          setFaqs(result.data || []);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch celebrity FAQs");
        }
      } catch (err) {
        console.error("Celebrity FAQ fetch error:", err);
        setError(err.message);
        // Fallback to celebrity.faqs if API fails
        if (celebrity.faqs && celebrity.faqs.length > 0) {
          setFaqs(celebrity.faqs.map(item => ({
            question: item.question,
            answer: item.answer
          })));
        }
      } finally {
        setLoadingFAQs(false);
      }
    }

    loadFAQs();
  }, [slug, celebrity.faqs]);

  if (loadingFAQs) {
    return (
      <section className="bg-[#0a0c14] py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Generating FAQs...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#0a0c14] py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">Error loading FAQs: {error}</p>
        </div>
      </section>
    );
  }

  if (!faqs.length) {
    return null; // Don't render section if no FAQs are available
  }

  return (
    <section className="bg-[#0a0c14] py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Frequently Asked <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">Questions</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to know about {name}&apos;s wealth and career
          </p>
        </div>

        {/* FAQ Container with Glow Effect */}
        <div className="relative max-w-5xl mx-auto group">
          {/* Glowing Background Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
          
          {/* FAQ Card */}
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-[1.5rem] border border-white/10 p-4 sm:p-6">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/5 bg-slate-900/50 overflow-hidden transition-all duration-300 hover:bg-slate-800/50">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors"
                  >
                    <span className="text-base font-semibold text-white pr-4 leading-snug">
                      {faq.question}
                    </span>
                    <div className="transition-transform duration-300">
                      <ChevronDown className={`w-4 h-4 text-slate-500 ${
                        expandedIndex === index ? "rotate-180" : ""
                      }`} />
                    </div>
                  </button>
                  
                  {expandedIndex === index && (
                    <div className="px-4 sm:px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
