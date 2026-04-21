import { Dna, Heart, Brain, Users, Target, Sparkles, Star, Loader2, ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function MovieDNADiscovery() {
  const router = useRouter();
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dnaCriteria, setDnaCriteria] = useState([
    { key: "emotionalIntensity", label: "Emotional Intensity", value: 0, color: "from-pink-500 to-rose-500", icon: Heart },
    { key: "violenceLevel", label: "Violence Level", value: 0, color: "from-amber-400 to-orange-500", icon: Target },
    { key: "psychologicalDepth", label: "Psychological Depth", value: 0, color: "from-indigo-500 to-violet-500", icon: Brain },
    { key: "familyFriendliness", label: "Family Friendliness", value: 0, color: "from-teal-500 to-emerald-500", icon: Users },
    { key: "complexityLevel", label: "Complexity Level", value: 0, color: "from-orange-500 to-yellow-500", icon: Sparkles },
  ]);
  const [bestMatches, setBestMatches] = useState([]);
  const [finding, setFinding] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/box-office");
        const data = await res.json();
        if (data.success) {
          setAllMovies(data.data.filter(m => m.movieDNA));
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleSliderChange = (index, value) => {
    const newCriteria = [...dnaCriteria];
    newCriteria[index].value = value;
    setDnaCriteria(newCriteria);
  };

  const calculateDnaScore = (movie) => {
    let totalDistance = 0;
    dnaCriteria.forEach(criterion => {
      const movieValue = movie.movieDNA[criterion.key] || 0;
      totalDistance += Math.abs(criterion.value - movieValue);
    });
    // Lower distance is better. Convert to a 0-100 score.
    const maxDistance = dnaCriteria.length * 100;
    return Math.max(0, 100 - (totalDistance / maxDistance) * 100);
  };

  const findMatchingMovies = () => {
    setFinding(true);
    setTimeout(() => {
      const scoredMovies = allMovies.map(movie => ({
        ...movie,
        dnaScore: calculateDnaScore(movie),
      }));
      
      scoredMovies.sort((a, b) => b.dnaScore - a.dnaScore);
      
      setBestMatches(scoredMovies.slice(0, 3));
      setFinding(false);
    }, 500); // Simulate processing time
  };

  const handleMovieClick = (movie) => {
    // Navigate to box office page with search query to show this specific movie
    router.push(`/box-office?search=${encodeURIComponent(movie.movieName)}`);
  };

  const getRadarPoints = () => {
    const center = 150;
    const radius = 120;
    return dnaCriteria.map((c, i) => {
      const angle = (i / dnaCriteria.length) * 2 * Math.PI - Math.PI / 2;
      const valueRatio = c.value / 100;
      const x = center + radius * valueRatio * Math.cos(angle);
      const y = center + radius * valueRatio * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <section className="py-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b0b12] via-[#141728] to-[#0b0b12] shadow-2xl">
        <div className="absolute -inset-40 pointer-events-none rounded-[2rem] bg-[radial-gradient(100%_60%_at_30%_0%,rgba(255,0,128,.15),transparent_60%),radial-gradient(80%_50%_at_90%_40%,rgba(88,28,135,.15),transparent_60%)]" />
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                <Dna className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-4xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-medium tracking-tight">
                  Movie DNA Discovery
                </h2>
                <p className="text-sm text-zinc-400 mt-1">Discover movies based on emotional experience and content DNA</p>
              </div>
            </div>

            <div className="space-y-4">
              {dnaCriteria.map((m, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                        <m.icon className="w-3.5 h-3.5 text-white/80" />
                      </div>
                      <span className="text-zinc-300 font-medium">{m.label}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${m.color} shadow-lg text-white text-[10px] font-bold tracking-wider uppercase`}>
                      {m.value}%
                    </span>
                  </div>
                  <div className="relative h-4 flex items-center group/slider">
                    {/* Background Track */}
                    <div className="absolute inset-0 h-1.5 my-auto w-full rounded-full bg-white/5 border border-white/5" />
                    
                    {/* Filled Progress */}
                    <div
                      className={`absolute left-0 h-1.5 my-auto rounded-full bg-gradient-to-r ${m.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                      style={{ width: `${m.value}%` }}
                    />
                    
                    {/* Sliders Icon as Thumb */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-200"
                      style={{ left: `${m.value}%` }}
                    >
                      <div className="h-7 w-7 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center justify-center text-white/90 group-hover/slider:scale-110 group-hover/slider:border-white/20 transition-all">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={m.value}
                      onChange={(e) => handleSliderChange(i, parseInt(e.target.value))}
                      className="relative z-10 w-full h-full opacity-0 cursor-pointer"
                      aria-label={m.label}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button 
                onClick={findMatchingMovies}
                disabled={loading || finding}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-5 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-80" />
                {finding ? (
                  <>
                    <Loader2 className="relative z-10 w-5 h-5 animate-spin" />
                    <span className="relative z-10 text-lg">Finding...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10 text-lg">Find Matching Movies</span>
                    <Sparkles className="relative z-10 w-5 h-5 opacity-90" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-5 rounded-2xl bg-black/30 border border-white/10 min-h-[200px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 grid place-items-center rounded-xl bg-yellow-500/15 border border-yellow-500/30">
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-sm font-semibold text-zinc-300">Best Matches</span>
              </div>
              {bestMatches.length > 0 ? (
                <div className="space-y-2">
                  {bestMatches.map((b, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleMovieClick(b)}
                      className="group/item flex items-center justify-between w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-300 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white group-hover/item:text-purple-300 transition-colors">{b.movieName}</span>
                        <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover/item:text-purple-400 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
                      </div>
                      <span className="text-emerald-400 font-semibold">{Math.round(b.dnaScore)}%</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-zinc-500 text-sm">Click "Find Matching Movies" to see results.</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full aspect-square rounded-[1.75rem] bg-gradient-to-b from-black/30 to-black/10 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-2xl animate-pulse" />
              <div className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,0,128,.15),transparent_60%),radial-gradient(50%_40%_at_70%_70%,rgba(80,0,255,.15),transparent_60%)]" />
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 300 300" className="w-[85%] h-[85%]">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1" y1="0.2" y2="1">
                      <stop offset="0" stopColor="#ff1ea8" />
                      <stop offset="1" stopColor="#6f4cfe" />
                    </linearGradient>
                    <radialGradient id="g2">
                      <stop offset="0" stopColor="rgba(255,0,128,0.6)" />
                      <stop offset="1" stopColor="rgba(111,76,254,0.2)" />
                    </radialGradient>
                  </defs>
                  <g opacity="0.5">
                    <circle cx="150" cy="150" r="40" fill="none" stroke="url(#g1)" strokeWidth="1" />
                    <circle cx="150" cy="150" r="80" fill="none" stroke="url(#g1)" strokeWidth="1" />
                    <circle cx="150" cy="150" r="120" fill="none" stroke="url(#g1)" strokeWidth="1" />
                  </g>
                  <g stroke="url(#g1)" strokeWidth="1" opacity="0.3">
                    <line x1="150" y1="30" x2="150" y2="270" />
                    <line x1="30" y1="150" x2="270" y2="150" />
                    <line x1="60" y1="60" x2="240" y2="240" />
                    <line x1="240" y1="60" x2="60" y2="240" />
                  </g>
                  <polygon
                    points={getRadarPoints()}
                    fill="url(#g2)"
                    stroke="url(#g1)"
                    strokeWidth="2"
                  />
                  {dnaCriteria.map((c, i) => {
                    const angle = (i / dnaCriteria.length) * 2 * Math.PI - Math.PI / 2;
                    const x = 150 + 120 * (c.value / 100) * Math.cos(angle);
                    const y = 150 + 120 * (c.value / 100) * Math.sin(angle);
                    return <circle key={i} cx={x} cy={y} r="5" fill="#fff" />
                  })}
                </svg>
              </div>
              <div className="absolute left-6 top-6 h-8 w-8 grid place-items-center rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300">
                <Heart className="w-4 h-4" />
              </div>
              <div className="absolute right-6 top-12 h-8 w-8 grid place-items-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300">
                <Target className="w-4 h-4" />
              </div>
              <div className="absolute left-10 bottom-10 h-8 w-8 grid place-items-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <Users className="w-4 h-4" />
              </div>
              <div className="absolute right-8 bottom-12 h-8 w-8 grid place-items-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Brain className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

