"use client";
import { useState, useId, useCallback, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/AdminLayout";
import {
  Star, PencilLine, Plus, X,
  User, DollarSign, TrendingUp,
  Calendar, Briefcase, Home,
  FileText, HelpCircle, Award,
  Save, AlertCircle, CheckCircle,
  Image, Globe, Hash, BarChart,
  Clock, Shield, Crown, Film,
  Users, ArrowLeft, ArrowRight, UploadCloud, Search as SearchIcon, Loader2, MoreVertical, Trash2, Edit
} from "lucide-react";

// Input Components
const InputField = ({ icon: Icon, label, required, hint, onChange, value, ...props }) => {
  const generatedId = useId();
  const id = props.id || generatedId;
  const displayValue = typeof value === "number" ? String(value) : (value ?? "");

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
        </div>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          </div>
        )}
        <input
          {...props}
          id={id}
          name={id}
          autoComplete={props.autoComplete ?? "off"}
          value={displayValue}
          onChange={onChange}
          className={`w-full rounded-lg bg-gray-900/50 border border-gray-800 ${Icon ? 'pl-10' : 'px-4'} py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700`}
        />
      </div>
    </div>
  );
};

const SelectField = ({ icon: Icon, label, children, ...props }) => {
  const generatedId = useId();
  const id = props.id || generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          </div>
        )}
        <select
          {...props}
          id={id}
          name={id}
          className={`w-full rounded-lg bg-gray-900/50 border border-gray-800 ${Icon ? 'pl-10' : 'px-4'} py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700 appearance-none cursor-pointer`}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const TextareaField = ({ icon: Icon, label, onChange, value, ...props }) => {
  const generatedId = useId();
  const id = props.id || generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
            <Icon className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          </div>
        )}
        <textarea
          {...props}
          id={id}
          name={id}
          rows={props.rows || 3}
          value={value ?? ""}
          onChange={onChange}
          className={`w-full rounded-lg bg-gray-900/50 border border-gray-800 ${Icon ? 'pl-10' : 'px-4'} py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all hover:border-gray-700 resize-none`}
        />
      </div>
    </div>
  );
};

const ArrayCard = ({ children, onRemove, title }) => (
  <div className="relative p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
    {title && <h4 className="text-sm font-medium text-gray-300 mb-3">{title}</h4>}
    <button
      onClick={onRemove}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
    >
      <X className="h-3.5 w-3.5" />
    </button>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-gray-900/20 rounded-xl border border-gray-800 p-5 ${className}`}>
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
      <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-red-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
    </div>
    {children}
  </div>
);

const INITIAL_FORM = {
  heroSection: {
    name: "",
    profession: [],
    careerStage: "Peak",
    profileImage: "",
    nationality: "",
    industry: "",
    height: "",
    slug: "",
    filmsCount: "",
    awardsCount: "",
    growthPercentage: ""
  },
  netWorth: {
    title: "",
    year: "",
    description: "",
    currencyToggle: ["USD", "INR"],
    netWorthINR: { min: "", max: "", display: "" },
    netWorthUSD: { min: "", max: "", display: "" },
    lastUpdated: "",
    estimationNote: "",
    analysisSummary: ""
  },
  netWorthAnalysis: {
    estimatedRange: { min: "", max: "" },
    displayRange: "",
    currency: "",
    lastUpdated: "",
    description: ""
  },
  quickFacts: {
    age: "",
    birthDate: "",
    profession: [],
    activeSince: ""
  },
  netWorthCalculation: {
    incomeSources: []
  },
  netWorthTimeline: {
    timeline: [],
    keyMilestones: []
  },
  biographyTimeline: [],
  assets: [],
  celebrityComparisons: {
    comparisons: []
  },
  relatedIntelligence: [],
  faqs: [],
  netWorthDisclaimer: {
    title: "",
    description: "",
    highlights: []
  },
  premiumIntelligence: {
    title: "",
    description: "",
    primaryCTA: { label: "", link: "" },
    secondaryCTA: { label: "", link: "" },
    subscribeCTA: { label: "", link: "" },
    stats: { celebrityProfiles: "", monthlyReaders: "", accuracyRate: "" }
  }
};

export default function CelebrityModule() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  
  // List management
  const [celebrities, setCelebrities] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "networth", label: "Net Worth", icon: DollarSign },
    { id: "facts", label: "Quick Facts", icon: Calendar },
    { id: "income", label: "Income Sources", icon: BarChart },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "bio", label: "Biography", icon: FileText },
    { id: "assets", label: "Assets", icon: Home },
    { id: "compare", label: "Comparisons", icon: Users },
    { id: "related", label: "Related Intel", icon: TrendingUp },
    { id: "faq", label: "FAQs", icon: HelpCircle },
    { id: "disclaimer", label: "Disclaimer", icon: Shield },
  ];

  // Fetch list of celebrities
  const fetchCelebrities = useCallback(async () => {
    setLoadingList(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch(`/api/admin/celebrity/getCelebrity?q=${searchQuery}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (res.ok) {
        setCelebrities(data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch celebrities", e);
    } finally {
      setLoadingList(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCelebrities(), 300);
    return () => clearTimeout(timer);
  }, [fetchCelebrities]);

  const loadCelebrityForEdit = async (celeb) => {
    setEditingId(celeb._id);
    setForm({
      ...INITIAL_FORM,
      ...celeb,
      heroSection: { ...INITIAL_FORM.heroSection, ...celeb.heroSection },
      netWorth: { ...INITIAL_FORM.netWorth, ...celeb.netWorth },
      netWorthAnalysis: { ...INITIAL_FORM.netWorthAnalysis, ...celeb.netWorthAnalysis },
      quickFacts: { ...INITIAL_FORM.quickFacts, ...celeb.quickFacts },
      netWorthCalculation: { ...INITIAL_FORM.netWorthCalculation, ...celeb.netWorthCalculation },
      netWorthTimeline: { ...INITIAL_FORM.netWorthTimeline, ...celeb.netWorthTimeline },
      celebrityComparisons: { ...INITIAL_FORM.celebrityComparisons, ...celeb.celebrityComparisons },
      netWorthDisclaimer: { ...INITIAL_FORM.netWorthDisclaimer, ...celeb.netWorthDisclaimer },
      premiumIntelligence: { ...INITIAL_FORM.premiumIntelligence, ...celeb.premiumIntelligence },
    });
    setImagePreview(celeb.heroSection?.profileImage || "");
    setOpen(true);
    setActiveTab(0);
  };

  const handleDelete = async (celeb) => {
    if (!confirm(`Are you sure you want to delete ${celeb.heroSection?.name}? This action cannot be undone.`)) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch(`/api/admin/celebrity/delete?id=${celeb._id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to delete celebrity");
        return;
      }
      setSuccess("Celebrity deleted successfully!");
      fetchCelebrities();
    } catch (e) {
      setError("Failed to delete celebrity");
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

  const normalizePayload = () => {
    const f = JSON.parse(JSON.stringify(form));
    f.heroSection.filmsCount = parseNumber(f.heroSection.filmsCount);
    f.heroSection.awardsCount = parseNumber(f.heroSection.awardsCount);
    f.heroSection.growthPercentage = parseNumber(f.heroSection.growthPercentage);
    f.heroSection.profession = Array.isArray(f.heroSection.profession)
      ? f.heroSection.profession
      : String(f.heroSection.profession || "").split(",").map(s => s.trim()).filter(Boolean);
    f.quickFacts.age = parseNumber(f.quickFacts.age);
    f.quickFacts.activeSince = parseNumber(f.quickFacts.activeSince);
    f.quickFacts.profession = Array.isArray(f.quickFacts.profession)
      ? f.quickFacts.profession
      : String(f.quickFacts.profession || "").split(",").map(s => s.trim()).filter(Boolean);
    f.netWorth.year = parseNumber(f.netWorth.year);
    f.netWorth.netWorthINR.min = parseNumber(f.netWorth.netWorthINR.min);
    f.netWorth.netWorthINR.max = parseNumber(f.netWorth.netWorthINR.max);
    f.netWorth.netWorthUSD.min = parseNumber(f.netWorth.netWorthUSD.min);
    f.netWorth.netWorthUSD.max = parseNumber(f.netWorth.netWorthUSD.max);
    f.netWorthAnalysis.estimatedRange.min = parseNumber(f.netWorthAnalysis.estimatedRange.min);
    f.netWorthAnalysis.estimatedRange.max = parseNumber(f.netWorthAnalysis.estimatedRange.max);
    f.premiumIntelligence.stats.celebrityProfiles = parseNumber(f.premiumIntelligence.stats.celebrityProfiles);
    f.premiumIntelligence.stats.monthlyReaders = parseNumber(f.premiumIntelligence.stats.monthlyReaders);
    f.premiumIntelligence.stats.accuracyRate = parseNumber(f.premiumIntelligence.stats.accuracyRate);

    // Parse array item numbers
    if (Array.isArray(f.netWorthCalculation?.incomeSources)) {
      f.netWorthCalculation.incomeSources = f.netWorthCalculation.incomeSources.map(s => ({
        ...s,
        percentage: parseNumber(s.percentage)
      }));
    }
    if (Array.isArray(f.netWorthTimeline?.timeline)) {
      f.netWorthTimeline.timeline = f.netWorthTimeline.timeline.map(t => ({
        ...t,
        year: parseNumber(t.year),
        netWorth: String(t.netWorth || "") // Keep as string
      }));
    }
    if (Array.isArray(f.netWorthTimeline?.keyMilestones)) {
      f.netWorthTimeline.keyMilestones = f.netWorthTimeline.keyMilestones.map(m => ({
        ...m,
        year: parseNumber(m.year)
      }));
    }
    if (Array.isArray(f.celebrityComparisons?.comparisons)) {
      f.celebrityComparisons.comparisons = f.celebrityComparisons.comparisons.map(c => ({
        ...c,
        netWorth: parseNumber(c.netWorth)
      }));
    }

    return f;
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const payload = normalizePayload();
      
      const url = editingId ? `/api/admin/celebrity/update?id=${editingId}` : "/api/admin/celebrity/create";
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
        setError(data.message || `Failed to ${editingId ? 'update' : 'create'} celebrity`);
        setSubmitting(false);
        return;
      }
      setSuccess(`Celebrity ${editingId ? 'updated' : 'created'} successfully!`);
      setSubmitting(false);
      setOpen(false);
      setEditingId(null);
      fetchCelebrities();
    } catch (e) {
      setError("Unexpected error occurred");
      setSubmitting(false);
    }
  };


  const compressImage = async (dataUrl, maxSizeMB = 0.5) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      const maxDimension = 1200; // Max width/height
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
      
      // Compress to JPEG with quality setting
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
      resolve(compressedDataUrl);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
  });
};


  const formatUSD = (val) => {
    if (!val) return "";
    const n = Number(val);
    if (n >= 1000000000) return `$${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000) return `$${(n / 1000000).toFixed(0)}M`;
    return `$${n.toLocaleString()}`;
  };

  const formatINR = (val) => {
    if (!val) return "";
    const n = Number(val);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(0)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(0)} Lakh`;
    return `₹${n.toLocaleString()}`;
  };

  const handleUSDChange = (field, value) => {
    const usdVal = Number(value);
    const inrVal = usdVal * 83; // Current market rate approx
    
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.netWorth.netWorthUSD[field] = value;
      next.netWorth.netWorthINR[field] = inrVal;
      
      // Update display strings
      const min = Number(field === 'min' ? value : next.netWorth.netWorthUSD.min);
      const max = Number(field === 'max' ? value : next.netWorth.netWorthUSD.max);
      
      if (min && max) {
        next.netWorth.netWorthUSD.display = `${formatUSD(min)} - ${formatUSD(max)}`;
        next.netWorth.netWorthINR.display = `${formatINR(min * 83)} - ${formatINR(max * 83)}`;
      } else if (min || max) {
        const val = min || max;
        next.netWorth.netWorthUSD.display = formatUSD(val);
        next.netWorth.netWorthINR.display = formatINR(val * 83);
      }
      
      return next;
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Basic Info
        return (
          <div className="space-y-5">
            <SectionCard title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={User}
                  label="Full Name"
                  required
                  value={form.heroSection.name}
                  onChange={(e) => update("heroSection.name", e.target.value)}
                  placeholder="e.g., Shah Rukh Khan"
                />
                <InputField
                  icon={Hash}
                  label="Slug"
                  required
                  value={form.heroSection.slug}
                  onChange={(e) => update("heroSection.slug", e.target.value)}
                  placeholder="shah-rukh-khan"
                  hint="URL-friendly name"
                />
                <InputField
                  icon={Briefcase}
                  label="Profession(s)"
                  value={Array.isArray(form.heroSection.profession) ? form.heroSection.profession.join(", ") : form.heroSection.profession}
                  onChange={(e) => update("heroSection.profession", e.target.value)}
                  placeholder="Actor, Producer, TV Host"
                  hint="Comma separated"
                  className="md:col-span-2"
                />
                <InputField
                  icon={Globe}
                  label="Nationality"
                  value={form.heroSection.nationality}
                  onChange={(e) => update("heroSection.nationality", e.target.value)}
                  placeholder="Indian"
                />
                <InputField
                  icon={Briefcase}
                  label="Industry"
                  value={form.heroSection.industry}
                  onChange={(e) => update("heroSection.industry", e.target.value)}
                  placeholder="Bollywood"
                />
                <InputField
                  icon={User}
                  label="Height"
                  value={form.heroSection.height}
                  onChange={(e) => update("heroSection.height", e.target.value)}
                  placeholder="5'10&quot;"
                />
                <SelectField
                  icon={TrendingUp}
                  label="Career Stage"
                  value={form.heroSection.careerStage}
                  onChange={(e) => update("heroSection.careerStage", e.target.value)}
                >
                  <option value="Rising">Rising</option>
                  <option value="Peak">Peak</option>
                  <option value="Transition">Transition</option>
                  <option value="Active">Active</option>
                  <option value="Retired">Retired</option>
                </SelectField>
              </div>
            </SectionCard>

            <SectionCard title="Career Statistics" icon={Award}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  icon={Film}
                  label="Films Count"
                  value={form.heroSection.filmsCount}
                  onChange={(e) => update("heroSection.filmsCount", e.target.value)}
                  placeholder="80"
                  type="number"
                />
                <InputField
                  icon={Award}
                  label="Awards Count"
                  value={form.heroSection.awardsCount}
                  onChange={(e) => update("heroSection.awardsCount", e.target.value)}
                  placeholder="15"
                  type="number"
                />
                <InputField
                  icon={TrendingUp}
                  label="Growth %"
                  value={form.heroSection.growthPercentage}
                  onChange={(e) => update("heroSection.growthPercentage", e.target.value)}
                  placeholder="25"
                  type="number"
                />
              </div>
            </SectionCard>

            <SectionCard title="Media" icon={Image}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Upload Profile Image</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
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
                                body: JSON.stringify({ data: dataUrl, fileName: form.heroSection.slug || file.name })
                              });
                              const out = await res.json();
                              if (!res.ok) {
                                setError(out.message || "Image upload failed");
                              } else {
                                update("heroSection.profileImage", out.url);
                              }
                            } catch {
                              setError("Image upload failed");
                            } finally {
                              setImageUploading(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-800 px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div className="text-xs text-gray-500">Accepted: images. Stored locally and referenced by URL.</div>
                  </div>
                  <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900/30 min-h-32">
                    {imageUploading ? (
                      <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                        <UploadCloud className="h-4 w-4" />
                        Uploading...
                      </div>
                    ) : (
                      <>
                        {(imagePreview || form.heroSection.profileImage) ? (
                          <img
                            src={imagePreview || form.heroSection.profileImage}
                            alt="Preview"
                            className="max-h-40 rounded-md"
                          />
                        ) : (
                          <div className="text-gray-500 text-sm">No image selected</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        );

      case 1: // Net Worth
        return (
          <div className="space-y-5">
            <SectionCard title="Net Worth Overview" icon={DollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InputField
                  label="Title"
                  value={form.netWorth.title}
                  onChange={(e) => update("netWorth.title", e.target.value)}
                  placeholder="Shah Rukh Khan's Net Worth"
                />
                <InputField
                  label="Year"
                  value={form.netWorth.year}
                  onChange={(e) => update("netWorth.year", e.target.value)}
                  placeholder="2024"
                  type="number"
                />
              </div>
              <TextareaField
                label="Description"
                value={form.netWorth.description}
                onChange={(e) => update("netWorth.description", e.target.value)}
                placeholder="Detailed description of net worth..."
                rows={3}
              />
            </SectionCard>

            <SectionCard title="Net Worth Estimate (USD)" icon={DollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField
                  label="Minimum (USD)"
                  value={form.netWorth.netWorthUSD.min}
                  onChange={(e) => handleUSDChange('min', e.target.value)}
                  placeholder="850000000"
                  type="number"
                  hint="e.g., 850000000 for $850M"
                />
                <InputField
                  label="Maximum (USD)"
                  value={form.netWorth.netWorthUSD.max}
                  onChange={(e) => handleUSDChange('max', e.target.value)}
                  placeholder="900000000"
                  type="number"
                  hint="e.g., 900000000 for $900M"
                />
              </div>
            </SectionCard>

            <SectionCard title="Additional Information" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  icon={Calendar}
                  label="Last Updated"
                  value={form.netWorth.lastUpdated}
                  onChange={(e) => update("netWorth.lastUpdated", e.target.value)}
                  placeholder="2024-01-15"
                  type="date"
                />
                <InputField
                  icon={FileText}
                  label="Estimation Note"
                  value={form.netWorth.estimationNote}
                  onChange={(e) => update("netWorth.estimationNote", e.target.value)}
                  placeholder="Based on various sources..."
                />
              </div>
              <TextareaField
                label="Analysis Summary"
                value={form.netWorth.analysisSummary}
                onChange={(e) => update("netWorth.analysisSummary", e.target.value)}
                placeholder="Summary of net worth analysis..."
                rows={2}
                className="mt-4"
              />
            </SectionCard>
          </div>
        );

      case 2: // Quick Facts
        return (
          <SectionCard title="Quick Facts" icon={Calendar}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={Calendar}
                label="Age"
                value={form.quickFacts.age}
                onChange={(e) => update("quickFacts.age", e.target.value)}
                placeholder="58"
                type="number"
              />
              <InputField
                icon={Calendar}
                label="Birth Date"
                value={form.quickFacts.birthDate}
                onChange={(e) => update("quickFacts.birthDate", e.target.value)}
                placeholder="1965-11-02"
                type="date"
              />
              <InputField
                icon={Briefcase}
                label="Profession(s)"
                value={Array.isArray(form.quickFacts.profession) ? form.quickFacts.profession.join(", ") : form.quickFacts.profession}
                onChange={(e) => update("quickFacts.profession", e.target.value)}
                placeholder="Actor, Producer"
                hint="Comma separated"
                className="md:col-span-2"
              />
              <InputField
                icon={Calendar}
                label="Active Since"
                value={form.quickFacts.activeSince}
                onChange={(e) => update("quickFacts.activeSince", e.target.value)}
                placeholder="1988"
                type="number"
              />
            </div>
          </SectionCard>
        );

      case 3: // Income Sources
        return (
          <SectionCard title="Income Sources" icon={BarChart}>
            <div className="space-y-3">
              {(form.netWorthCalculation.incomeSources || []).map((source, idx) => (
                <ArrayCard
                  key={idx}
                  onRemove={() => removeArrayItem("netWorthCalculation.incomeSources", idx)}
                  title={`Source ${idx + 1}`}
                >
                  <InputField
                    label="SOURCE NAME"
                    value={source.sourceName}
                    onChange={(e) => update(`netWorthCalculation.incomeSources.${idx}.sourceName`, e.target.value)}
                    placeholder="Acting Fees & OTT"
                  />
                  <InputField
                    label="PERCENTAGE"
                    value={source.percentage}
                    onChange={(e) => update(`netWorthCalculation.incomeSources.${idx}.percentage`, e.target.value)}
                    placeholder="45"
                    type="number"
                  />
                  <InputField
                    label="DESCRIPTION"
                    value={source.description}
                    onChange={(e) => update(`netWorthCalculation.incomeSources.${idx}.description`, e.target.value)}
                    placeholder="Primary income from acting in 2-3 films annually"
                    className="md:col-span-2 lg:col-span-1"
                  />
                </ArrayCard>
              ))}
              <button
                onClick={() => addArrayItem("netWorthCalculation.incomeSources", { sourceName: "", percentage: "", description: "" })}
                className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Income Source
              </button>
            </div>
          </SectionCard>
        );

      case 4: // Timeline
        return (
          <div className="space-y-5">
            <SectionCard title="Yearly Net Worth Timeline" icon={TrendingUp}>
              <div className="space-y-3">
                {(form.netWorthTimeline.timeline || []).map((item, idx) => (
                  <ArrayCard key={idx} onRemove={() => removeArrayItem("netWorthTimeline.timeline", idx)}>
                    <InputField
                      label="Year"
                      value={item.year}
                      onChange={(e) => update(`netWorthTimeline.timeline.${idx}.year`, e.target.value)}
                      placeholder="2024"
                    />
                    <InputField
                      label="Net Worth"
                      value={item.netWorth}
                      onChange={(e) => update(`netWorthTimeline.timeline.${idx}.netWorth`, e.target.value)}
                      placeholder="$900M"
                      className="md:col-span-2"
                    />
                  </ArrayCard>
                ))}
                <button
                  onClick={() => addArrayItem("netWorthTimeline.timeline", { year: "", netWorth: "" })}
                  className="w-full mt-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Timeline Entry
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Key Milestones" icon={Award}>
              <div className="space-y-3">
                {(form.netWorthTimeline.keyMilestones || []).map((item, idx) => (
                  <ArrayCard key={idx} onRemove={() => removeArrayItem("netWorthTimeline.keyMilestones", idx)}>
                    <InputField
                      label="Year"
                      value={item.year}
                      onChange={(e) => update(`netWorthTimeline.keyMilestones.${idx}.year`, e.target.value)}
                      placeholder="2020"
                    />
                    <InputField
                      label="Milestone"
                      value={item.milestone}
                      onChange={(e) => update(`netWorthTimeline.keyMilestones.${idx}.milestone`, e.target.value)}
                      placeholder="Crossed $500M net worth"
                      className="md:col-span-2"
                    />
                  </ArrayCard>
                ))}
                <button
                  onClick={() => addArrayItem("netWorthTimeline.keyMilestones", { year: "", milestone: "" })}
                  className="w-full mt-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </button>
              </div>
            </SectionCard>
          </div>
        );

      case 5: // Biography
        return (
          <SectionCard title="Biography Timeline" icon={FileText}>
            <div className="space-y-3">
              {(form.biographyTimeline || []).map((item, idx) => (
                <ArrayCard key={idx} onRemove={() => removeArrayItem("biographyTimeline", idx)}>
                  <InputField
                    label="Period"
                    value={item.period}
                    onChange={(e) => update(`biographyTimeline.${idx}.period`, e.target.value)}
                    placeholder="1990-1995"
                  />
                  <InputField
                    label="Title"
                    value={item.title}
                    onChange={(e) => update(`biographyTimeline.${idx}.title`, e.target.value)}
                    placeholder="Early Career"
                  />
                  <InputField
                    label="Description"
                    value={item.description}
                    onChange={(e) => update(`biographyTimeline.${idx}.description`, e.target.value)}
                    placeholder="Main description"
                    className="md:col-span-2"
                  />
                  <InputField
                    label="Sub Description"
                    value={item.subDescription}
                    onChange={(e) => update(`biographyTimeline.${idx}.subDescription`, e.target.value)}
                    placeholder="Additional details"
                    className="md:col-span-2"
                  />
                </ArrayCard>
              ))}
              <button
                onClick={() => addArrayItem("biographyTimeline", { period: "", title: "", description: "", subDescription: "" })}
                className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Biography Entry
              </button>
            </div>
          </SectionCard>
        );

      // case 6: // Assets
      //   return (
      //     <SectionCard title="Assets" icon={Home}>
      //       <div className="space-y-3">
      //         {(form.assets || []).map((asset, idx) => (
      //           <ArrayCard key={idx} onRemove={() => removeArrayItem("assets", idx)}>
      //             <InputField
      //               label="Asset Name"
      //               value={asset.name}
      //               onChange={(e) => update(`assets.${idx}.name`, e.target.value)}
      //               placeholder="Mannat"
      //             />
      //             <InputField
      //               label="Location"
      //               value={asset.location}
      //               onChange={(e) => update(`assets.${idx}.location`, e.target.value)}
      //               placeholder="Mumbai"
      //             />
      //             <InputField
      //               label="Value"
      //               value={asset.value}
      //               onChange={(e) => update(`assets.${idx}.value`, e.target.value)}
      //               placeholder="$50M"
      //             />
      //             <InputField
      //               label="Description"
      //               value={asset.description}
      //               onChange={(e) => update(`assets.${idx}.description`, e.target.value)}
      //               placeholder="Brief description"
      //               className="md:col-span-2"
      //             />
      //             <InputField
      //               label="Image URL"
      //               value={asset.image}
      //               onChange={(e) => update(`assets.${idx}.image`, e.target.value)}
      //               placeholder="https://example.com/image.jpg"
      //               className="md:col-span-2"
      //             />
      //           </ArrayCard>
      //         ))}
      //         <button
      //           onClick={() => addArrayItem("assets", { name: "", location: "", value: "", description: "", image: "" })}
      //           className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
      //         >
      //           <Plus className="h-4 w-4" />
      //           Add Asset
      //         </button>
      //       </div>
      //     </SectionCard>
      //   );

      case 6: // Assets
  return (
    <SectionCard title="Assets" icon={Home}>
      <div className="space-y-3">
        {(form.assets || []).map((asset, idx) => (
          <ArrayCard key={idx} onRemove={() => removeArrayItem("assets", idx)}>
            <InputField
              label="Asset Name"
              value={asset.name}
              onChange={(e) => update(`assets.${idx}.name`, e.target.value)}
              placeholder="Mannat Bungalow"
            />
            <InputField
              label="Location"
              value={asset.location}
              onChange={(e) => update(`assets.${idx}.location`, e.target.value)}
              placeholder="Mumbai, India"
            />
            <InputField
              label="Value"
              value={asset.value}
              onChange={(e) => update(`assets.${idx}.value`, e.target.value)}
              placeholder="$30M"
            />
            <InputField
              label="Description"
              value={asset.description}
              onChange={(e) => update(`assets.${idx}.description`, e.target.value)}
              placeholder="Iconic 6-story sea-facing mansion in Bandra"
              className="md:col-span-2"
            />
            
            {/* Image Upload Section */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Asset Image
              </label>
              
              {/* Image Preview */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-32 h-32 rounded-lg border border-gray-800 bg-gray-900/30 overflow-hidden">
                  {asset.imageUploading ? (
                    <div className="h-full w-full flex flex-col items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500 mb-1" />
                      <span className="text-xs text-gray-500">Compressing...</span>
                    </div>
                  ) : asset.image ? (
                    <img 
                      src={asset.image.startsWith('http') ? asset.image : asset.image} 
                      alt={asset.name || "Asset preview"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        if (!asset.image.startsWith('http') && !asset.image.startsWith('/uploads')) {
                          e.target.src = `/uploads/${asset.image.split('/').pop()}`;
                        }
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
                
                {/* Upload Controls */}
                <div className="flex-1 space-y-3">
                  {/* File Upload with size warning */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        // Check file size (in MB)
                        const fileSizeMB = file.size / (1024 * 1024);
                        if (fileSizeMB > 5) {
                          setError(`File size (${fileSizeMB.toFixed(1)}MB) exceeds 5MB limit. Please choose a smaller image.`);
                          return;
                        }
                        
                        // Set uploading state for this specific asset
                        update(`assets.${idx}.imageUploading`, true);
                        setError(""); // Clear any previous errors
                        
                        try {
                          // Read file as data URL
                          const reader = new FileReader();
                          
                          const dataUrl = await new Promise((resolve, reject) => {
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                          });
                          
                          // Compress image if it's large
                          let processedDataUrl = dataUrl;
                          if (fileSizeMB > 1) {
                            update(`assets.${idx}.imageUploading`, true);
                            processedDataUrl = await compressImage(dataUrl, 0.5);
                          }
                          
                          // Create a clean filename
                          const baseName = (asset.name || form.heroSection?.name || 'asset')
                            .replace(/[^a-zA-Z0-9]/g, '_')
                            .toLowerCase()
                            .substring(0, 30);
                          const timestamp = Date.now();
                          const fileName = `${baseName}_${timestamp}`;
                          
                          // Upload to your API
                          const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
                          
                          const res = await fetch("/api/admin/upload", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: token ? `Bearer ${token}` : ""
                            },
                            body: JSON.stringify({ 
                              data: processedDataUrl, 
                              fileName: fileName 
                            })
                          });
                          
                          if (!res.ok) {
                            if (res.status === 413) {
                              throw new Error("Image too large. Please try a smaller image.");
                            }
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.message || "Image upload failed");
                          }
                          
                          const out = await res.json();
                          
                          // Update the asset with the returned URL path
                          update(`assets.${idx}.image`, out.url);
                          setSuccess("Image uploaded successfully!");
                          
                        } catch (error) {
                          console.error("Upload error:", error);
                          setError(error.message || "Image upload failed");
                        } finally {
                          update(`assets.${idx}.imageUploading`, false);
                          // Clear the file input
                          e.target.value = '';
                        }
                      }}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max file size: 5MB (will compress larger images)
                    </p>
                  </div>
                  
                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-800"></div>
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-800"></div>
                  </div>
                  
                  {/* URL Input as fallback */}
                  <InputField
                    label="Image URL (optional)"
                    value={asset.image || ''}
                    onChange={(e) => update(`assets.${idx}.image`, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    icon={Globe}
                  />
                  
                  {/* Display current image path */}
                  {asset.image && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 border border-gray-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate">{asset.image}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Remove this image?')) {
                            update(`assets.${idx}.image`, '');
                          }
                        }}
                        className="text-red-500 hover:text-red-400 flex-shrink-0 ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Upload a new image (will be compressed if needed) or provide a URL
                  </p>
                </div>
              </div>
            </div>
          </ArrayCard>
        ))}
        
        <button
          onClick={() => addArrayItem("assets", { 
            name: "", 
            location: "", 
            value: "", 
            description: "", 
            image: "",
            imageUploading: false 
          })}
          className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Asset
        </button>
      </div>
    </SectionCard>
  );

      case 7: // Comparisons
        return (
          <SectionCard title="Celebrity Comparisons" icon={Users}>
            <div className="space-y-3">
              {(form.celebrityComparisons.comparisons || []).map((comp, idx) => (
                <ArrayCard key={idx} onRemove={() => removeArrayItem("celebrityComparisons.comparisons", idx)}>
                  <InputField
                    label="Name"
                    value={comp.name}
                    onChange={(e) => update(`celebrityComparisons.comparisons.${idx}.name`, e.target.value)}
                    placeholder="Salman Khan"
                  />
                  <InputField
                    label="Slug"
                    value={comp.slug}
                    onChange={(e) => update(`celebrityComparisons.comparisons.${idx}.slug`, e.target.value)}
                    placeholder="salman-khan"
                  />
                  <InputField
                    label="Image URL"
                    value={comp.image}
                    onChange={(e) => update(`celebrityComparisons.comparisons.${idx}.image`, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <InputField
                    label="Net Worth"
                    value={comp.netWorth}
                    onChange={(e) => update(`celebrityComparisons.comparisons.${idx}.netWorth`, e.target.value)}
                    placeholder="800000000"
                    type="number"
                  />
                  <InputField
                    label="Display"
                    value={comp.netWorthDisplay}
                    onChange={(e) => update(`celebrityComparisons.comparisons.${idx}.netWorthDisplay`, e.target.value)}
                    placeholder="$800M"
                  />
                  <SelectField
                    label="Career Stage"
                    value={comp.careerStage}
                    onChange={(e) => update(`celebrityComparisons.comparisons.${idx}.careerStage`, e.target.value)}
                  >
                    <option value="Rising">Rising</option>
                    <option value="Peak">Peak</option>
                    <option value="Transition">Transition</option>
                  </SelectField>
                </ArrayCard>
              ))}
              <button
                onClick={() => addArrayItem("celebrityComparisons.comparisons", { name: "", slug: "", image: "", netWorth: "", netWorthDisplay: "", careerStage: "Peak" })}
                className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Comparison
              </button>
            </div>
          </SectionCard>
        );

      case 8: // Related Intelligence
        return (
          <SectionCard title="Related Intelligence" icon={TrendingUp}>
            <div className="space-y-3">
              {(form.relatedIntelligence || []).map((item, idx) => (
                <ArrayCard key={idx} onRemove={() => removeArrayItem("relatedIntelligence", idx)}>
                  <InputField
                    label="Category"
                    value={item.category}
                    onChange={(e) => update(`relatedIntelligence.${idx}.category`, e.target.value)}
                    placeholder="OTT / Box Office"
                  />
                  <InputField
                    label="Title"
                    value={item.title}
                    onChange={(e) => update(`relatedIntelligence.${idx}.title`, e.target.value)}
                    placeholder="Netflix Deal"
                  />
                  <TextareaField
                    label="Description"
                    value={item.description}
                    onChange={(e) => update(`relatedIntelligence.${idx}.description`, e.target.value)}
                    placeholder="Description of the intelligence entry..."
                    rows={2}
                    className="md:col-span-2"
                  />
                </ArrayCard>
              ))}
              <button
                onClick={() => addArrayItem("relatedIntelligence", { category: "", title: "", description: "" })}
                className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Intelligence Entry
              </button>
            </div>
          </SectionCard>
        );

      case 9: // FAQs
        return (
          <SectionCard title="Frequently Asked Questions" icon={HelpCircle}>
            <div className="space-y-3">
              {(form.faqs || []).map((faq, idx) => (
                <ArrayCard key={idx} onRemove={() => removeArrayItem("faqs", idx)}>
                  <InputField
                    label="Question"
                    value={faq.question}
                    onChange={(e) => update(`faqs.${idx}.question`, e.target.value)}
                    placeholder="What is their current net worth?"
                    className="md:col-span-1"
                  />
                  <TextareaField
                    label="Answer"
                    value={faq.answer}
                    onChange={(e) => update(`faqs.${idx}.answer`, e.target.value)}
                    placeholder="Their current net worth is estimated at..."
                    rows={2}
                    className="md:col-span-2"
                  />
                </ArrayCard>
              ))}
              <button
                onClick={() => addArrayItem("faqs", { question: "", answer: "" })}
                className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add FAQ
              </button>
            </div>
          </SectionCard>
        );

      case 10: // Disclaimer
        return (
          <div className="space-y-5">
            <SectionCard title="Disclaimer Information" icon={Shield}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Title"
                  value={form.netWorthDisclaimer.title}
                  onChange={(e) => update("netWorthDisclaimer.title", e.target.value)}
                  placeholder="Net Worth Disclaimer"
                />
                <InputField
                  label="Description"
                  value={form.netWorthDisclaimer.description}
                  onChange={(e) => update("netWorthDisclaimer.description", e.target.value)}
                  placeholder="All net worth figures are estimates..."
                />
              </div>
            </SectionCard>

            <SectionCard title="Disclaimer Highlights" icon={Shield}>
              <div className="space-y-3">
                {(form.netWorthDisclaimer.highlights || []).map((highlight, idx) => (
                  <ArrayCard key={idx} onRemove={() => removeArrayItem("netWorthDisclaimer.highlights", idx)}>
                    <InputField
                      label="Title"
                      value={highlight.title}
                      onChange={(e) => update(`netWorthDisclaimer.highlights.${idx}.title`, e.target.value)}
                      placeholder="Based on public sources"
                    />
                    <InputField
                      label="Description"
                      value={highlight.description}
                      onChange={(e) => update(`netWorthDisclaimer.highlights.${idx}.description`, e.target.value)}
                      placeholder="Detailed explanation"
                      className="md:col-span-2"
                    />
                  </ArrayCard>
                ))}
                <button
                  onClick={() => addArrayItem("netWorthDisclaimer.highlights", { title: "", description: "" })}
                  className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed border-gray-800 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Highlight
                </button>
              </div>
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Celebrity Management | FilmFire Admin</title>
      </Head>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Celebrity Management
              </h1>
              <p className="text-sm text-gray-400 mt-1">Create and update celebrity profiles with detailed information</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-white font-medium hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/20"
              >
                <Plus className="h-5 w-5" />
                <span>Create Celebrity</span>
              </button>
              {/* <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center"> */}
                {/* <Star className="h-5 w-5 text-red-500" /> */}
              {/* </div> */}
            </div>
          </div>

          {/* Update Section */}
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/50 to-transparent p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                <PencilLine className="h-4 w-4 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-200">Update Existing Celebrity</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  className="w-full rounded-xl bg-gray-900 border border-gray-800 pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Search celebrity by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingList ? (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading celebrities...</p>
                  </div>
                ) : celebrities.length > 0 ? (
                  celebrities.map((celeb) => (
                    <div key={celeb._id} className="relative group">
                      <button
                        onClick={() => loadCelebrityForEdit(celeb)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-red-500/50 hover:bg-gray-900 transition-all text-left"
                      >
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          {celeb.heroSection?.profileImage ? (
                            <img src={celeb.heroSection.profileImage} alt={celeb.heroSection.name} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          ) : (
                            <User className="h-full w-full p-2 text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0 pr-6">
                          <h4 className="text-sm font-semibold text-gray-200 truncate">{celeb.heroSection?.name || "Unnamed"}</h4>
                          <p className="text-xs text-gray-500 truncate">{celeb.heroSection?.slug}</p>
                        </div>
                      </button>

                      {/* Menu Button */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === celeb._id ? null : celeb._id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === celeb._id && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-gray-950 border border-gray-800 shadow-2xl z-30 py-1.5 overflow-hidden">
                              <button
                                onClick={() => {
                                  loadCelebrityForEdit(celeb);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-500" />
                                Edit Profile
                              </button>
                              <div className="h-px bg-gray-800 my-1 mx-2" />
                              <button
                                onClick={() => {
                                  handleDelete(celeb);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Profile
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 rounded-xl bg-gray-900/30 border border-gray-800 grid place-items-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">No celebrities found</p>
                      <p className="text-xs text-gray-600 mt-1">Try a different search or create a new profile</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          {success && (
            <div className="rounded-xl border border-green-600 bg-green-600/10 p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-600 bg-red-600/10 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute inset-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">{editingId ? 'Update' : 'Create New'} Celebrity Profile</h3>
                    <p className="text-xs text-gray-500">Step {activeTab + 1} of {tabs.length}: {tabs[activeTab].label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="border-b border-gray-800 bg-gray-900/50">
                <div className="grid grid-flow-col auto-cols-fr px-4">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = index === activeTab;
                    const isCompleted = index < activeTab;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(index)}
                        className={`flex items-center justify-center gap-2 px-2 py-3 border-b-2 transition-all ${isActive
                            ? 'border-red-500 text-red-500'
                            : isCompleted
                              ? 'border-transparent text-green-500 hover:text-gray-300'
                              : 'border-transparent text-gray-500 hover:text-gray-300'
                          }`}
                      >
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${isActive
                            ? 'bg-red-500/20 text-red-500'
                            : isCompleted
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-800 text-gray-500'
                          }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <span className="text-sm font-medium truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-gray-950">
                {renderTabContent()}
              </div>

              {/* Modal Footer with Navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <button
                  onClick={() => activeTab > 0 && setActiveTab(activeTab - 1)}
                  disabled={activeTab === 0}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 0
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-5 py-2.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all font-medium"
                  >
                    Cancel
                  </button>

                  {activeTab === tabs.length - 1 ? (
                    <button
                      onClick={submit}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{editingId ? 'Updating...' : 'Creating...'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>{editingId ? 'Update' : 'Create'} Celebrity</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => activeTab < tabs.length - 1 && setActiveTab(activeTab + 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/20"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
