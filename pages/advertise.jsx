"use client";
import { motion } from "framer-motion";
import { BarChart3, Users, Target, TrendingUp, Award, Zap } from "lucide-react";

export default function AdvertisePage() {
  const stats = [
    { value: "1M+", label: "Monthly Readers", icon: <Users className="w-5 h-5" /> },
    { value: "2.5M", label: "Page Views", icon: <BarChart3 className="w-5 h-5" /> },
    { value: "85%", label: "Engagement Rate", icon: <Target className="w-5 h-5" /> },
    { value: "40%", label: "YoY Growth", icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const packages = [
    {
      name: "Starter",
      price: "$499",
      period: "/month",
      description: "Perfect for emerging brands",
      features: [
        "Sidebar banner placement",
        "5,000 impressions guaranteed",
        "Basic analytics dashboard",
        "Email support",
        "1 ad creative rotation",
      ],
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$1,299",
      period: "/month",
      description: "Best for growing businesses",
      features: [
        "Header banner placement",
        "25,000 impressions guaranteed",
        "Advanced analytics & insights",
        "Priority support",
        "3 ad creative rotations",
        "A/B testing support",
        "Audience targeting options",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For maximum impact",
      features: [
        "Premium placements site-wide",
        "Unlimited impressions",
        "Custom campaign strategy",
        "Dedicated account manager",
        "Unlimited creative rotations",
        "Advanced audience segmentation",
        "Sponsored content opportunities",
        "Monthly performance reviews",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 mb-6 shadow-2xl shadow-red-500/50"
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6">
              Partner With Us
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Connect with over 1 million entertainment enthusiasts monthly. 
              Premium placements, engaged audience, measurable results.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <motion.a
                href="#packages"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                View Packages
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all"
              >
                Contact Sales
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-gray-800 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gray-900/50 border border-gray-800"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/20 text-red-500 mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Advertise With FilmyFire?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              We offer more than just ad space. We deliver results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Highly Engaged Audience",
                description: "Our readers are passionate entertainment fans who actively seek insights and analysis.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Precise Targeting",
                description: "Reach your ideal audience with advanced demographic and interest-based targeting.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Transparent Analytics",
                description: "Real-time campaign performance tracking with detailed metrics and insights.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Premium Brand Safety",
                description: "Your brand appears alongside high-quality, verified content in a safe environment.",
                color: "from-yellow-500 to-amber-500",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Fast Launch",
                description: "Get your campaign live within 48 hours with our streamlined onboarding process.",
                color: "from-red-500 to-orange-500",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Proven ROI",
                description: "Our advertisers see an average 3.5x return on investment within the first quarter.",
                color: "from-indigo-500 to-violet-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-red-500/50 transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section id="packages" className="py-20 md:py-32 bg-gradient-to-b from-black to-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Advertising Packages
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Flexible options designed for every budget and goal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10 }}
                className={`relative p-8 rounded-3xl ${
                  pkg.highlighted
                    ? "bg-gradient-to-b from-red-600/20 to-orange-600/20 border-2 border-red-600"
                    : "bg-gray-900/50 border border-gray-800"
                }`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-white">{pkg.price}</span>
                    <span className="text-gray-400 ml-2">{pkg.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/20 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-4 font-semibold rounded-xl transition-all ${
                    pkg.highlighted
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 p-12 text-center"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Grow Your Brand?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Let's create a custom advertising solution that drives results for your business.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex px-8 py-4 bg-white text-red-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Schedule a Consultation
              </motion.a>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
