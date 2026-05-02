import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { slugify } from "../../lib/slugify";
import { ArrowLeft, Clock, Eye, AlertCircle, RefreshCw, Monitor, Users, ChevronRight } from "lucide-react";

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
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-blue-500/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left group"
      >
        <span className="flex items-center gap-4 flex-grow">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm">
            Q{index + 1}
          </span>
          <span className="text-lg md:text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-relaxed">
            {question}
          </span>
        </span>
        <ChevronRight
          className={`w-6 h-6 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-90 text-blue-400' : ''
          }`}
        />
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-8 pt-2">
          <div className="pl-12 border-l-2 border-blue-500/30">
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IndustryInsightPage({ insight }) {
  const router = useRouter();
  
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

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white selection:bg-red-600/30 font-sans relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
            <Link href="/" className="ff-hover-text-primary transition-colors cursor-pointer hover:text-white font-medium">
              Home
            </Link>
            <span className="text-gray-600">&gt;</span>
            <Link href="/category/bollywood" className="ff-hover-text-primary transition-colors cursor-pointer hover:text-white font-medium">
              Bollywood
            </Link>
            <span className="text-gray-600">&gt;</span>
            <span className="text-zinc-300">{insight.title}</span>
          </nav>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-amber-500/10 p-4 rounded-xl flex-shrink-0">
                  <IconComponent className="w-8 h-8 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-zinc-800 px-3 py-1.5 rounded text-sm text-zinc-400 mb-3 font-medium tracking-wider">
                    {insight.category}
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
                    {insight.title}
                  </h1>
                  <div className="flex items-center gap-6 text-sm text-zinc-500">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {insight.readTime}
                    </span>
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Published: {new Date(insight.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                {insight.description}
              </p>
            </div>

            {insight.content && insight.content.length > 0 && (
              <div className="space-y-8 mb-12">
                {insight.content.map((section, index) => (
                  <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-zinc-100 mb-4">
                      {section.heading}
                    </h2>
                    <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {insight.faqs && insight.faqs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">Frequently Asked Questions</h2>
                {insight.faqs.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
