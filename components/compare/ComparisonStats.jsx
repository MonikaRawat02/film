"use client";
import { Users, TrendingUp } from "lucide-react";

export default function ComparisonStats() {
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
                  <th className="pb-4 px-4 text-center text-[#dc2626]">Shah Rukh Khan</th>
                  <th className="pb-4 px-4 text-center text-[#3b82f6]">Tom Cruise</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-t border-gray-800">
                  <td className="py-4">Age</td>
                  <td className="py-4 text-center">60</td>
                  <td className="py-4 text-center">63</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="py-4">Career Duration</td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">35 years</div>
                  </td>
                  <td className="py-4 text-center">43 years</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="py-4">Total Films</td>
                  <td className="py-4">
                    <span className="inline-flex items-center justify-center gap-2 w-full">
                      105 <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </span>
                  </td>
                  <td className="py-4 text-center">54</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="py-4">Awards Won</td>
                  <td className="py-4">
                    <span className="inline-flex items-center justify-center gap-2 w-full">
                      280 <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </span>
                  </td>
                  <td className="py-4 text-center">95</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="py-4">Brand Endorsements</td>
                  <td className="py-4">
                    <span className="inline-flex items-center justify-center gap-2 w-full">
                      45 <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </span>
                  </td>
                  <td className="py-4 text-center">18</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
