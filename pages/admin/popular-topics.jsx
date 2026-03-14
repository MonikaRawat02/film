"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { 
  Plus, PencilLine, Trash2, X, Save, Loader2, 
  Lightbulb, TrendingUp, Eye, Clock, 
  ArrowRight, Hash, FileText 
} from "lucide-react";

export default function PopularTopicsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const INITIAL_FORM = {
    title: "",
    description: "",
    trending: false,
    slug: "",
    order: 0,
  };

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/popular-topics");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (e) {
      console.error("Failed to fetch topics", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      const res = await fetch(`/api/admin/popular-topics/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i._id !== id));
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const url = editingId 
      ? `/api/admin/popular-topics/${editingId}` 
      : "/api/admin/popular-topics";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(INITIAL_FORM);
        fetchItems();
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (e) {
      setError("Failed to save topic");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Popular Topics Admin | FilmyFire</title>
      </Head>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-gray-800 bg-black/30">
            <div>
              <h1 className="text-2xl font-bold text-white">Popular Intelligence Topics</h1>
              <p className="text-sm text-gray-400">Manage topics displayed on the create page</p>
            </div>
            <button
              onClick={() => {
                setForm(INITIAL_FORM);
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-lg shadow-red-900/20 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Add New Topic
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item._id} className="group relative rounded-2xl border border-gray-800 bg-gray-900/20 overflow-hidden hover:border-gray-600 transition-all card-hover">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 grid place-items-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      {item.trending && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3" />
                          <span>Trending</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-200 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">
                      <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views}</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.readTime}</div>
                    </div>
                    <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-800">
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#0F0F14]">
                <h3 className="text-xl font-bold text-white">{editingId ? "Edit Topic" : "Add New Topic"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Title</label>
                    <div className="relative group">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-red-500" />
                      <input
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-red-500"
                        placeholder="Why Big Bollywood Films Fail"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">URL Slug</label>
                    <div className="relative group">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-red-500" />
                      <input
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-red-500"
                        placeholder="bollywood-fail-psychology"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-lg bg-gray-900/50 border border-gray-800 px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Provide a deep insight summary..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">Trending Status</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Mark this topic as trending</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, trending: !form.trending })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.trending ? "bg-red-600" : "bg-gray-700"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.trending ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl bg-gray-900/60 text-sm font-bold text-gray-400">Cancel</button>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {editingId ? "Update Topic" : "Add Topic"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
