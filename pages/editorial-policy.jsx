"use client";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Shield, Eye, PenTool, BookOpen } from "lucide-react";

export default function EditorialPolicyPage() {
  const principles = [
    {
      icon: <Eye className="w-7 h-7" />,
      title: "Transparency",
      description: "We clearly disclose our sources, methodologies, and any potential conflicts of interest.",
    },
    {
      icon: <CheckCircle className="w-7 h-7" />,
      title: "Accuracy",
      description: "Every claim is verified through multiple reliable sources before publication.",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Independence",
      description: "Our editorial content remains free from advertiser or studio influence.",
    },
    {
      icon: <PenTool className="w-7 h-7" />,
      title: "Accountability",
      description: "We take responsibility for our content and promptly correct any errors.",
    },
  ];

  const guidelines = [
    {
      number: "01",
      title: "Source Verification",
      content: "All information must be sourced from credible, verifiable channels. We prioritize official statements, verified industry reports, and trusted trade publications.",
    },
    {
      number: "02",
      title: "No Sensationalism",
      content: "We avoid clickbait headlines and sensational language. Our titles accurately reflect the content without exaggeration.",
    },
    {
      number: "03",
      title: "Data-Driven Analysis",
      content: "Claims about box office performance, viewership, or financial metrics are backed by concrete data from recognized sources.",
    },
    {
      number: "04",
      title: "Respectful Coverage",
      content: "We maintain professional discourse and avoid speculative personal commentary about individuals in the industry.",
    },
    {
      number: "05",
      title: "Clear Distinctions",
      content: "News, analysis, opinion pieces, and sponsored content are clearly labeled and distinguished from one another.",
    },
    {
      number: "06",
      title: "Timely Corrections",
      content: "Errors are acknowledged and corrected promptly with clear documentation of what was changed and why.",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Unique Design */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ef4444" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-600/20 border border-red-600/30 mb-6"
            >
              <FileText className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-400">Editorial Standards</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Editorial Policy
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Our commitment to journalistic integrity guides every piece of content we publish. 
              Here's how we ensure quality, accuracy, and trustworthiness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Principles Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-black border-y border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Core Principles
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The foundation of our editorial philosophy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-red-500/50 transition-all"
              >
                <div className="inline-flex p-3 rounded-xl bg-red-600/20 text-red-500 mb-4">
                  {principle.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {principle.title}
                </h3>
                <p className="text-gray-400">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidelines Timeline */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Editorial Guidelines
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The standards we uphold in every article
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 via-orange-600 to-transparent hidden md:block" />

            <div className="space-y-12">
              {guidelines.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative flex gap-6 md:gap-8"
                >
                  {/* Number Circle */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30 z-10">
                    <span className="text-white font-bold text-lg">{item.number}</span>
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 pt-2">
                    <div className="p-6 md:p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-red-500/30 transition-all">
                      <h3 className="text-2xl font-semibold text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <BookOpen className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Our Promise to Readers
                </h2>
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  We pledge to maintain the highest standards of journalism in everything we publish. 
                  Our editorial team operates independently, free from external pressures or influences.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Every article goes through rigorous fact-checking and editorial review to ensure 
                  it meets our standards for accuracy, fairness, and completeness.
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-600/30 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-white mb-2">100%</p>
                    <p className="text-gray-400">Editorial Independence</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Questions About Our Policy?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              If you have questions about our editorial standards or believe we haven't met them, 
              please reach out to us.
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Contact Us
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
