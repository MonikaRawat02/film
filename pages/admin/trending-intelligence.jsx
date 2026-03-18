"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "react-toastify";
import { Plus, PencilLine, Trash2, X, Save, Loader2, Image as ImageIcon, Layout, BarChart, Tv, FileText, Film, Clock, UploadCloud } from "lucide-react";

export default function TrendingIntelligenceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const INITIAL_FORM = {
    title: "",
    movieName: "",
    image: "",
    category: "Explained",
    slug: "",
    description: "",
    readTime: "",
    views: "",
  };

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/trending-intelligence");
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (e) {
      console.error("Failed to fetch trending items", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item._id);
    setImagePreview(item.image);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/trending-intelligence/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i._id !== id));
        toast.success("Item deleted successfully!");
      } else {
        toast.error("Failed to delete item");
      }
    } catch (e) {
      toast.error("Delete failed");
      console.error("Delete failed", e);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setImagePreview(String(dataUrl));
      
      try {
        setImageUploading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({ 
            data: dataUrl, 
            fileName: form.slug || `trending-${Date.now()}` 
          })
        });
        const out = await res.json();
        if (!res.ok) {
          toast.error(out.message || "Image upload failed");
        } else {
          setForm(prev => ({ ...prev, image: out.url }));
          toast.success("Image uploaded successfully!");
        }
      } catch (err) {
        toast.error("Image upload failed");
        console.error(err);
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      toast.error("Please upload an image");
      return;
    }
    setSubmitting(true);

    const url = editingId ? `/api/trending-intelligence/${editingId}` : "/api/trending-intelligence";
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
        toast.success(`Item ${editingId ? "updated" : "published"} successfully!`);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (e) {
      toast.error("Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Trending Intelligence Admin | FilmFire</title>
      </Head>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-gray-800 bg-black/30">
            <div>
              <h1 className="text-2xl font-bold text-white">Trending Intelligence</h1>
              <p className="text-sm text-gray-400">Manage dynamic trending content</p>
            </div>
            <button
              onClick={() => {
                setForm(INITIAL_FORM);
                setEditingId(null);
                setImagePreview("");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-lg shadow-red-900/20 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Create New Entry
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
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-200 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.movieName}</span>
                    </div>
                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-800">
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

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A24] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#0F0F14]">
                <h3 className="text-xl font-bold text-white">{editingId ? "Edit Entry" : "Create New Entry"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#0A0A0F]/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Article Title</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <input
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700"
                        placeholder="e.g. Inception — Time Dilation Explained"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">URL Slug</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors">
                        <Layout className="h-4 w-4" />
                      </div>
                      <input
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700"
                        placeholder="inception-explained"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Movie Name</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors">
                        <Film className="h-4 w-4" />
                      </div>
                      <input
                        required
                        value={form.movieName}
                        onChange={(e) => setForm({ ...form, movieName: e.target.value })}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700"
                        placeholder="e.g. Inception"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Category</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                        <BarChart className="h-4 w-4" />
                      </div>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 pl-10 pr-10 py-3 text-sm text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="Explained">Explained</option>
                        <option value="Box Office">Box Office</option>
                        <option value="OTT">OTT</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Media Assets</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-4">
                      <div className="relative aspect-[4/5] rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30 overflow-hidden group/upload flex flex-col items-center justify-center transition-all hover:border-red-500/30">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">Change Image</label>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <UploadCloud className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-xs text-gray-500 font-medium">Upload Cover Art</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {imageUploading && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 text-red-500 animate-spin mx-auto mb-2" />
                              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Uploading</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Intelligence Summary</label>
                        <textarea
                          rows={6}
                          required
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="w-full rounded-lg bg-gray-900/50 border border-gray-800 px-5 py-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700 resize-none"
                          placeholder="Provide a strategic summary of this intelligence deep-dive..."
                        />
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                          <span className="text-blue-400 font-bold uppercase tracking-wider mr-1">Pro Tip:</span> 
                          Use high-resolution 4:5 vertical images for best impact in the trending section.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-8 py-3 rounded-xl bg-gray-900/60 hover:bg-gray-800 text-sm font-bold text-gray-400 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting || imageUploading} 
                    className="inline-flex items-center gap-3 px-10 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold transition-all shadow-xl shadow-red-900/30 disabled:opacity-50 active:scale-95"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {editingId ? "Save Intelligence" : "Publish Intelligence"}
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
