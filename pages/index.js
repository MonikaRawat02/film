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

export default function Home() {
  useEffect(() => {
    // Record unique visit
    fetch("/api/public/record-visit", { method: "POST" }).catch(err => console.error("Visit recording failed", err));
  }, []);

  return (
    <>
      <HeroSection />
      <WhyFilmyFire />
      <CategoryHubSection />
      <GuidesSection />
      <InsightsDuoSection />
      <CelebritySection />
      <OurCommitment />
      <InnovationRoadmap />
      <JoinCommunity />
    </>
  );
}

Home.noPadding = true;
