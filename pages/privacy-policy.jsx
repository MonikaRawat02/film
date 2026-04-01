"use client";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Information We Collect",
      content: `We collect information that you provide directly to us, including:
      • Account information (name, email, password)
      • Profile information and preferences
      • Comments and feedback you submit
      • Communication preferences
      
      We also automatically collect certain information when you use our site:
      • Device and usage information
      • IP address and browser type
      • Pages you view and time spent
      • Referring website addresses`,
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: `We use the information we collect to:
      • Provide, maintain, and improve our services
      • Personalize your experience on FilmyFire
      • Send you technical notices and support messages
      • Respond to your comments and questions
      • Generate anonymized analytics data
      • Protect our rights and prevent fraud`,
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: `We implement appropriate security measures to protect your personal information:
      • Encryption of data in transit and at rest
      • Regular security audits and updates
      • Restricted access to personal information
      • Secure data storage infrastructure
      
      However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`,
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Your Rights & Choices",
      content: `You have the right to:
      • Access your personal information
      • Correct inaccurate data
      • Request deletion of your data
      • Opt-out of marketing communications
      • Export your data in a portable format
      • Withdraw consent at any time
      
      To exercise these rights, contact us at privacy@filmyfire.com`,
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Third-Party Services",
      content: `We may share your information with:
      • Service providers who perform services on our behalf
      • Analytics partners (Google Analytics, etc.)
      • Advertising partners (with your consent)
      • Legal authorities when required by law
      
      We require all third parties to respect your privacy and comply with applicable data protection laws.`,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Privacy-focused background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="privacy-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="#ef4444" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#privacy-grid)" />
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-6 shadow-2xl shadow-blue-500/50"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent mb-6">
              Privacy Policy
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Your privacy matters. Here's how we collect, use, and protect 
              your personal information.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-600/30">
                <Lock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-400">Last Updated: January 2025</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-600/30">
                <UserCheck className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-400">GDPR Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Principles Cards */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Transparency",
                description: "Clear about what data we collect and why",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "Security",
                description: "Industry-standard protection for your data",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: <UserCheck className="w-6 h-6" />,
                title: "Control",
                description: "You decide how your data is used",
                color: "from-green-500 to-emerald-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-blue-500/50 transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{item.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Sections */}
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    {section.icon}
                  </div>
                  <div className="flex-1 p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/30 transition-all">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {section.title}
                    </h2>
                    <div className="text-gray-300 space-y-3 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cookies Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Cookie Usage
            </h2>
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <p className="text-gray-300 mb-6 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your browsing experience:
              </p>
              <ul className="space-y-3 text-gray-400 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Essential Cookies:</strong> Required for site functionality</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Analytics Cookies:</strong> Help us understand how you use our site</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Preference Cookies:</strong> Remember your settings and preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Advertising Cookies:</strong> Show relevant ads (with your consent)</span>
                </li>
              </ul>
              <p className="text-gray-300">
                You can control cookie preferences through your browser settings. Note that disabling 
                certain cookies may affect site functionality.
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
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Questions About Privacy?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              If you have questions about our privacy practices or want to exercise your rights, 
              please contact our Data Protection Officer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.a
                href="mailto:privacy@filmyfire.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Email Privacy Officer
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all"
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
