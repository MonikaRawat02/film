import { ExternalLink } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useState } from "react";

export async function getServerSideProps(context) {
  const { req } = context;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/celebrities/top-10-richest`);
    const data = await res.json();

    if (!data.success) {
      return { props: { celebrities: [] } };
    }

    return {
      props: { celebrities: data.data },
    };
  } catch (error) {
    console.error("Failed to fetch top 10 richest celebrities:", error);
    return { props: { celebrities: [] } };
  }
}

export default function Top10RichestPage({ celebrities }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCelebrities = celebrities.filter((celebrity) =>
    celebrity.heroSection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 pt-0">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Top 10 Richest Celebrities
        </h1>
        <p className="text-base text-gray-400">
          A comprehensive ranking of the wealthiest individuals in the industry.
        </p>
      </div>

      <div className="w-full mb-8">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1A1A24] border border-gray-800 text-white placeholder-gray-500 rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626] transition-all"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {filteredCelebrities.map((celebrity, index) => (
          <a
            key={celebrity._id}
            href={`/celebrity/${celebrity.heroSection.slug}/profile`}
            className="group bg-[#1A1A24] border border-gray-800 rounded-xl overflow-hidden hover:border-[#DC2626] transition-all duration-300"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={celebrity.heroSection.profileImage || "/placeholder.jpg"}
                alt={celebrity.heroSection.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
                #{index + 1}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-base font-semibold text-white group-hover:text-[#DC2626] transition-colors truncate">
                  {celebrity.heroSection.name}
                </h4>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-lg font-bold text-[#F59E0B]">
                {celebrity.netWorth.netWorthUSD.display || `$${celebrity.netWorth.netWorthUSD.max}M`}
              </p>
            </div>
          </a>
        ))}
      </div>

      {filteredCelebrities.length === 0 && (
        <div className="text-center py-20 bg-[#1A1A24] rounded-xl border border-gray-800 border-dashed">
          <p className="text-gray-400">No celebrities match your search.</p>
        </div>
      )}
    </div>
  );
}

Top10RichestPage.noPadding = true;