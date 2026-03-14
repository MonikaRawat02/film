"use client";
import { useState, useId, useCallback, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import { toast } from 'react-toastify';
import { InputField, SelectField, TextareaField, ArrayCard, SectionCard } from "@/components/admin/Shared";
import {
  Star, PencilLine, Plus, X,
  User, DollarSign, TrendingUp,
  Calendar, Briefcase, Home,
  FileText, HelpCircle, Award,
  Save, AlertCircle, CheckCircle,
  Image as ImageIcon, Globe, Hash, BarChart,
  Clock, Shield, Crown, Film,
  Users, ArrowLeft, ArrowRight, UploadCloud, Search as SearchIcon, Loader2, MoreVertical, Trash2, Edit
} from "lucide-react";



const INITIAL_FORM = {
  title: "",
  slug: "",
  category: "Bollywood",
  contentType: "movie",
  movieTitle: "",
  releaseYear: "",
  author: {
    name: "Filmy Intelligence Team",
    role: "Editorial"
  },
  summary: "",
  coverImage: "",
  sections: [],
  highlights: [],
  verdict: "",
  tags: [],
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: []
  },
  status: "draft",
  publishedAt: ""
};

export default function ArticleModule() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  
  // List management
  const [articles, setArticles] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "content", label: "Content Sections", icon: FileText },
  ];

  const fetchArticles = useCallback(async () => {
    setLoadingList(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch(`/api/admin/articles/list?q=${searchQuery}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (res.ok) {
        setArticles(data.data || []);
      } else {
        const msg = data.error ? `${data.message} (${data.error})` : (data.message || "Failed to fetch articles");
        toast.error(msg);
      }
    } catch (e) {
      console.error("Failed to fetch articles", e);
      toast.error("Failed to fetch articles");
    } finally {
      setLoadingList(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchArticles(), 300);
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  const loadArticleForEdit = async (article) => {
    setEditingId(article._id);
    setForm({
      ...INITIAL_FORM,
      ...article,
      author: { ...INITIAL_FORM.author, ...article.author },
      stats: { ...INITIAL_FORM.stats, ...article.stats },
    });
    setImagePreview(article.coverImage || "");
    setOpen(true);
    setActiveTab(0);
  };

  const handleDelete = async (article) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch(`/api/admin/articles/delete?id=${article._id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ? `${data.message} (${data.error})` : (data.message || "Failed to delete article");
        toast.error(msg);
        return;
      }
      toast.success("Article deleted successfully!");
      fetchArticles();
    } catch (e) {
      toast.error("Failed to delete article");
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setImagePreview("");
    setOpen(true);
    setActiveTab(0);
  };

  const update = useCallback((path, value) => {
    setForm(prev => {
      const newForm = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  }, []);

  const addArrayItem = (path, item) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
          obj[keys[i]] = [...(obj[keys[i]] || []), item];
        } else {
          if (!obj[keys[i]]) obj[keys[i]] = {};
          obj = obj[keys[i]];
        }
      }
      return next;
    });
  };

  const removeArrayItem = (path, index) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
          obj[keys[i]] = obj[keys[i]].filter((_, idx) => idx !== index);
        } else {
          obj = obj[keys[i]];
        }
      }
      return next;
    });
  };

  const parseNumber = (v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  const compressImage = async (dataUrl, maxSizeMB = 0.5) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      img.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const processedDataUrl = await compressImage(dataUrl);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ data: processedDataUrl, fileName: `article_${Date.now()}` })
      });
      if (!res.ok) throw new Error("Upload failed");
      const out = await res.json();
      update("coverImage", out.url);
      setImagePreview(out.url);
      toast.success("Image uploaded successfully!");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setImageUploading(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const payload = {
        ...form,
        releaseYear: parseNumber(form.releaseYear),
        tags: Array.isArray(form.tags) ? form.tags : String(form.tags || "").split(",").map(s => s.trim()).filter(Boolean),
        highlights: Array.isArray(form.highlights) ? form.highlights : String(form.highlights || "").split(",").map(s => s.trim()).filter(Boolean),
      };
      
      const url = editingId ? `/api/admin/articles/update?id=${editingId}` : "/api/admin/articles/create";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ? `${data.message} (${data.error})` : (data.message || `Failed to ${editingId ? 'update' : 'create'} article`);
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      toast.success(`Article ${editingId ? 'updated' : 'created'} successfully!`);
      setSubmitting(false);
      setOpen(false);
      setEditingId(null);
      fetchArticles();
    } catch (e) {
      toast.error("Unexpected error occurred");
      setSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Basic Info
        return (
          <div className="space-y-5">
            <SectionCard title="Article Info" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Title"
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Ranbir Kapoor’s Animal — The Psychology Behind the Rage"
                />
                <InputField
                  label="Slug"
                  required
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  placeholder="ranbir-kapoor-animal-psychology"
                />
                <SelectField
                  label="Category"
                  required
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="Bollywood">Bollywood</option>
                  <option value="Hollywood">Hollywood</option>
                  <option value="WebSeries">Web Series</option>
                  <option value="OTT">OTT Platforms</option>
                  <option value="BoxOffice">Box Office</option>
                  <option value="Celebrities">Celebrities</option>
                </SelectField>
                <SelectField
                  label="Content Type"
                  value={form.contentType}
                  onChange={(e) => update("contentType", e.target.value)}
                >
                  <option value="movie">Movie</option>
                  <option value="webseries">Web Series</option>
                </SelectField>
                <InputField
                  label="Movie/Series Title"
                  value={form.movieTitle}
                  onChange={(e) => update("movieTitle", e.target.value)}
                  placeholder="Animal"
                />
                <InputField
                  label="Release Year"
                  type="number"
                  value={form.releaseYear}
                  onChange={(e) => update("releaseYear", e.target.value)}
                  placeholder="2023"
                />
              </div>
            </SectionCard>

            <SectionCard title="Author & Status" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Author Name"
                  value={form.author.name}
                  onChange={(e) => update("author.name", e.target.value)}
                />
                <InputField
                  label="Author Role"
                  value={form.author.role}
                  onChange={(e) => update("author.role", e.target.value)}
                />
                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </SelectField>
                <InputField
                  label="Published Date"
                  type="date"
                  value={form.publishedAt ? new Date(form.publishedAt).toISOString().split('T')[0] : ""}
                  onChange={(e) => update("publishedAt", e.target.value)}
                />
              </div>
            </SectionCard>

            <SectionCard title="Cover Image" icon={ImageIcon}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 h-40 rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/50 flex items-center justify-center overflow-hidden relative group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer p-2 bg-red-500 rounded-full text-white">
                          <UploadCloud className="h-5 w-5" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                      {imageUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
                      <span className="text-xs font-medium uppercase tracking-wider">Upload Cover</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <InputField
                    label="Image URL (Manual)"
                    value={form.coverImage}
                    onChange={(e) => {
                      update("coverImage", e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://..."
                  />
                  <TextareaField
                    label="Summary"
                    value={form.summary}
                    onChange={(e) => update("summary", e.target.value)}
                    placeholder="Brief summary of the article..."
                    className="no-scrollbar"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        );

      case 1: // Content
        return (
          <div className="space-y-5">
            <SectionCard title="Article Content" icon={FileText}>
              <div className="space-y-4">
                {(form.sections || []).map((section, idx) => (
                  <div key={idx} className="relative p-4 bg-gray-900/30 border border-gray-800 rounded-lg group">
                    <button
                      onClick={() => removeArrayItem("sections", idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="space-y-3">
                      <InputField
                        label={`Heading ${idx + 1}`}
                        value={section.heading}
                        onChange={(e) => update(`sections.${idx}.heading`, e.target.value)}
                      />
                      <TextareaField
                        label="Content"
                        rows={6}
                        value={section.content}
                        onChange={(e) => update(`sections.${idx}.content`, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem("sections", { heading: "", content: "" })}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-500 hover:text-red-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Content Section
                </button>
              </div>
            </SectionCard>
          </div>
        );

      case 2: // Metadata
        return (
          <div className="space-y-5">
            <SectionCard title="Highlights & Verdict" icon={Award}>
              <div className="space-y-4">
                <InputField
                  label="Highlights (Comma separated)"
                  value={Array.isArray(form.highlights) ? form.highlights.join(", ") : form.highlights}
                  onChange={(e) => update("highlights", e.target.value)}
                  hint="Key takeaways from the article"
                />
                <TextareaField
                  label="Final Verdict"
                  value={form.verdict}
                  onChange={(e) => update("verdict", e.target.value)}
                  placeholder="Final thoughts..."
                />
              </div>
            </SectionCard>
            <SectionCard title="Tags" icon={Hash}>
              <InputField
                label="Tags (Comma separated)"
                value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
                onChange={(e) => update("tags", e.target.value)}
              />
            </SectionCard>
          </div>
        );

      case 3: // Stats
        return (
          <div className="space-y-5">
            <SectionCard title="Engagement Stats" icon={BarChart}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <InputField
                  label="Rating"
                  type="number"
                  step="0.1"
                  value={form.stats?.rating}
                  onChange={(e) => update("stats.rating", e.target.value)}
                  placeholder="e.g., 4.8"
                />
                <InputField
                  label="Read Time"
                  value={form.stats?.readTime}
                  onChange={(e) => update("stats.readTime", e.target.value)}
                  placeholder="e.g., 15 min read"
                /> */}
              </div>
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Article Management | Admin</title>
      </Head>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Article Management</h1>
            <p className="text-gray-400 text-sm">Create and manage editorial articles</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500 transition-all w-64"
              />
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-600/20"
            >
              <Plus className="h-4 w-4" />
              New Article
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingList ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="col-span-full py-20 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-500">
              <FileText className="h-10 w-10" />
              <p className="text-sm font-medium">No articles found</p>
              <button onClick={handleCreateNew} className="text-red-500 text-sm hover:underline">Create your first article</button>
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article._id}
                className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group"
              >
                <div className="aspect-video bg-gray-800 relative">
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-700" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      article.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {article.status}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => loadArticleForEdit(article)}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Overlay */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0a0f] border border-gray-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                    <PencilLine className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {editingId ? "Edit Article" : "Create New Article"}
                    </h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                      {tabs[activeTab].label}
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-gray-800 bg-gray-900/10">
                {tabs.map((tab, idx) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(idx)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative ${
                      activeTab === idx ? "text-red-500" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {activeTab === idx && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-black/20 no-scrollbar">

                {renderTabContent()}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/20 flex items-center justify-between">
                <button
                  onClick={() => setOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  {activeTab > 0 && (
                    <button
                      onClick={() => setActiveTab(activeTab - 1)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-300 border border-gray-800 hover:bg-gray-800 transition-all"
                    >
                      <ArrowLeft className="h-4 w-4" /> Previous
                    </button>
                  )}
                  {activeTab < tabs.length - 1 ? (
                    <button
                      onClick={() => setActiveTab(activeTab + 1)}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-all"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/20"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editingId ? "Update Article" : "Create Article"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
