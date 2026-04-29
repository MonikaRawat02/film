"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import BollywoodHeroSection from "../../components/category/bollywood/BollywoodHeroSection";
import BollywoodFilterBar from "../../components/category/bollywood/BollywoodFilterBar";
import BollywoodArticlesGrid from "../../components/category/bollywood/BollywoodArticlesGrid";
import BollywoodMovieIntelligence from "../../components/category/bollywood/BollywoodMovieIntelligence";
import BollywoodBoxOfficeDashboard from "../../components/category/bollywood/BollywoodBoxOfficeDashboard";
import CelebrityIntelligenceHub from "../../components/category/bollywood/CelebrityIntelligenceHub";
import BollywoodMovieDiscovery from "../../components/category/bollywood/BollywoodMovieDiscovery";
import BollywoodTrendingTopics from "../../components/category/bollywood/BollywoodTrendingTopics";
import BollywoodIndustryInsights from "../../components/category/bollywood/BollywoodIndustryInsights";
import BollywoodExploreMore from "../../components/category/bollywood/BollywoodExploreMore";
import BollywoodFooterSection from "../../components/category/bollywood/BollywoodFooterSection";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=Bollywood&limit=20`);
    const data = await res.json();

    return {
      props: {
        initialArticles: data.data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      props: {
        initialArticles: [],
      },
    };
  }
}

export default function BollywoodPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        // Build query based on active filter
        let url = "/api/public/unified-content?limit=50";
        
        if (activeFilter === "All") {
          // Fetch all Bollywood content
          url = "/api/articles/list?category=Bollywood&limit=50";
        } else if (activeFilter === "Explained") {
          // Fetch movie explainers (Bollywood, Hollywood, WebSeries articles)
          url = "/api/public/unified-content?filter=Explained&limit=50";
        } else if (activeFilter === "BoxOffice") {
          // Fetch box office content
          url = "/api/public/unified-content?filter=BoxOffice&limit=50";
        } else if (activeFilter === "OTT") {
          // Fetch OTT content
          url = "/api/public/unified-content?filter=OTT&limit=50";
        } else if (activeFilter === "Celebrity") {
          // Fetch celebrity content
          url = "/api/public/unified-content?filter=Celebrity&limit=50";
        } else if (activeFilter === "Industry") {
          // Fetch industry insights (BoxOffice category articles)
          url = "/api/public/unified-content?filter=Industry&limit=50";
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success && data.data) {
          // For unified-content API, data might be array or object
          const articlesData = Array.isArray(data.data) ? data.data : 
                               data.data.articles || data.data.explained || [];
          setArticles(articlesData);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [activeFilter]);

  // No client-side filtering needed - API returns filtered data
  const filteredArticles = articles;

  return (
    <>
      <Head>
        <title>Bollywood Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Deep analysis of Hindi cinema including movie explanations, box office truth, OTT insights, and celebrity career intelligence." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <BollywoodHeroSection />
        <BollywoodFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} loading={loading} />
        <BollywoodArticlesGrid articles={filteredArticles} loading={loading} activeFilter={activeFilter} />
        <BollywoodMovieIntelligence />
        <BollywoodBoxOfficeDashboard />
        <CelebrityIntelligenceHub industry="Bollywood" />
        <BollywoodMovieDiscovery />
        <BollywoodTrendingTopics />
        <BollywoodIndustryInsights />
        <BollywoodExploreMore />
        <BollywoodFooterSection />
      </div>
    </>
  );
}

BollywoodPage.noPadding = true;
