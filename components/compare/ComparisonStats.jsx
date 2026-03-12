"use client";
import { Users, TrendingUp } from "lucide-react";

export default function ComparisonStats({ celebrityA, celebrityB }) {
  const currentYear = new Date().getFullYear();

  const statsA = {
    name: celebrityA?.heroSection?.name || "Celebrity A",
    age: celebrityA?.quickFacts?.age || "N/A",
    careerDuration: celebrityA?.quickFacts?.activeSince ? `${currentYear - celebrityA.quickFacts.activeSince} years` : "N/A",
    totalFilms: celebrityA?.heroSection?.filmsCount || 0,
    awardsWon: celebrityA?.heroSection?.awardsCount || 0,
    brandEndorsements: celebrityA?.quickFacts?.brandEndorsements || 0,
  };

  const statsB = {
    name: celebrityB?.heroSection?.name || "Celebrity B",
    age: celebrityB?.quickFacts?.age || "N/A",
    careerDuration: celebrityB?.quickFacts?.activeSince ? `${currentYear - celebrityB.quickFacts.activeSince} years` : "N/A",
    totalFilms: celebrityB?.heroSection?.filmsCount || 0,
    awardsWon: celebrityB?.heroSection?.awardsCount || 0,
    brandEndorsements: celebrityB?.quickFacts?.brandEndorsements || 0,
  };

  const metrics = [
    { label: "Age", key: "age" },
    { label: "Career Duration", key: "careerDuration" },
    { label: "Total Films", key: "totalFilms" },
    { label: "Awards Won", key: "awardsWon" },
    { label: "Brand Endorsements", key: "brandEndorsements" },
  ];

  const renderStat = (value, isHigher) => (
    <td className="py-4 text-center">
      <span className={`inline-flex items-center justify-center gap-2 w-full ${isHigher ? "font-bold" : ""}`}>
        {value}
        {isHigher && <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />}
      </span>
    </td>
  );

  return (
    <section className="lg:px-8 py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-[#F59E0B]" />
          <h2 className="text-3xl font-semibold">Comparison Stats</h2>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white text-xl font-semibold mb-6">Quick Comparison Stats</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-4 text-left text-gray-400">Metric</th>
                  <th className="pb-4 px-4 text-center text-[#dc2626]">{statsA.name}</th>
                  <th className="pb-4 px-4 text-center text-[#3b82f6]">{statsB.name}</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {metrics.map((metric) => {
                  const valueA = statsA[metric.key];
                  const valueB = statsB[metric.key];
                  const isAHigher = typeof valueA === 'number' && typeof valueB === 'number' && valueA > valueB;
                  const isBHigher = typeof valueB === 'number' && typeof valueA === 'number' && valueB > valueA;

                  return (
                    <tr key={metric.label} className="border-t border-gray-800">
                      <td className="py-4">{metric.label}</td>
                      {renderStat(valueA, isAHigher)}
                      {renderStat(valueB, isBHigher)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
