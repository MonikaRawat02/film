"use client";

import Head from "next/head";
import ErrorState from "../../components/common/ErrorState";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/admin/celebrity/getCelebrity?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) {
      return { props: { notFound: true, slug } };
    }
    const data = await res.json();
    if (!data?.data) {
      return { props: { notFound: true, slug } };
    }
    return { props: { celebrity: data.data, slug, notFound: false } };
  } catch (e) {
    return { props: { notFound: true, slug } };
  }
}

export default function CelebrityPage({ celebrity, slug, notFound }) {
  if (notFound || !celebrity) {
    return (
      <>
        <Head>
          <title>Celebrity Profile | FilmyFire</title>
          <meta name="description" content="Explore verified celebrity profiles, filmography, and net worth intelligence." />
        </Head>
        <ErrorState type="celebrity" />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{celebrity?.heroSection?.name} – Celebrity Intelligence | FilmyFire</title>
        <meta name="description" content={`Explore verified profile, filmography and intelligence for ${celebrity?.heroSection?.name}.`} />
      </Head>
      <div className="min-h-screen bg-[#050505] text-zinc-100 pt-24 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              {celebrity?.heroSection?.profileImage ? (
                <img src={celebrity.heroSection.profileImage} alt={celebrity.heroSection.name} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{celebrity?.heroSection?.name}</h1>
              <p className="text-zinc-400 text-sm mt-1">{(celebrity?.heroSection?.profession || []).join(", ")}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-zinc-300 leading-relaxed">
              Detailed celebrity intelligence pages are being rolled out. Meanwhile, browse complete celebrity listings and trending profiles from our hub.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

