"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Info, Scale, BookOpen, Shield, XCircle } from "lucide-react";

export default function DisclaimerPage() {
  const disclaimers = [
    {
      icon: <Info className="w-7 h-7" />,
      title: "General Information Only",
      content: "All content on FilmyFire is for general informational and entertainment purposes only. The information provided should not be construed as professional advice. We make no representations or warranties of any kind about the completeness, accuracy, reliability, suitability, or availability of the content.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <AlertTriangle className="w-7 h-7" />,
      title: "No Professional Advice",
      content: "FilmyFire does not provide financial, legal, tax, or investment advice. Any financial figures, net worth estimates, or box office analysis are based on publicly available information and should not be used as the basis for financial decisions. Consult qualified professionals for advice specific to your situation.",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: <Scale className="w-7 h-7" />,
      title: "Forward-Looking Statements",
      content: "Some content may contain forward-looking statements about box office projections, career trajectories, or industry trends. These statements involve known and unknown risks, uncertainties, and other factors that may cause actual results to differ materially from those expressed or implied.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: "External Links",
      content: "Our site may contain links to external websites that are not operated by us. We have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies or terms of service. Access at your own risk.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Fair Use & Educational Purpose",
      content: "FilmyFire operates under fair use principles for educational and commentary purposes. All trademarks, logos, images, and copyrighted material remain the property of their respective owners. Our use constitutes fair use under copyright law for purposes such as criticism, comment, news reporting, teaching, and research.",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <XCircle className="w-7 h-7" />,
      title: "No Endorsement",
      content: "Mention of specific films, web series, platforms, or individuals does not constitute endorsement or recommendation. We maintain editorial independence and do not accept payment for positive coverage. Sponsored content is clearly labeled as such.",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Warning pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="warning-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 30 5 L 55 50 L 5 50 Z" fill="none" stroke="#fbbf24" strokeWidth="1"/>
                <circle cx="30" cy="35" r="8" fill="#fbbf24" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#warning-pattern)"/>
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
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 mb-6 shadow-2xl shadow-amber-500/50"
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
              Disclaimer
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Important information about the limitations and proper use of 
              content on FilmyFire.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/20 border border-amber-600/30">
                <Info className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-400">Please Read Carefully</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-600/30">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-400">Legal Notice</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Notice Banner */}
      <section className="py-16 border-y border-gray-800 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-600/30"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Critical Notice
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  By using this website, you acknowledge that you have read and understood this disclaimer. 
                  If you do not agree with any part of this disclaimer, you must discontinue use of the 
                  website immediately. The information provided is subject to change without notice.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer Sections Grid */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <BookOpen className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Key Disclaimers
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Understanding the scope and limitations of our content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {disclaimers.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-amber-500/50 transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{item.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Accuracy of Information */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <Info className="w-10 h-10 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Accuracy of Information
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    While we strive to ensure all information is accurate and up-to-date, the entertainment industry 
                    is dynamic and figures change frequently. Box office numbers, net worth estimates, viewership 
                    data, and other statistics may become outdated quickly. We update our content regularly but 
                    cannot guarantee real-time accuracy. Users should verify critical information from multiple 
                    sources before relying on it.
                  </p>
                </div>
              </div>
            </div>

            {/* No Warranties */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <Shield className="w-10 h-10 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    No Warranties
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    FilmyFire is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express 
                    or implied. We disclaim all warranties, including but not limited to implied warranties of 
                    merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that 
                    the site will be uninterrupted, error-free, or free of viruses or other harmful components.
                  </p>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <Scale className="w-10 h-10 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Limitation of Liability
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Under no circumstances shall FilmyFire, its owners, employees, or affiliates be liable for any 
                    direct, indirect, incidental, special, consequential, or exemplary damages resulting from your 
                    use of or inability to use the service, even if advised of the possibility of such damages. 
                    Your sole remedy for dissatisfaction with the site is to stop using it.
                  </p>
                </div>
              </div>
            </div>

            {/* Industry Estimates */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-10 h-10 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Industry Estimates & Projections
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Net worth figures, box office projections, and career trajectory analyses are estimates based on 
                    publicly available information and industry knowledge. Actual figures may vary significantly. 
                    Celebrity net worth values are approximations derived from various sources and should not be 
                    considered definitive financial statements. Box office projections are speculative and actual 
                    performance may differ substantially.
                  </p>
                </div>
              </div>
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
            <BookOpen className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Questions About This Disclaimer?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              If you have questions about our disclaimer or how it applies to your use of FilmyFire, 
              please contact our legal team.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Contact Us
              </motion.a>
              <motion.a
                href="/terms"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all"
              >
                View Terms of Service
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
