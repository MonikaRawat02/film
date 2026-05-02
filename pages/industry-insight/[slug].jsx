import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, useScroll, useSpring } from "framer-motion";
import { slugify } from "../../lib/slugify";
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  AlertCircle, 
  RefreshCw, 
  Monitor, 
  Users, 
  ChevronRight, 
  Calendar,
  User,
  Hash,
  MessageCircle,
  Share2,
  Bookmark
} from "lucide-react";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/industry-insights/get-by-slug?slug=${encodeURIComponent(slug)}`);
    
    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();

    if (!data || !data.data) {
      return { notFound: true };
    }

    const insight = data.data;

    return {
      props: {
        insight,
      },
    };
  } catch (error) {
    console.error("Error fetching industry insight:", error);
    return { notFound: true };
  }
}

const IconMap = {
  AlertCircle,
  RefreshCw,
  Monitor,
  Users
};

function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-white/5 bg-[#121826]/50 overflow-hidden transition-all duration-300 hover:border-amber-500/20 group"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
      >
        <span className="flex items-center gap-4 flex-grow">
          <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors duration-300 ${isOpen ? 'bg-amber-500 text-black' : 'bg-white/5 text-amber-500'}`}>
            {index + 1}
          </span>
          <span className={`text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
            {question}
          </span>
        </span>
        <div className={`p-2 rounded-lg transition-all duration-300 ${isOpen ? 'bg-amber-500/10 rotate-180' : 'bg-white/5 group-hover:bg-white/10'}`}>
          <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-amber-500' : 'text-zinc-500'}`} />
        </div>
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-0">
          <div className="pl-14 border-l border-amber-500/20">
            <p className="text-zinc-400 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function IndustryInsightPage({ insight }) {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const IconComponent = IconMap[insight.icon] || AlertCircle;

  const structuredSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { 
            "@type": "ListItem", 
            "position": 1, 
            "name": "Home", 
            "item": "https://filmyfire.com" 
          },
          { 
            "@type": "ListItem", 
            "position": 2, 
            "name": "Industry Insights", 
            "item": "https://filmyfire.com/category/bollywood" 
          },
          { 
            "@type": "ListItem", 
            "position": 3, 
            "name": insight.title, 
            "item": `https://filmyfire.com/industry-insight/${insight.slug}` 
          }
        ]
      },
      {
        "@type": "Article",
        "headline": insight.title,
        "description": insight.description,
        "author": { "@type": "Organization", "name": insight.author },
        "datePublished": insight.publishedAt,
        "publisher": { "@type": "Organization", "name": "FilmyFire Intelligence" }
      }
    ]
  };

  return (
    <>
      <Head>
        <title>{`${insight.title} | FilmyFire Intelligence`}</title>
        <meta name="description" content={insight.description} />
        <link rel="canonical" href={`https://filmyfire.com/industry-insight/${insight.slug}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </Head>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      <div className="min-h-screen bg-[#07090F] text-white selection:bg-amber-500/30 font-sans relative overflow-x-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[100vh] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
          
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-12">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-zinc-500 hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              <Link href="/category/bollywood" className="text-zinc-500 hover:text-white transition-colors">Bollywood</Link>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              <span className="text-amber-500 font-medium truncate max-w-[150px] sm:max-w-none">{insight.title}</span>
            </nav>
            
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            
            {/* Main Content Area */}
            <main>
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-widest uppercase">
                      {insight.category}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {insight.readTime}
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                    {insight.title}
                  </h1>

                  <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed font-light italic">
                    {insight.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Author</p>
                        <p className="text-sm font-bold text-zinc-200">{insight.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Published</p>
                        <p className="text-sm font-bold text-zinc-200">
                          {new Date(insight.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dynamic Content Sections */}
              <div className="space-y-16 mb-20">
                {insight.content && insight.content.map((section, index) => (
                  <motion.section 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    id={slugify(section.heading)}
                    className="group"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-amber-500/30 transition-all duration-500" />
                      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        {section.heading}
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-amber-500/30 transition-all duration-500" />
                    </div>
                    
                    <div className="bg-[#121826]/30 border border-white/5 rounded-3xl p-8 md:p-10 hover:bg-[#121826]/50 transition-colors duration-500 group/content">
                      <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light whitespace-pre-wrap group-hover/content:text-zinc-300 transition-colors">
                        {section.content}
                      </p>
                    </div>
                  </motion.section>
                ))}
              </div>

              {/* FAQs Section */}
              {insight.faqs && insight.faqs.length > 0 && (
                <motion.section
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-24 pt-16 border-t border-white/5"
                >
                  <div className="flex items-center gap-3 mb-10">
                    <MessageCircle className="w-8 h-8 text-amber-500" />
                    <h2 className="text-3xl md:text-4xl font-black text-white">Deep Dive Q&A</h2>
                  </div>
                  <div className="grid gap-4">
                    {insight.faqs.map((faq, index) => (
                      <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
                    ))}
                  </div>
                </motion.section>
              )}
            </main>

            {/* Sticky Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                
                {/* Table of Contents */}
                <div className="bg-[#121826]/50 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-amber-500" />
                    Analysis Overview
                  </h3>
                  <nav className="space-y-3">
                    {insight.content && insight.content.map((section, idx) => (
                      <a 
                        key={idx}
                        href={`#${slugify(section.heading)}`}
                        className="block text-sm text-zinc-400 hover:text-amber-500 transition-colors line-clamp-1 border-l-2 border-transparent hover:border-amber-500 pl-4 py-1"
                      >
                        {section.heading}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Related Topics */}
                {insight.relatedTopics && insight.relatedTopics.length > 0 && (
                  <div className="bg-[#121826]/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      Key Insights
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {insight.relatedTopics.map((topic, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:border-amber-500/30 hover:text-amber-500 transition-all cursor-default"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Section */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                  <Share2 className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                  <h4 className="text-white font-bold mb-2">Share this Intelligence</h4>
                  <p className="text-xs text-zinc-400 mb-6">Spread the data-driven insights with your network.</p>
                  <div className="flex items-center justify-center gap-3">
                    {['Twitter', 'LinkedIn', 'WhatsApp'].map(platform => (
                      <button key={platform} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all">
                        <span className="sr-only">{platform}</span>
                        <div className="w-4 h-4" /> {/* Placeholder for social icons */}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </div>

        {/* Footer Author Bio */}
        <footer className="bg-[#0A0E17] border-t border-white/5 py-16 mt-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <IconComponent className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">FilmyFire Intelligence</h3>
            <p className="text-zinc-400 leading-relaxed mb-8">
              Our industry analysis is powered by proprietary data tracking over 500+ Bollywood projects, 2000+ celebrity profiles, and real-time box office performance metrics. We aim to provide the most accurate and deep insights into the Indian entertainment landscape.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/category/bollywood" className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all text-sm">
                Explore More Insights
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

