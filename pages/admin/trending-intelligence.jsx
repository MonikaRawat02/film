"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "react-toastify";
import { Plus, PencilLine, Trash2, X, Save, Loader2, Image as ImageIcon, Layout, BarChart, Tv, FileText, Film, Clock, UploadCloud, TrendingUp } from "lucide-react";

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
              <p className="text-sm text-gray-400">Automated based on user search behavior</p>
            </div>
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
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 w-fit">
                        {item.category}
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-orange-600/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 w-fit">
                        Auto-Trending
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-200 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.movieName}</span>
                      {item.searchCount > 0 && (
                        <span className="text-orange-400 font-bold">{item.searchCount} searches</span>
                      )}
                    </div>
                 
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-black/20">
              <TrendingUp className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400">No Automated Trending Content Yet</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                Trending content will automatically appear here as users search for movies and celebrities on the main site.
              </p>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
