"use client";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Film, Tv, Star, TrendingUp, DollarSign, Users, Eye, Activity } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    celebrities: 0,
    boxOffice: 0,
    ottIntelligence: 0,
    trendingIntelligence: 0,
    totalViews: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [celebritiesRes, boxOfficeRes, ottRes, trendingRes] = await Promise.all([
        fetch("/api/admin/celebrity/getCelebrity"),
        fetch("/api/admin/box-office"),
        fetch("/api/admin/ott-intelligence"),
        fetch("/api/trending-intelligence")
      ]);

      const celebritiesData = await celebritiesRes.json();
      const boxOffice = await boxOfficeRes.json();
      const ott = await ottRes.json();
      const trendingData = await trendingRes.json();

      const celebrities = celebritiesData.data || celebritiesData;
      const boxOfficeData = Array.isArray(boxOffice) ? boxOffice : (boxOffice.data || []);
      const ottData = Array.isArray(ott) ? ott : (ott.data || []);
      const trending = trendingData.data || trendingData || [];

      // Calculate total views from trending intelligence
      const totalViews = Array.isArray(trending) ? trending.reduce((sum, item) => {
        const viewValue = parseFloat(item.views?.replace(/[KM]+/, "") || "0");
        return sum + (item.views?.includes("M") ? viewValue * 1000 : viewValue);
      }, 0) : 0;

      setStats({
        celebrities: Array.isArray(celebrities) ? celebrities.length : 0,
        boxOffice: Array.isArray(boxOfficeData) ? boxOfficeData.length : 0,
        ottIntelligence: Array.isArray(ottData) ? ottData.length : 0,
        trendingIntelligence: Array.isArray(trending) ? trending.length : 0,
        totalViews: Math.round(totalViews),
        recentActivity: Array.isArray(trending) ? [
          ...trending.slice(0, 3).map(item => ({
            type: "Trending",
            title: item.title,
            time: new Date(item.createdAt).toLocaleDateString()
          }))
        ] : []
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Celebrities",
      value: stats.celebrities,
      icon: Star,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      link: "/admin/celebrity"
    },
    {
      title: "Box Office",
      value: stats.boxOffice,
      icon: Film,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      link: "/admin/box-office"
    },
    {
      title: "OTT Intelligence",
      value: stats.ottIntelligence,
      icon: Tv,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      link: "/admin/ott-intelligence"
    },
    {
      title: "Trending",
      value: stats.trendingIntelligence,
      icon: TrendingUp,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      link: "/admin/trending-intelligence"
    }
  ];

  const overviewStats = [
    {
      label: "Total Views",
      value: `${(stats.totalViews / 1000).toFixed(1)}M`,
      icon: Eye,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      label: "Active Users",
      value: "250K+",
      icon: Users,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      label: "Reports Generated",
      value: "1.2K+",
      icon: Activity,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      label: "Weekly Updates",
      value: "50+",
      icon: DollarSign,
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard | FilmFire</title>
      </Head>
      <AdminLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <section className="rounded-2xl border border-gray-800 bg-black/30 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">Dashboard Overview</h1>
                <p className="text-sm text-gray-400 mt-1">Manage all your cinema intelligence modules</p>
              </div>
            </div>
          </section>

          {/* Main Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => (
              <Link 
                key={index} 
                href={card.link}
                className="rounded-2xl border border-gray-800 bg-black/30 p-5 hover:border-gray-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{card.title}</span>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-white">
                    {loading ? "..." : card.value}
                  </span>
                </div>
              </Link>
            ))}
          </section>

          {/* Overview Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, index) => (
              <div 
                key={index}
                className="rounded-2xl border border-gray-800 bg-gradient-to-br from-zinc-900/50 to-black/30 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? "..." : stat.value}
                </div>
              </div>
            ))}
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/admin/trending-intelligence"
              className="rounded-2xl border border-gray-800 bg-gradient-to-br from-red-600/20 to-orange-600/20 p-6 hover:border-red-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Trending Intelligence</h3>
                <TrendingUp className="h-5 w-5 text-red-400 group-hover:text-red-300" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Manage trending movies, web series, and celebrity analyses
              </p>
              <div className="flex items-center text-red-400 text-sm font-medium">
                <span>Manage Content</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link 
              href="/admin/box-office"
              className="rounded-2xl border border-gray-800 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Box Office Analytics</h3>
                <Film className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Track movie performance, ROI, and box office verdicts
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                <span>View Analytics</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </section>

          {/* Recent Activity */}
          <section className="rounded-2xl border border-gray-800 bg-black/30 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <TrendingUp className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No recent activity</p>
            )}
          </section>
        </div>
      </AdminLayout>
    </>
  );
}
