import HeroSection from "@/components/HeroSection";
import WhyFilmyFire from "@/components/WhyFilmyFire";
import CelebritySection from "@/components/CelebritySection";
import TrendingSection from "@/components/TrendingSection";
import CategoryHubSection from "@/components/CategoryHubSection";
import GuidesSection from "@/components/GuidesSection";
import OurCommitment from "@/components/OurCommitment";
import InnovationRoadmap from "@/components/InnovationRoadmap";
import JoinCommunity from "@/components/JoinCommunity";
import InsightsDuoSection from "@/components/InsightsDuoSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyFilmyFire />
      <TrendingSection />
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
