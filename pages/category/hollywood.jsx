"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import HollywoodHeroSection from "../../components/category/hollywood/HollywoodHeroSection";
import HollywoodFilterBar from "../../components/category/hollywood/HollywoodFilterBar";
import HollywoodArticlesGrid from "../../components/category/hollywood/HollywoodArticlesGrid";

export async function getServerSideProps(context) {
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/articles/list?category=Hollywood&limit=20`);
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

export default function HollywoodPage({ initialArticles }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/articles/list?category=Hollywood&limit=20");
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
        <title>Hollywood Movies, Actors, Box Office & OTT Intelligence | FilmyFire</title>
        <meta name="description" content="Explore thousands of Hollywood movies, celebrity profiles, streaming releases, and box office insights updated daily." />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <HollywoodHeroSection />
        <HollywoodFilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <HollywoodArticlesGrid articles={filteredArticles} loading={loading} />
      </div>
    </>
  );
}

HollywoodPage.noPadding = true;
