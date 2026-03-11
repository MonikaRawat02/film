"use client";
import { DollarSign } from "lucide-react";

function NetWorthCard({ celebrity, netWorth, currency = "USD" }) {
  const name = celebrity?.name || "Unknown";
  const image = celebrity?.image || "/placeholder.jpg";
  const profession = celebrity?.profession || "Actor, Producer";
  
  // Format net worth based on currency
  const displayNetWorth = netWorth || (currency === "USD" ? "$730M" : "₹6,000Cr");
  
  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-[#3B82F6] transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/20">
      {/* Header with image and name */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <div className="text-white text-xl font-semibold">{name}</div>
          <div className="text-gray-400">{profession}</div>
        </div>
      </div>

      {/* Net Worth */}
      <div className="mb-4">
        <div className="text-gray-400 text-sm mb-1">Estimated Net Worth</div>
        <div className="text-4xl font-bold text-[#F59E0B]">{displayNetWorth}</div>
      </div>

      {/* Peak Career Badge */}
      <div className="mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-800/50">
          Peak Career
        </span>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 border-t border-gray-800 pt-4">
        Last updated: March 2026 • Source: Multiple verified sources
      </div>
    </div>
  );
}

export default function CompareNetWorthSection({ celebrityA, celebrityB, currency = "USD" }) {
  return (
    <section className="lg:px-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-[#F59E0B]" />
          <h2 className="text-3xl">Net Worth Estimate</h2>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <NetWorthCard 
            celebrity={celebrityA} 
            netWorth={celebrityA?.netWorth}
            currency={currency}
          />
          <NetWorthCard 
            celebrity={celebrityB} 
            netWorth={celebrityB?.netWorth}
            currency={currency}
          />
        </div>
      </div>
    </section>
  );
}
