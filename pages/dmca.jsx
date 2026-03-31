"use client";
import { motion } from "framer-motion";
import { Shield, FileText, Mail, CheckCircle, AlertTriangle, Scale } from "lucide-react";

export default function DMCAPage() {
  const steps = [
    {
      number: "01",
      title: "Prepare Your Notice",
      content: "Include all required information: identification of copyrighted work, URL of infringing material, your contact details, and statements of good faith belief.",
    },
    {
      number: "02",
      title: "Submit Notice",
      content: "Send your complete DMCA notice to our designated agent at dmca@filmyfire.com with 'DMCA Takedown Notice' in the subject line.",
    },
    {
      number: "03",
      title: "Review Process",
      content: "Our team reviews all notices within 24-48 hours. We may request additional information if needed.",
    },
    {
      number: "04",
      title: "Action Taken",
      content: "Valid notices result in prompt removal of infringing content. We notify the affected user and provide counter-notice options.",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated scale pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dmca-scale" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 100 50 L 50 100 L 0 50 Z" fill="none" stroke="#ef4444" strokeWidth="1"/>
                <circle cx="50" cy="50" r="10" fill="#ef4444" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dmca-scale)" />
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
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-6 shadow-2xl shadow-purple-500/50"
            >
              <Scale className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent mb-6">
              DMCA Policy
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              FilmyFire respects intellectual property rights. We respond promptly 
              to valid Digital Millennium Copyright Act notices.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-600/30">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-purple-400">Copyright Protection</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-600/30">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-400">Compliant Process</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Commitment Banner */}
      <section className="py-16 border-y border-gray-800 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Shield className="w-16 h-16 text-purple-500 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Our Commitment to Copyright
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              FilmyFire strictly adheres to the Digital Millennium Copyright Act (DMCA) and applicable 
              copyright laws. We respect the intellectual property rights of content creators and take 
              allegations of infringement seriously.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How to File a DMCA Notice */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <FileText className="w-16 h-16 text-purple-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How to File a DMCA Notice
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Follow these steps to submit a copyright infringement claim
            </p>
          </motion.div>

          {/* Steps Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 via-pink-600 to-transparent hidden md:block" />

            <div className="space-y-12">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative flex gap-6 md:gap-8"
                >
                  {/* Number Circle */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 z-10">
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 pt-2">
                    <div className="p-6 md:p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-purple-500/30 transition-all">
                      <h3 className="text-2xl font-semibold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Required Information Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Required Information in Your Notice
            </h2>
            
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your DMCA notice must include ALL of the following information to be considered valid:
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Physical or electronic signature of the copyright owner or authorized agent",
                  "Identification of the copyrighted work claimed to be infringed",
                  "Description of the nature and location of the allegedly infringing material (URLs)",
                  "Your contact information (address, phone number, email)",
                  "Statement of good faith belief that use of the material is not authorized by law",
                  "Statement that the information in the notification is accurate and under penalty of perjury that you are authorized to act on behalf of the copyright owner",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center mt-0.5">
                      <span className="text-purple-500 text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="p-4 rounded-xl bg-purple-600/20 border border-purple-600/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Important Note</h4>
                    <p className="text-gray-300 text-sm">
                      Incomplete notices may delay the review process. Please ensure all required 
                      information is included in your initial submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Counter-Notice Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* For Users */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <Mail className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Submit a DMCA Notice
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                If you believe your copyright has been infringed on our platform, 
                send your notice to our designated agent.
              </p>
              <div className="p-4 rounded-xl bg-purple-600/20 border border-purple-600/30 mb-4">
                <p className="text-sm text-purple-300 mb-2">Designated Agent Email:</p>
                <a href="mailto:dmca@filmyfire.com" className="text-xl font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  dmca@filmyfire.com
                </a>
              </div>
              <p className="text-sm text-gray-400">
                Subject line: "DMCA Takedown Notice"
              </p>
            </div>

            {/* Counter-Notice */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <FileText className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Submit a Counter-Notice
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                If your content was removed due to a DMCA notice and you believe it was a mistake, 
                you may submit a counter-notice.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Counter-notices must include similar information to DMCA notices, plus a statement 
                consenting to jurisdiction of your local federal court. We'll forward valid 
                counter-notices to the claiming party.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Repeat Infringers */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Repeat Infringer Policy
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              FilmyFire maintains a policy of terminating accounts of repeat infringers. 
              Users who repeatedly upload or link to infringing content may have their 
              access to the service terminated in appropriate circumstances.
            </p>
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
            <Scale className="w-16 h-16 text-purple-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Questions About DMCA?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Our copyright team is available to answer questions about our DMCA process 
              or help you understand your rights and responsibilities.
            </p>
            <motion.a
              href="mailto:dmca@filmyfire.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Contact Copyright Team
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
