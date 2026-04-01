"use client";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertTriangle, Shield, Gavel, BookOpen } from "lucide-react";

export default function TermsOfServicePage() {
  const terms = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Acceptance of Terms",
      content: `By accessing and using FilmyFire, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
      
      These terms may be modified at any time without prior notice. Your continued use of the site constitutes acceptance of the updated terms.`,
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "User Responsibilities",
      content: `You agree to:
      • Use the site only for lawful purposes
      • Not attempt to gain unauthorized access to our systems
      • Not interfere with the proper working of the site
      • Not copy, modify, or distribute site content without permission
      • Respect intellectual property rights
      • Provide accurate information when creating accounts`,
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Prohibited Activities",
      content: `The following activities are strictly prohibited:
      • Using automated systems (bots, scrapers) to access content
      • Reverse engineering or decompiling site code
      • Impersonating others or providing false information
      • Harassing, threatening, or harming other users
      • Distributing malware or malicious code
      • Attempting to circumvent security measures`,
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Intellectual Property",
      content: `All content on FilmyFire is owned by or licensed to us:
      • Articles, analysis, and editorial content are copyrighted
      • Trademarks, logos, and brand names are protected
      • Data compilations and databases have sui generis rights
      • Limited personal, non-commercial use is permitted
      
      Commercial use requires explicit written permission.`,
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "Limitation of Liability",
      content: `FilmyFire is provided "as is" without warranties of any kind:
      • We don't guarantee accuracy of all information
      • Service may be interrupted for maintenance
      • We're not liable for indirect or consequential damages
      • Our total liability won't exceed $100 USD
      
      You use the service at your own risk.`,
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Termination",
      content: `We reserve the right to:
      • Suspend or terminate accounts for violations
      • Remove content that violates these terms
      • Refuse service to anyone at our discretion
      • Take legal action for serious violations
      
      Upon termination, your right to use the site ceases immediately.`,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="terms-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 0 40 L 40 0 L 80 40 L 40 80 Z" fill="none" stroke="#ef4444" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#terms-pattern)" />
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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 mb-6 shadow-2xl shadow-red-500/50"
            >
              <FileText className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6">
              Terms of Service
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              The rules and guidelines that govern your use of FilmyFire. 
              Please read them carefully.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-600/30">
                <CheckCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-400">Effective: January 2025</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-600/30">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-400">Legally Binding</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Notice Banner */}
      <section className="py-12 border-y border-gray-800 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-600/30"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Important Notice
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  By using FilmyFire, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                  If you disagree with any part of these terms, you must discontinue use of our services immediately.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {terms.map((term, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                    {term.icon}
                  </div>
                  <div className="flex-1 p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-red-500/30 transition-all">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {term.title}
                    </h2>
                    <div className="text-gray-300 space-y-4 leading-relaxed whitespace-pre-line">
                      {term.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Clauses */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Governing Law */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <Gavel className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">
                Governing Law
              </h3>
              <p className="text-gray-300 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of India, 
                without regard to its conflict of law provisions. Any disputes shall be subject to the 
                exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <FileText className="w-10 h-10 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">
                Modifications to Terms
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service 
                after changes constitutes acceptance of the new terms. We encourage you to periodically 
                review this page for updates.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <BookOpen className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Need Clarification?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              If you have questions about these terms or need clarification on any point, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Contact Us
              </motion.a>
              <motion.a
                href="/privacy-policy"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all"
              >
                View Privacy Policy
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
