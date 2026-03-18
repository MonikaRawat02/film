"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, DollarSign, User, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RichestActorsModal({ isOpen, onClose }) {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchRichest = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/public/richest-celebrities");
          const json = await res.json();
          if (json.success) {
            setCelebrities(json.data);
          }
        } catch (error) {
          console.error("Error fetching richest celebrities:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRichest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#121826] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#1a2234]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Richest Celebrities</h2>
              <p className="text-xs text-gray-400">Based on verified net worth analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-gray-400 text-sm">Calculating net worth rankings...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {celebrities.map((celeb, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.08] transition-all duration-300"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Image */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                    {celeb.image ? (
                      <img 
                        src={celeb.image} 
                        alt={celeb.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-bold truncate group-hover:text-cyan-400 transition-colors">
                      {celeb.name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">{celeb.profession}</p>
                  </div>

                  {/* Net Worth */}
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-sm sm:text-base">
                      {celeb.netWorth}
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Net Worth</p>
                  </div>

                  {/* Link */}
                  {celeb.slug && (
                    <Link 
                      href={`/celebrity/${celeb.slug}/profile`}
                      className="p-2 text-gray-500 hover:text-cyan-400 transition-colors"
                      onClick={onClose}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#1a2234] border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
            Updated Daily • FilmyFire Intelligence Platform
          </p>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
