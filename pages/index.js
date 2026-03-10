import HeroSection from "@/components/HeroSection";
import WhyFilmyFire from "@/components/WhyFilmyFire";
import CelebritySection from "@/components/CelebritySection";
import TrendingSection from "@/components/TrendingSection";
import CategoryHubSection from "@/components/CategoryHubSection";
import OurCommitment from "@/components/OurCommitment";
import InnovationRoadmap from "@/components/InnovationRoadmap";
import JoinCommunity from "@/components/JoinCommunity";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyFilmyFire />
      <TrendingSection />
      <CategoryHubSection />
      <CelebritySection />
      <OurCommitment />
      <InnovationRoadmap />
      <JoinCommunity />
    </>
  );
}
