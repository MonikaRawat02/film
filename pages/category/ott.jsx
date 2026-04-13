"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import CategoryHeroSection from "../../components/category/CategoryHeroSection";
import CategoryFilterBar from "../../components/category/CategoryFilterBar";
import CategoryArticlesGrid from "../../components/category/CategoryArticlesGrid";


export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=OTT&limit=20`);
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

export default function OTTPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=OTT&limit=20");
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
        <title>OTT Platform Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Streaming platform analytics, content strategy breakdowns, and subscriber growth intelligence." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <CategoryHeroSection category="OTT" />
        <CategoryFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} category="OTT" />
        <CategoryArticlesGrid category="OTT" articles={filteredArticles} loading={loading} />
      </div>
    </>
  );
}

OTTPage.noPadding = true;
