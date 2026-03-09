import HeroSection from "@/components/HeroSection";
import WhyFilmyFire from "@/components/WhyFilmyFire";
import CelebritySection from "@/components/CelebritySection";
import TrendingSection from "@/components/TrendingSection";
import CategoryHubSection from "@/components/CategoryHubSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyFilmyFire />
      <TrendingSection />
      <CategoryHubSection />
      <CelebritySection />
    </>
  );
}
