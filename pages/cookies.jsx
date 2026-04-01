"use client";
import { motion } from "framer-motion";
import { Cookie, Settings, Shield, CheckCircle, XCircle, BarChart3 } from "lucide-react";

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      name: "Essential Cookies",
      purpose: "Required for Operation",
      description: "These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas. Without these cookies, the website cannot function correctly.",
      canDisable: false,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      name: "Analytics Cookies",
      purpose: "Performance Monitoring",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve site functionality and user experience.",
      canDisable: true,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      name: "Preference Cookies",
      purpose: "Personalization",
      description: "These cookies remember your choices (such as your user name, language, or region) to provide enhanced, personalized features. They may be set by us or by third-party providers.",
      canDisable: true,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      name: "Advertising Cookies",
      purpose: "Targeted Content",
      description: "These cookies may be set through our site by advertising partners to build a profile of your interests and show relevant ads on other sites. They work by uniquely identifying your browser and device.",
      canDisable: true,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const thirdPartyCookies = [
    {
      provider: "Google Analytics",
      purpose: "Website analytics and traffic measurement",
      policy: "https://policies.google.com/privacy",
    },
    {
      provider: "Cloudflare",
      purpose: "Security and performance optimization",
      policy: "https://www.cloudflare.com/privacypolicy/",
    },
    {
      provider: "Social Media Platforms",
      purpose: "Content sharing and social integration",
      policy: "Varies by platform",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated cookie pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cookie-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="15" fill="#f97316" />
                <circle cx="35" cy="35" r="3" fill="#fff" />
                <circle cx="45" cy="38" r="3" fill="#fff" />
                <circle cx="38" cy="48" r="3" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cookie-pattern)" />
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 mb-6 shadow-2xl shadow-orange-500/50"
            >
              <Cookie className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-6">
              Cookie Policy
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              We use cookies to enhance your browsing experience, analyze site traffic, 
              and personalize content. Here's what you need to know.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/20 border border-orange-600/30">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-400">Transparent Usage</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-600/30">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-400">Your Control</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Are Cookies */}
      <section className="py-20 border-y border-gray-800 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <Cookie className="w-16 h-16 text-orange-500 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What Are Cookies?
              </h2>
            </div>
            
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <p className="text-gray-300 leading-relaxed mb-6">
                Cookies are small text files that websites store on your device (computer, smartphone, or tablet) 
                when you visit them. They're widely used to make websites work more efficiently and provide 
                information to the site owners.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Cookies do lots of different jobs, like letting you navigate between pages efficiently, 
                remembering your preferences, and generally improving your browsing experience. They can 
                also help ensure that advertisements you see online are more relevant to you and your interests.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">First-Party Cookies</h4>
                    <p className="text-sm text-gray-400">Set directly by FilmyFire</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Third-Party Cookies</h4>
                    <p className="text-sm text-gray-400">Set by external service providers</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Types of Cookies We Use */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Types of Cookies We Use
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Understanding the different cookies and their purposes
            </p>
          </motion.div>

          <div className="space-y-8 max-w-5xl mx-auto">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    {cookie.icon}
                  </div>
                  <div className="flex-1 p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">
                        {cookie.name}
                      </h3>
                      <div className={`px-4 py-2 rounded-full text-xs font-semibold ${
                        cookie.canDisable 
                          ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                          : "bg-red-600/20 text-red-400 border border-red-600/30"
                      }`}>
                        {cookie.canDisable ? "Can Disable" : "Required"}
                      </div>
                    </div>
                    <p className="text-orange-400 font-medium mb-3">{cookie.purpose}</p>
                    <p className="text-gray-400 leading-relaxed">
                      {cookie.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Third-Party Cookies */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Third-Party Cookies
            </h2>
            
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <p className="text-gray-300 mb-8 leading-relaxed">
                In addition to our own cookies, we also use cookies from trusted third-party services 
                to enhance our website functionality:
              </p>
              
              <div className="space-y-6">
                {thirdPartyCookies.map((item, index) => (
                  <div key={index} className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {item.provider}
                    </h4>
                    <p className="text-gray-400 mb-3">{item.purpose}</p>
                    <a 
                      href={item.policy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center gap-1"
                    >
                      View Privacy Policy →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Managing Cookie Preferences */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Browser Settings */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <Settings className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Browser Controls
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Most web browsers allow some control of most cookies through the browser settings. 
                You can set your browser to refuse all or some browser cookies, or to alert you when 
                websites set or access cookies.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Disable all cookies (not recommended)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Allow only essential cookies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Enable cookies on a case-by-case basis</span>
                </li>
              </ul>
            </div>

            {/* Impact of Disabling */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Important Notice
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                If you disable or refuse cookies, please note that some parts of this site may become 
                inaccessible or not function properly. Essential features like user authentication, 
                security, and site navigation require cookies.
              </p>
              <div className="p-4 rounded-xl bg-amber-600/20 border border-amber-600/30">
                <p className="text-sm text-amber-300">
                  <strong>Recommendation:</strong> Keep essential cookies enabled for the best 
                  browsing experience. You can disable analytics and advertising cookies if preferred.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Updates to Policy */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Cookie className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Questions About Cookies?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              If you have questions about our use of cookies or want to learn more about how to 
              manage your cookie preferences, please contact us.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
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

// Helper component for the warning icon
function AlertTriangle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
