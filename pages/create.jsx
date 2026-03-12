import CreateHero from "@/components/create/Hero";
import TrendingIntelligenceSection from "@/components/create/TrendingIntelligenceSection";
import MovieDNADiscovery from "@/components/create/MovieDNADiscovery";
import PopularTopicsSection from "@/components/create/PopularTopicsSection";
import FinalCTASection from "@/components/create/FinalCTASection";

export default function CreatePage() {
  return (
    <div className="bg-black min-h-screen">
      <CreateHero />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrendingIntelligenceSection />
        <MovieDNADiscovery />
        <PopularTopicsSection />
      </div>
      <FinalCTASection />
    </div>
  );
}
