import CreateHero from "@/components/explore-cinema-intelligence/Hero";
import TrendingIntelligenceSection from "@/components/explore-cinema-intelligence/TrendingIntelligenceSection";
import MovieDNADiscovery from "@/components/explore-cinema-intelligence/MovieDNADiscovery";
import PopularTopicsSection from "@/components/explore-cinema-intelligence/PopularTopicsSection";
import CelebrityIntelligenceSection from "@/components/explore-cinema-intelligence/CelebrityIntelligenceSection";
import ExploreByPlatformSection from "@/components/explore-cinema-intelligence/ExploreByPlatformSection";
import FinalCTASection from "@/components/explore-cinema-intelligence/FinalCTASection";

export default function CreatePage() {
  return (
    <div className="bg-black min-h-screen">
      <CreateHero />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrendingIntelligenceSection />
        <MovieDNADiscovery />
        <PopularTopicsSection />
        <CelebrityIntelligenceSection />
        <ExploreByPlatformSection />
      </div>
      <FinalCTASection />
    </div>
  );
}

CreatePage.noPadding = true;
