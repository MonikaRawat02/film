"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import BollywoodHeroSection from "../../components/category/bollywood/BollywoodHeroSection";
import BollywoodFilterBar from "../../components/category/bollywood/BollywoodFilterBar";
import BollywoodArticlesGrid from "../../components/category/bollywood/BollywoodArticlesGrid";
import BollywoodMovieIntelligence from "../../components/category/bollywood/BollywoodMovieIntelligence";
import BollywoodBoxOfficeDashboard from "../../components/category/bollywood/BollywoodBoxOfficeDashboard";
import BollywoodOTTPerformance from "../../components/category/bollywood/BollywoodOTTPerformance";
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
    console.error("Error fetching articles in getServerSideProps:", error);
    return {
      props: {
        initialArticles: [],
      },
    };
  }
}

export default function BollywoodPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles || []);
  const [loading, setLoading] = useState(false);

  // Fetch data client-side if server-side didn't provide data
  useEffect(() => {
    if (!initialArticles || initialArticles.length === 0) {
      const fetchArticles = async () => {
        try {
          setLoading(true);
          const timestamp = Date.now();
          const res = await fetch(`/api/articles/list?category=Bollywood&limit=20&t=${timestamp}&cache=no-store`, {
            cache: 'no-store'
          });
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            setArticles(data.data);
          }
        } catch (error) {
          console.error("Error fetching articles:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchArticles();
    }
  }, [initialArticles]);

  const filteredArticles = activeFilter === "All" 
    ? articles 
    : articles.filter(article => {
        // For Explained filter - show all movie articles (most Bollywood articles are explainers)
        if (activeFilter === "Explained") return true; // Show all articles as movie explainers
        // For other filters - show all articles (they'll be handled by their dedicated components)
        if (activeFilter === "BoxOffice") return true;
        if (activeFilter === "OTT") return true;
        if (activeFilter === "Celebrity") return true;
        if (activeFilter === "Industry") return true;
        return true;
      });

  return (
    <>
      <Head>
        <title>Bollywood Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Deep analysis of Hindi cinema including movie explanations, box office truth, OTT insights, and celebrity career intelligence." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <BollywoodHeroSection />
        <BollywoodFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        
        {/* Show specialized dashboards based on active filter */}
        {activeFilter === "Explained" && (
          <BollywoodArticlesGrid articles={filteredArticles} loading={loading} filterType="Explained" />
        )}
        
        {activeFilter === "BoxOffice" && (
          <BollywoodBoxOfficeDashboard />
        )}
        
        {activeFilter === "OTT" && (
          <BollywoodOTTPerformance />
        )}
        
        {activeFilter === "Celebrity" && (
          <CelebrityIntelligenceHub industry="Bollywood" />
        )}
        
        {activeFilter === "Industry" && (
          <BollywoodIndustryInsights />
        )}
        
        {/* Show all sections when "All" filter is active */}
        {activeFilter === "All" && (
          <>
            <BollywoodArticlesGrid articles={filteredArticles} loading={loading} filterType="All" />
            <BollywoodMovieIntelligence />
            <BollywoodBoxOfficeDashboard />
            <CelebrityIntelligenceHub industry="Bollywood" />
            <BollywoodMovieDiscovery />
            <BollywoodTrendingTopics />
            <BollywoodIndustryInsights />
          </>
        )}
        
        <BollywoodExploreMore />
        <BollywoodFooterSection />
      </div>
    </>
  );
}

BollywoodPage.noPadding = true;
