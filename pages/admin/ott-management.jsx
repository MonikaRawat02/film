"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { 
  Plus, Edit2, Trash2, TrendingUp, DollarSign, 
  Film, Save, X, RefreshCw, Users, Globe
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function OTTAdminDashboard() {
  const [activeTab, setActiveTab] = useState("platforms");
  const [platforms, setPlatforms] = useState([]);
  const [deals, setDeals] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "platforms") {
        const res = await fetch("/api/admin/ott/platforms");
        const data = await res.json();
        if (data.success) setPlatforms(data.data);
      } else if (activeTab === "deals") {
        const res = await fetch("/api/admin/ott/deals");
        const data = await res.json();
        if (data.success) setDeals(data.data);
      } else if (activeTab === "trends") {
        const res = await fetch("/api/admin/ott/trends");
        const data = await res.json();
        if (data.success) setTrends(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let url, method, body;

      if (modalType === "platform") {
        url = editItem 
          ? `/api/admin/ott/platforms?platform=${editItem.slug}`
          : "/api/admin/ott/platforms";
        method = editItem ? "PUT" : "POST";
        body = formData;
      } else if (modalType === "deal") {
        url = editItem
          ? "/api/admin/ott/deals"
          : "/api/admin/ott/deals";
        method = editItem ? "PUT" : "POST";
        body = { ...formData, dealId: editItem?._id };
      } else if (modalType === "trend") {
        url = editItem
          ? "/api/admin/ott/trends"
          : "/api/admin/ott/trends";
        method = editItem ? "PUT" : "POST";
        body = { ...formData, trendId: editItem?._id };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editItem ? "Updated successfully!" : "Created successfully!");
        closeModal();
        fetchData();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Error saving data");
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      let url, body;

      if (type === "platform") {
        url = `/api/admin/ott/platforms?platform=${id}`;
        body = {};
      } else if (type === "deal") {
        url = "/api/admin/ott/deals";
        body = { dealId: id };
      } else if (type === "trend") {
        url = "/api/admin/ott/trends";
        body = { trendId: id };
      }

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully!");
        fetchData();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  const tabs = [
    { id: "platforms", label: "Platform Manager", icon: Globe },
    { id: "deals", label: "Deal Manager", icon: DollarSign },
    { id: "trends", label: "Trend Manager", icon: TrendingUp }
  ];

  return (
    <AdminLayout title="OTT Intelligence Admin">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">OTT Intelligence Management</h1>
            <p className="text-zinc-400">Manage platforms, deals, and weekly trends</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Platform Manager */}
            {activeTab === "platforms" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">OTT Platforms</h2>
                  <button
                    onClick={() => openModal("platform")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Platform
                  </button>
                </div>

                <div className="grid gap-4">
                  {platforms.map((platform) => (
                    <div key={platform._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center">
                            {platform.logo ? (
                              <img src={platform.logo} alt={platform.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-2xl font-bold">{platform.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{platform.name}</h3>
                            <p className="text-zinc-400 text-sm">{platform.tagline}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-blue-400" />
                                {(platform.subscribers / 1000000).toFixed(0)}M subs
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                {platform.marketShare}% share
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-amber-400" />
                                {platform.avgDealValue}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("platform", platform)}
                            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("platform", platform.slug)}
                            className="p-2 bg-red-900/50 rounded-lg hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deal Manager */}
            {activeTab === "deals" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">OTT Acquisition Deals</h2>
                  <button
                    onClick={() => openModal("deal")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Deal
                  </button>
                </div>

                <div className="grid gap-4">
                  {deals.map((deal) => (
                    <div key={deal._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Film className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{deal.title}</h3>
                            <p className="text-zinc-400 text-sm">{deal.language} • {deal.dealType}</p>
                            <p className="text-green-400 font-semibold mt-1">{deal.dealValue}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("deal", deal)}
                            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("deal", deal._id)}
                            className="p-2 bg-red-900/50 rounded-lg hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trend Manager */}
            {activeTab === "trends" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Weekly OTT Trends</h2>
                  <button
                    onClick={() => openModal("trend")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Trend Report
                  </button>
                </div>

                <div className="grid gap-4">
                  {trends.map((trend) => (
                    <div key={trend._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Week {trend.week}</h3>
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-zinc-400">Top Movie</p>
                              <p className="font-medium">{trend.topMovie?.title || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400">Top Series</p>
                              <p className="font-medium">{trend.topSeries?.title || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400">Growing Platform</p>
                              <p className="font-medium">{trend.fastestGrowingPlatform?.name || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("trend", trend)}
                            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("trend", trend._id)}
                            className="p-2 bg-red-900/50 rounded-lg hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editItem ? "Edit" : "Add"} {modalType === "platform" ? "Platform" : modalType === "deal" ? "Deal" : "Trend"}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Platform Form */}
                {modalType === "platform" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Platform Name *</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Slug *</label>
                      <input
                        type="text"
                        value={formData.slug || ""}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tagline</label>
                      <input
                        type="text"
                        value={formData.tagline || ""}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Subscribers</label>
                        <input
                          type="number"
                          value={formData.subscribers || ""}
                          onChange={(e) => setFormData({ ...formData, subscribers: Number(e.target.value) })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Market Share (%)</label>
                        <input
                          type="number"
                          value={formData.marketShare || ""}
                          onChange={(e) => setFormData({ ...formData, marketShare: Number(e.target.value) })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Avg Deal Value</label>
                      <input
                        type="text"
                        value={formData.avgDealValue || ""}
                        onChange={(e) => setFormData({ ...formData, avgDealValue: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                      />
                    </div>
                  </>
                )}

                {/* Deal Form */}
                {modalType === "deal" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Platform *</label>
                        <select
                          value={formData.platform || ""}
                          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                          required
                        >
                          <option value="">Select Platform</option>
                          {platforms.map(p => (
                            <option key={p._id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Deal Value *</label>
                        <input
                          type="text"
                          value={formData.dealValue || ""}
                          onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <input
                          type="text"
                          value={formData.language || ""}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Deal Type</label>
                        <select
                          value={formData.dealType || ""}
                          onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        >
                          <option value="">Select Type</option>
                          <option value="Exclusive">Exclusive</option>
                          <option value="Post-Theatrical">Post-Theatrical</option>
                          <option value="Non-Exclusive">Non-Exclusive</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Trend Form */}
                {modalType === "trend" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Week (e.g., 2026-W18) *</label>
                      <input
                        type="text"
                        value={formData.week || ""}
                        onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Top Movie</label>
                        <input
                          type="text"
                          value={formData.topMovie?.title || ""}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            topMovie: { ...formData.topMovie, title: e.target.value }
                          })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Top Series</label>
                        <input
                          type="text"
                          value={formData.topSeries?.title || ""}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            topSeries: { ...formData.topSeries, title: e.target.value }
                          })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    {editItem ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
