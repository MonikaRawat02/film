"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import BollywoodHeroSection from "../../components/category/bollywood/BollywoodHeroSection";
import BollywoodFilterBar from "../../components/category/bollywood/BollywoodFilterBar";
import BollywoodArticlesGrid from "../../components/category/bollywood/BollywoodArticlesGrid";
import BollywoodMovieIntelligence from "../../components/category/bollywood/BollywoodMovieIntelligence";
import BollywoodBoxOfficeDashboard from "../../components/category/bollywood/BollywoodBoxOfficeDashboard";
import CelebrityIntelligenceHub from "../../components/category/bollywood/CelebrityIntelligenceHub";

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
        const res = await fetch("/api/articles/list?category=Bollywood&limit=20");
        const data = await res.json();
        if (data.data) {
          setArticles(data.data);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = activeFilter === "All" 
    ? articles 
    : articles.filter(article => article.category === activeFilter);

  return (
    <>
      <Head>
        <title>Bollywood Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Deep analysis of Hindi cinema including movie explanations, box office truth, OTT insights, and celebrity career intelligence." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <BollywoodHeroSection />
        <BollywoodFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <BollywoodArticlesGrid articles={filteredArticles} loading={loading} />
        <BollywoodMovieIntelligence />
        <BollywoodBoxOfficeDashboard />
        <CelebrityIntelligenceHub />
      </div>
    </>
  );
}

BollywoodPage.noPadding = true;
