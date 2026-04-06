import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  Flame,
  RefreshCw,
  Filter,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function TrendingIntelligencePage() {
  const [trends, setTrends] = useState({
    trending_movies: [],
    trending_actors: [],
    viral_topics: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [syncStats, setSyncStats] = useState(null);

  // Sync trends from external sources
  const syncTrends = async () => {
    try {
      setRefreshing(true);
      setError("");

      const response = await fetch("/api/trending/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": "filmyfire_automation_secret_2026"
        }
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      const data = await response.json();
      setSyncStats(data.stats);
      
      // Refresh trending data after sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchTrendingData();
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Sync error:", err);
      setError("Sync failed: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch trending data
  const fetchTrendingData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const response = await fetch("/api/trending?limit=20&region=IN");

      if (!response.ok) {
        throw new Error("Failed to fetch trending data");
      }

      const data = await response.json();

      if (data.success) {
        setTrends({
          trending_movies: data.data?.trending_movies || [],
          trending_actors: data.data?.trending_actors || [],
          viral_topics: data.data?.viral_topics || [],
        });
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error(data.message || "Failed to load trends");
      }
    } catch (err) {
      console.error("Error fetching trends:", err);
      setError(err.message || "Error loading trending data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchTrendingData();
  }, []);

  // Filter trends based on search and tab
  const getFilteredTrends = () => {
    let filtered = [];

    if (activeTab === "all" || activeTab === "movies") {
      filtered = [
        ...filtered,
        ...trends.trending_movies.map((t) => ({
          ...t,
          category: "movies",
        })),
      ];
    }

    if (activeTab === "all" || activeTab === "actors") {
      filtered = [
        ...filtered,
        ...trends.trending_actors.map((t) => ({
          ...t,
          category: "actors",
        })),
      ];
    }

    if (activeTab === "all" || activeTab === "topics") {
      filtered = [
        ...filtered,
        ...trends.viral_topics.map((t) => ({
          ...t,
          category: "topics",
        })),
      ];
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trend) =>
          trend.title?.toLowerCase().includes(query) ||
          trend.keywords?.some((k) =>
            k.toLowerCase().includes(query)
          )
      );
    }

    // Sort by score (descending)
    return filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  };

  const filteredTrends = getFilteredTrends();

  return (
    <>
      <Head>
        <title>Trending Intelligence - FilmyFire Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                Trending Intelligence
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Automated based on Google Trends and YouTube data
              </p>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Last updated: {lastUpdated}
                </span>
              )}
              <button
                onClick={() => fetchTrendingData(true)}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={syncTrends}
                disabled={refreshing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Flame className="w-4 h-4" />
                {refreshing ? "Syncing..." : "Sync Trends"}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Trending Movies</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {trends.trending_movies.length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Trending Actors</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {trends.trending_actors.length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Viral Topics</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {trends.viral_topics.length}
                  </p>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-200 font-semibold">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Sync Stats */}
          {syncStats && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-200 font-semibold mb-3">✅ Last Sync Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                <div>
                  <p className="text-green-400 text-xs">Processed</p>
                  <p className="text-white font-bold">{syncStats.processed}</p>
                </div>
                <div>
                  <p className="text-green-400 text-xs">Validated</p>
                  <p className="text-white font-bold">{syncStats.validated}</p>
                </div>
                <div>
                  <p className="text-orange-400 text-xs">Rejected</p>
                  <p className="text-white font-bold">{syncStats.rejected}</p>
                </div>
                <div>
                  <p className="text-blue-400 text-xs">🎬 Movies</p>
                  <p className="text-white font-bold">{syncStats.movies}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-xs">👤 Actors</p>
                  <p className="text-white font-bold">{syncStats.actors}</p>
                </div>
                <div>
                  <p className="text-yellow-400 text-xs">📊 Topics</p>
                  <p className="text-white font-bold">{syncStats.topics}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search trends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Tab Filter */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "movies", label: "Movies" },
                  { id: "actors", label: "Actors" },
                  { id: "topics", label: "Topics" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-red-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading trending data...</p>
              </div>
            </div>
          ) : filteredTrends.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No trends found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-red-500 hover:text-red-400 mt-2 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Count */}
              <p className="text-gray-400 text-sm">
                Showing {filteredTrends.length} trending {activeTab === "all" ? "items" : activeTab}
              </p>

              {/* Trends Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrends.map((trend, idx) => (
                  <TrendCard key={`${trend._id}-${idx}`} trend={trend} />
                ))}
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

// Trend Card Component
function TrendCard({ trend }) {
  const categoryColors = {
    movies: "blue",
    actors: "purple",
    topics: "orange",
  };

  const categoryIcons = {
    movies: "🎬",
    actors: "👤",
    topics: "📊",
  };

  const color = categoryColors[trend.category] || "gray";
  const icon = categoryIcons[trend.category] || "📌";

  const getLink = () => {
    if (trend.category === "movies" && trend.slug) {
      return `/movie/${trend.slug}`;
    } else if (trend.category === "actors" && trend.slug) {
      return `/celebrity/${trend.slug}/networth`;
    }
    return "#";
  };

  return (
    <Link href={getLink()}>
      <div className={`group cursor-pointer bg-gray-900 border border-gray-800 hover:border-${color}-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20`}>
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {trend.metadata?.coverImage || trend.metadata?.thumbnail ? (
            <img
              src={trend.metadata?.coverImage || trend.metadata?.thumbnail}
              alt={trend.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {icon}
            </div>
          )}

          {/* Score Badge */}
          <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-white font-bold text-sm">{trend.score}</span>
          </div>

          {/* Category Badge */}
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white uppercase bg-${color}-600`}
          >
            {trend.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-red-500 transition-colors">
            {trend.title}
          </h3>

          {/* Keywords */}
          {trend.keywords && trend.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {trend.keywords.slice(0, 3).map((keyword, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span className="capitalize">{trend.source}</span>
            <span className="text-gray-400">
              {trend.traffic > 0
                ? `${(trend.traffic / 1000).toFixed(0)}K views`
                : "Trending"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
