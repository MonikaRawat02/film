import Link from "next/link";
import { Clock, Film, Star, TrendingUp, DollarSign, Play, Users, ArrowRight } from "lucide-react";

// 1. Movie Explainer Card
export const OTTExplainerCard = ({ movie }) => (
  <Link 
    href={`/movie/${movie.slug}`}
    className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all duration-300"
  >
    <div className="aspect-video relative overflow-hidden">
      {movie.coverImage ? (
        <img src={movie.coverImage} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Film className="w-10 h-10 text-zinc-700" /></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4">
        <div className="flex flex-wrap gap-2">
          {movie.genres?.slice(0, 2).map((g, i) => (
            <span key={i} className="px-2 py-0.5 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase rounded-md">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-rose-400 transition-colors">{movie.title}</h3>
      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.runtime || "N/A"}</span>
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "N/A"}</span>
      </div>
      <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{movie.summary}</p>
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Full Explainer</span>
        <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

// 2. Box Office Card
export const OTTBoxOfficeCard = ({ movie }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="p-3 bg-emerald-500/10 rounded-xl">
        <DollarSign className="w-6 h-6 text-emerald-500" />
      </div>
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
        movie.verdict?.toLowerCase() === 'blockbuster' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
        movie.verdict?.toLowerCase() === 'hit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
        'bg-rose-500/10 text-rose-400 border-rose-500/20'
      }`}>
        {movie.verdict}
      </span>
    </div>
    
    <h3 className="text-xl font-bold text-white mb-6 tracking-tight">{movie.movieName}</h3>
    
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-3 bg-zinc-950/50 rounded-xl border border-white/5">
        <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Budget</p>
        <p className="text-sm font-bold text-white">{movie.budget}</p>
      </div>
      <div className="p-3 bg-zinc-950/50 rounded-xl border border-white/5">
        <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">India Coll.</p>
        <p className="text-sm font-bold text-emerald-400">{movie.indiaCollection}</p>
      </div>
    </div>
    
    <div className="p-4 bg-zinc-950/80 rounded-xl border border-white/5 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Worldwide Gross</p>
        <p className="text-lg font-black text-white">{movie.worldwideCollection}</p>
      </div>
      <Link href={`/movie/${movie.slug}`} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
        <TrendingUp className="w-4 h-4 text-zinc-400" />
      </Link>
    </div>
  </div>
);

// 3. OTT Performance Card
export const OTTPerformanceCard = ({ title }) => (
  <div className="group bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col md:flex-row h-full">
    <div className="w-full md:w-48 aspect-[2/3] md:aspect-auto relative overflow-hidden flex-shrink-0">
      {title.poster ? (
        <img 
          src={title.poster} 
          alt={title.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
          <Play className="w-12 h-12 text-zinc-700" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
      
      {/* Platform Badge on Image */}
      <div className="absolute top-4 left-4">
        <span className="px-2 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-tighter rounded shadow-lg shadow-blue-900/20">
          {title.platform}
        </span>
      </div>
    </div>

    <div className="p-6 flex-grow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
            {title.title}
          </h3>
          {title.trendingRank !== "N/A" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-black text-amber-500">#{title.trendingRank}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-widest">Release Intelligence</span>
            <span className="text-zinc-300 font-medium">{new Date(title.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-widest">Sentiment Score</span>
            <div className="flex items-center gap-1 text-emerald-400">
              <Star className="w-3 h-3 fill-emerald-400" />
              <span className="font-black">8.4/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Market Momentum</span>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">
            {title.trendingRank !== "N/A" ? `${100 - (title.trendingRank * 5)}% Strength` : 'Evaluating...'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out" 
            style={{ width: title.trendingRank !== "N/A" ? `${100 - (title.trendingRank * 5)}%` : '40%' }} 
          />
        </div>
      </div>
    </div>
  </div>
);

// 4. Celebrity Card
export const OTTCelebrityCard = ({ celeb }) => (
  <Link 
    href={`/celebrity/${celeb.slug}/networth`}
    className="group bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 hover:border-fuchsia-500/30 transition-all duration-300 block"
  >
    <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
      {celeb.profileImage ? (
        <img src={celeb.profileImage} alt={celeb.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Users className="w-10 h-10 text-zinc-700" /></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="text-center">
      <h3 className="font-bold text-white group-hover:text-fuchsia-400 transition-colors">{celeb.name}</h3>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3">{celeb.recentMovie}</p>
      
      <div className="flex items-center justify-center gap-2 py-2 bg-zinc-950/50 rounded-lg border border-white/5">
        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
        <span className="text-xs font-black text-white">{celeb.popularityScore}</span>
        <span className="text-[10px] font-bold text-zinc-600 uppercase">Score</span>
      </div>
    </div>
  </Link>
);
