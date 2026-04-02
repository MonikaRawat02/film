/**
 * OTT Platform Badges Component
 * Reusable clickable badges for streaming platforms
 */

import Link from "next/link";
import { Play, ExternalLink } from "lucide-react";

// Platform configurations with colors and logos
const PLATFORM_CONFIG = {
  'Netflix': { 
    color: '#E50914', 
    bgColor: 'bg-red-600',
    hoverBg: 'hover:bg-red-700',
    slug: 'netflix',
    icon: '🔴'
  },
  'Amazon Prime': { 
    color: '#00A8E1', 
    bgColor: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-600',
    slug: 'amazon-prime',
    icon: '🔵'
  },
  'Amazon Prime Video': { 
    color: '#00A8E1', 
    bgColor: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-600',
    slug: 'amazon-prime',
    icon: '🔵'
  },
  'Prime Video': { 
    color: '#00A8E1', 
    bgColor: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-600',
    slug: 'amazon-prime',
    icon: '🔵'
  },
  'Disney+': { 
    color: '#113CCF', 
    bgColor: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    slug: 'disney-plus',
    icon: '✨'
  },
  'Disney+ Hotstar': { 
    color: '#113CCF', 
    bgColor: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    slug: 'disney-plus-hotstar',
    icon: '✨'
  },
  'Hotstar': { 
    color: '#113CCF', 
    bgColor: 'bg-indigo-600',
    hoverBg: 'hover:bg-indigo-700',
    slug: 'hotstar',
    icon: '⭐'
  },
  'ZEE5': { 
    color: '#8B008B', 
    bgColor: 'bg-purple-600',
    hoverBg: 'hover:bg-purple-700',
    slug: 'zee5',
    icon: '🟣'
  },
  'JioCinema': { 
    color: '#0066FF', 
    bgColor: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    slug: 'jiocinema',
    icon: '💙'
  },
  'SonyLIV': { 
    color: '#000000', 
    bgColor: 'bg-zinc-800',
    hoverBg: 'hover:bg-zinc-700',
    slug: 'sonyliv',
    icon: '📺'
  },
  'HBO Max': { 
    color: '#5822B4', 
    bgColor: 'bg-purple-700',
    hoverBg: 'hover:bg-purple-800',
    slug: 'hbo-max',
    icon: '🟪'
  },
  'Max': { 
    color: '#002BE7', 
    bgColor: 'bg-blue-700',
    hoverBg: 'hover:bg-blue-800',
    slug: 'max',
    icon: '🔷'
  },
  'Apple TV+': { 
    color: '#000000', 
    bgColor: 'bg-zinc-900',
    hoverBg: 'hover:bg-zinc-800',
    slug: 'apple-tv-plus',
    icon: '🍎'
  },
  'Peacock': { 
    color: '#000000', 
    bgColor: 'bg-zinc-800',
    hoverBg: 'hover:bg-zinc-700',
    slug: 'peacock',
    icon: '🦚'
  },
  'Paramount+': { 
    color: '#0064FF', 
    bgColor: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    slug: 'paramount-plus',
    icon: '⛰️'
  },
  'Hulu': { 
    color: '#1CE783', 
    bgColor: 'bg-green-500',
    hoverBg: 'hover:bg-green-600',
    slug: 'hulu',
    icon: '🟢'
  },
  'MUBI': { 
    color: '#2A0A5A', 
    bgColor: 'bg-purple-900',
    hoverBg: 'hover:bg-purple-800',
    slug: 'mubi',
    icon: '🎬'
  },
};

// Helper function to get platform config
function getPlatformConfig(platformName) {
  // Exact match
  if (PLATFORM_CONFIG[platformName]) {
    return { name: platformName, ...PLATFORM_CONFIG[platformName] };
  }
  
  // Case-insensitive search
  const lowerName = platformName?.toLowerCase() || '';
  for (const [key, value] of Object.entries(PLATFORM_CONFIG)) {
    if (key.toLowerCase() === lowerName) {
      return { name: key, ...value };
    }
  }
  
  // Partial match
  for (const [key, value] of Object.entries(PLATFORM_CONFIG)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return { name: key, ...value };
    }
  }
  
  // Default fallback
  return { 
    name: platformName, 
    color: '#666666', 
    bgColor: 'bg-zinc-700',
    hoverBg: 'hover:bg-zinc-600',
    slug: platformName?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
    icon: '📺'
  };
}

/**
 * Small OTT Badge - For inline use
 */
export function OTTBadgeSmall({ platform, showIcon = true }) {
  const config = getPlatformConfig(platform);
  
  return (
    <Link 
      href={`/ott/${config.slug}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-white text-xs font-bold transition-all ${config.bgColor} ${config.hoverBg}`}
    >
      {showIcon && <span className="text-[10px]">{config.icon}</span>}
      {config.name}
    </Link>
  );
}

/**
 * Medium OTT Badge - For movie cards
 */
export function OTTBadgeMedium({ platform, releaseDate, link }) {
  const config = getPlatformConfig(platform);
  
  return (
    <Link 
      href={link || `/ott/${config.slug}`}
      target={link ? "_blank" : "_self"}
      rel={link ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-bold transition-all shadow-lg ${config.bgColor} ${config.hoverBg} hover:shadow-xl hover:scale-105`}
    >
      <Play className="w-3 h-3 fill-current" />
      <span>Watch on {config.name}</span>
      {releaseDate && (
        <span className="text-xs opacity-80">• {new Date(releaseDate).toLocaleDateString()}</span>
      )}
      {link && <ExternalLink className="w-3 h-3" />}
    </Link>
  );
}

/**
 * Large OTT Card - For dedicated OTT sections
 */
export function OTTCard({ platform, releaseDate, link, movieTitle }) {
  const config = getPlatformConfig(platform);
  
  return (
    <Link 
      href={link || `/ott/${config.slug}`}
      target={link ? "_blank" : "_self"}
      rel={link ? "noopener noreferrer" : undefined}
      className={`block p-4 rounded-2xl border border-white/10 transition-all hover:border-white/20 hover:scale-[1.02] group`}
      style={{ backgroundColor: `${config.color}15` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: config.color }}
          >
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Now Streaming</p>
            <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {config.name}
            </p>
          </div>
        </div>
        
        {releaseDate && (
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Since</p>
            <p className="text-sm font-bold text-white">
              {new Date(releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
      
      {movieTitle && (
        <p className="mt-3 text-sm text-zinc-400">
          Watch <span className="text-white font-bold">{movieTitle}</span> on {config.name}
        </p>
      )}
      
      {link && (
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 group-hover:text-blue-400 transition-colors">
          <ExternalLink className="w-3 h-3" />
          <span>Open in {config.name}</span>
        </div>
      )}
    </Link>
  );
}

/**
 * OTT Platform Grid - For discovery/OTT pages
 */
export function OTTPlatformGrid({ platforms }) {
  if (!platforms || platforms.length === 0) {
    // Show all available platforms
    platforms = Object.keys(PLATFORM_CONFIG).slice(0, 8);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {platforms.map((platform, idx) => {
        const config = getPlatformConfig(platform);
        return (
          <Link
            key={idx}
            href={`/ott/${config.slug}`}
            className="p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:scale-105 group text-center"
            style={{ backgroundColor: `${config.color}10` }}
          >
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: config.color }}
            >
              {config.icon}
            </div>
            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              {config.name}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Explore Movies</p>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Streaming Now Badge - For movie hero sections
 */
export function StreamingNowBadge({ ott }) {
  if (!ott?.platform) return null;
  
  const config = getPlatformConfig(ott.platform);
  
  return (
    <Link 
      href={ott.link || `/ott/${config.slug}`}
      target={ott.link ? "_blank" : "_self"}
      rel={ott.link ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-4 px-6 py-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl group/ott hover:border-white/20 transition-all"
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: config.color }}
      >
        <Play className="w-5 h-5 text-white fill-current" />
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Now Streaming</p>
        <p className="text-sm font-bold text-white group-hover/ott:text-blue-400 transition-colors">
          Watch on {config.name}
        </p>
      </div>
      {ott.link && <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/ott:text-white transition-colors" />}
    </Link>
  );
}

export { PLATFORM_CONFIG, getPlatformConfig };
