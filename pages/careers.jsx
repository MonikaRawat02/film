"use client";
import { motion } from "framer-motion";
import { Briefcase, Rocket, Heart, Users, Lightbulb, Trophy } from "lucide-react";

export default function CareersPage() {
  const values = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Innovation First",
      description: "We're building the future of entertainment journalism. Your ideas matter here.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion Driven",
      description: "We love what we do. If you're passionate about entertainment and tech, you'll thrive here.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative",
      description: "Great things happen when great minds work together. We're a team, not just colleagues.",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Excellence",
      description: "We set high standards and support each other to reach them. Excellence is our baseline.",
    },
  ];

  const perks = [
    {
      title: "Competitive Salary",
      description: "Top-tier compensation packages with performance bonuses",
      icon: "💰",
    },
    {
      title: "Remote Flexibility",
      description: "Work from anywhere with flexible hours",
      icon: "🏠",
    },
    {
      title: "Health & Wellness",
      description: "Comprehensive health insurance for you and your family",
      icon: "🏥",
    },
    {
      title: "Learning Budget",
      description: "Annual stipend for courses, conferences, and skill development",
      icon: "📚",
    },
    {
      title: "Unlimited PTO",
      description: "Take the time you need to rest and recharge",
      icon: "🏖️",
    },
    {
      title: "Latest Tech",
      description: "MacBook Pro, monitor, and all the tools you need",
      icon: "💻",
    },
    {
      title: "Team Retreats",
      description: "Quarterly team meetups in exciting locations",
      icon: "✈️",
    },
    {
      title: "Stock Options",
      description: "Share in the company's success as an early team member",
      icon: "📈",
    },
  ];

  const openings = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Data Analyst - Entertainment Intelligence",
      department: "Analytics",
      location: "Mumbai / Remote",
      type: "Full-time",
    },
    {
      title: "Content Strategist",
      department: "Editorial",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "UI/UX Designer",
      department: "Design",
      location: "Remote",
      type: "Contract",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                opacity: 0,
              }}
              animate={{
                y: -20,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
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
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 mb-6 shadow-2xl shadow-red-500/50"
            >
              <Briefcase className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6">
              Join Our Team
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Help us revolutionize entertainment intelligence. 
              Build products used by millions. Make an impact.
            </p>

            <motion.a
              href="#openings"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              View Open Positions
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-black border-y border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-red-500/50 transition-all"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-white">{value.icon}</div>
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

      {/* Why Join Us */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Work at FilmyFire?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              We take care of our team so they can do their best work
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 text-center hover:border-red-500/50 transition-all"
              >
                <div className="text-5xl mb-4">{perk.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {perk.title}
                </h3>
                <p className="text-sm text-gray-400">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-20 md:py-32 bg-gradient-to-b from-black to-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Lightbulb className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Find your perfect role on our team
            </p>
          </motion.div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {openings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="group p-6 md:p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-red-500/50 transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        📍 {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        ⏰ {job.type}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Apply Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No matching positions CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-lg text-gray-300 mb-6">
              Don't see a role that fits your skills?
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all"
            >
              Send Us Your Resume
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
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
                Ready to Make an Impact?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join a team that's passionate about transforming entertainment intelligence. 
                We can't wait to hear from you.
              </p>
              <motion.a
                href="#openings"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex px-8 py-4 bg-white text-red-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Browse All Positions
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
