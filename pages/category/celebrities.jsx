"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import CelebritiesHeroSection from "../../components/category/celebrities/CelebritiesHeroSection";
import CelebritiesFilterBar from "../../components/category/celebrities/CelebritiesFilterBar";
import CelebritiesArticlesGrid from "../../components/category/celebrities/CelebritiesArticlesGrid";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=Celebrities&limit=20`);
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

export default function CelebritiesPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=Celebrities&limit=20");
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
        <title>Celebrity Intelligence Hub | FilmyFire</title>
        <meta name="description" content="Career analytics, net worth breakdowns, filmography analysis, and brand endorsement intelligence." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <CelebritiesHeroSection />
        <CelebritiesFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <CelebritiesArticlesGrid articles={filteredArticles} loading={loading} />
      </div>
    </>
  );
}

CelebritiesPage.noPadding = true;
