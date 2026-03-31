"use client";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Shield, Zap, Users, Target } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Data-Driven Insights",
      description: "We analyze box office trends, OTT performance, and celebrity trajectories using advanced analytics.",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Verified Information",
      description: "Every piece of data is cross-verified from multiple reliable sources before publication.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-Time Updates",
      description: "Stay ahead with instant updates on the latest developments in the entertainment industry.",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Analysis",
      description: "Our team of industry experts provides deep insights beyond surface-level news.",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const stats = [
    { value: "10K+", label: "Celebrity Profiles" },
    { value: "50K+", label: "Articles Published" },
    { value: "1M+", label: "Monthly Readers" },
    { value: "99%", label: "Accuracy Rate" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              animate={{
                y: [null, Math.random() * -200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 mb-6 shadow-2xl shadow-red-500/50"
            >
              <Flame className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6">
              About FilmyFire
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Your ultimate source for movie and web series intelligence. 
              We go beyond breaking news to deliver deep, data-driven analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-800 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto">
              To provide the most comprehensive, accurate, and insightful analysis of the entertainment industry,
              empowering fans and professionals with intelligence that matters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-red-500/50 transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
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

      {/* Story Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Our Story
            </h2>
            <div className="space-y-6 text-lg md:text-xl text-gray-300 max-w-4xl">
              <p>
                FilmyFire was born from a simple observation: there was too much noise and not enough signal in entertainment journalism.
              </p>
              <p>
                Founded in 2024, we set out to change the narrative. Instead of chasing clicks with sensational headlines, 
                we committed to delivering substantive, data-backed intelligence that helps our audience truly understand 
                the entertainment industry.
              </p>
              <p>
                Today, FilmyFire has grown into a trusted platform serving over a million readers monthly, 
                providing insights on box office trends, OTT performance, celebrity net worth analysis, 
                and the business dynamics shaping the content we love.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Our Core Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: "Accuracy First",
                description: "We verify every fact, cross-reference every source, and correct errors transparently.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "No Piracy",
                description: "We strictly oppose piracy and only share information available through legal channels.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Community Driven",
                description: "Our insights come from understanding what matters to our community of readers.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
              >
                <div className="inline-flex p-3 rounded-full bg-red-600/20 text-red-500 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-400">{value.description}</p>
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
                Join Our Community
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Stay informed with the latest intelligence from the entertainment industry.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-red-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started
              </motion.button>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
