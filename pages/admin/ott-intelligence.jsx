import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Trash2, Edit, Save, X, Tv, TrendingUp, Search as SearchIcon, Loader2, Film, DollarSign, PieChart, Activity } from "lucide-react";

export default function OTTIntelligenceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    platformName: "",
    averageDealValue: "",
    marketShare: 50,
    statusLabel: "Growing",
    detailsLink: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ott-intelligence?q=${searchQuery}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/admin/ott-intelligence?id=${editingItem._id}` : "/api/admin/ott-intelligence";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ platformName: "", averageDealValue: "", marketShare: 50, statusLabel: "Growing", detailsLink: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/ott-intelligence?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>OTT Intelligence Management | Admin</title>
      </Head>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="text-red-600" /> OTT Intelligence
          </h1>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({ platformName: "", averageDealValue: "", marketShare: 50, statusLabel: "Growing", detailsLink: "" });
              setIsModalOpen(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Add Platform
          </button>
        </div>

        <div className="bg-gray-900/20 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
            <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Edit className="h-3.5 w-3.5 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300">Update Existing Platform</h3>
          </div>
          
          <div className="relative group mb-6">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search platform by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-red-500 mb-2" />
              <p className="text-sm">Searching platforms...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item._id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-700 transition-all">
                  <div className="flex-1 pr-6 w-full">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <h3 className="font-bold text-lg">{item.platformName}</h3>
                      <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded flex items-center gap-1">
                        <TrendingUp size={12} /> {item.statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Avg deal value: <span className="text-white font-medium">{item.averageDealValue}</span> per title
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${item.marketShare}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-white">{item.marketShare}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-gray-800 rounded-lg text-blue-400 transition-all hover:scale-110">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-gray-800 rounded-lg text-red-400 transition-all hover:scale-110">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900/20 border border-dashed border-gray-800 rounded-xl">
              <SearchIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No platforms found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Redesigned Modal matching Box Office style */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 w-full max-w-md rounded-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
              {/* Modal Header with Gradient */}
              <div className="bg-gradient-to-r from-red-600/20 to-transparent p-6 pb-4 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                      {editingItem ? (
                        <Edit className="h-5 w-5 text-red-500" />
                      ) : (
                        <Tv className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingItem ? "Edit Platform" : "Add New Platform"}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {editingItem ? "Update platform details below" : "Enter OTT platform intelligence data"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="text-gray-400 hover:text-white transition-all hover:scale-110 bg-gray-800/50 hover:bg-gray-800 p-2 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Platform Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Tv className="h-4 w-4 text-red-500" />
                    Platform Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Netflix, Amazon Prime, Disney+"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                    value={formData.platformName}
                    onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  />
                </div>

                {/* Average Deal Value Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Average Deal Value
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="$15M–$50M per title"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                    value={formData.averageDealValue}
                    onChange={(e) => setFormData({ ...formData, averageDealValue: e.target.value })}
                  />
                </div>

                {/* Market Share and Status Label Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-blue-500" />
                      Market Share (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600 pr-12"
                        value={formData.marketShare}
                        onChange={(e) => setFormData({ ...formData, marketShare: Number(e.target.value) })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-yellow-500" />
                      Status Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Growing/Stable"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-600"
                      value={formData.statusLabel}
                      onChange={(e) => setFormData({ ...formData, statusLabel: e.target.value })}
                    />
                  </div>
                </div>

                {/* Market Share Visual Indicator (for context) */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Market Share Visualization</span>
                    <span className="text-white font-bold">{formData.marketShare}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-300" 
                      style={{ width: `${formData.marketShare}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Current market share percentage for {formData.platformName || "this platform"}
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
                  >
                    <Save size={18} /> {editingItem ? "Update" : "Save"}
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