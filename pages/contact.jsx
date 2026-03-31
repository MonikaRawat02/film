"use client";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Phone, Send, Clock, Heart } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      value: "contact@filmyfire.com",
      description: "We'll respond within 24-48 hours",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      value: "Available 9 AM - 6 PM IST",
      description: "Get instant answers to your questions",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Office",
      value: "Dubai",
      description: "By appointment only",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 mb-6 shadow-xl"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6">
              Get In Touch
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Have questions, feedback, or partnership inquiries? 
              We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods Cards */}
      <section className="py-20 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-red-500/50 transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${method.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{method.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-red-400 font-medium mb-2">{method.value}</p>
                <p className="text-gray-400 text-sm">{method.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form & Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800">
                <h2 className="text-3xl font-bold text-white mb-2">Send a Message</h2>
                <p className="text-gray-400 mb-8">Fill out the form below and we'll get back to you.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
                      placeholder="Your message..."
                      required
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Let's Start a Conversation
                </h2>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Whether you have a question about our content, want to report an issue, 
                  or are interested in partnerships, we're here to help.
                </p>
                
                <div className="space-y-6 mb-12">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="text-white font-semibold mb-1">Response Time</h3>
                      <p className="text-gray-400">
                        We typically respond within 24-48 hours during business days.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="text-white font-semibold mb-1">For Press Inquiries</h3>
                      <p className="text-gray-400">
                        Media professionals can reach us at press@filmyfire.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-8 rounded-3xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-600/30"
              >
                <MessageSquare className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-xl text-white font-medium mb-2">
                  "Great things happen when great minds connect."
                </p>
                <p className="text-gray-400">- FilmyFire Team</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/50 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Quick Answers
            </h2>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
              Find answers to commonly asked questions
            </p>
            <motion.a
              href="/faq"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              View All FAQs
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
