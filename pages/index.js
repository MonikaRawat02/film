import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import WhyFilmyFire from "@/components/WhyFilmyFire";
import CelebritySection from "@/components/CelebritySection";
import CategoryHubSection from "@/components/CategoryHubSection";
import GuidesSection from "@/components/GuidesSection";
import OurCommitment from "@/components/OurCommitment";
import InnovationRoadmap from "@/components/InnovationRoadmap";
import JoinCommunity from "@/components/JoinCommunity";
import InsightsDuoSection from "@/components/InsightsDuoSection";

export async function getStaticProps() {
  try {
    // Fetch unified homepage data at build time
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/homepage-unified`);
    const data = await res.json();

    return {
      props: {
        unifiedData: data.success ? data.data : null,
      },
      revalidate: 60, // Revalidate every 60 seconds (ISR)
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      props: {
        unifiedData: null,
      },
      revalidate: 60,
    };
  }
}

export default function Home({ unifiedData }) {
  useEffect(() => {
    // Record unique visit
    fetch("/api/public/record-visit", { method: "POST" }).catch(err => console.error("Visit recording failed", err));
  }, []);

  return (
    <>
      <HeroSection />
      <WhyFilmyFire />
      <CategoryHubSection unifiedData={unifiedData} />
      <GuidesSection unifiedData={unifiedData} />
      <InsightsDuoSection unifiedData={unifiedData} />
      <CelebritySection unifiedData={unifiedData} />
      <OurCommitment />
      <InnovationRoadmap />
      <JoinCommunity />
    </>
  );
}

Home.noPadding = true;
