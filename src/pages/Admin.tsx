import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  User, 
  signOut 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { Template, Category, SiteConfig, WorkImage } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  LogOut, 
  Upload, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  Settings,
  Images,
  X
} from "lucide-react";
import imageCompression from "browser-image-compression";

const ADMIN_EMAIL = "haroofcalligraphy@gmail.com";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"templates" | "gallery" | "settings">("templates");
  
  // Status states
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // --- TEMPLATE TAB STATES ---
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  // Design Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState(149);
  const [category, setCategory] = useState<Category>("Islamic");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- GALLERY TAB STATES ---
  const [galleryImages, setGalleryImages] = useState<WorkImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);

  // --- SITE SETTINGS TAB STATES ---
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState<SiteConfig>({
    heroTitle: "",
    heroSubtitle: "",
    conceptText: "",
    whatsappNumber: "",
    orderEmail: "",
    seoTitle: "",
    seoDescription: ""
  });

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync templates
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Template));
      setTemplates(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "templates");
    });

    return () => unsubscribe();
  }, [user]);

  // Sync workGallery
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const q = query(collection(db, "workGallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WorkImage));
      setGalleryImages(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "workGallery");
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch site config on settings tab open
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL || activeTab !== "settings") return;

    async function fetchSettings() {
      setSettingsLoading(true);
      try {
        const configDoc = await getDoc(doc(db, "config", "site"));
        if (configDoc.exists()) {
          const data = configDoc.data() as SiteConfig;
          setSettingsForm({
            heroTitle: data.heroTitle || "",
            heroSubtitle: data.heroSubtitle || "",
            conceptText: data.conceptText || "",
            whatsappNumber: data.whatsappNumber || "",
            orderEmail: data.orderEmail || "",
            seoTitle: data.seoTitle || "",
            seoDescription: data.seoDescription || ""
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setSettingsLoading(false);
      }
    }

    fetchSettings();
  }, [user, activeTab]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  // Template Form File Change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Gallery Form File Change
  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGalleryImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Template Edit trigger
  const handleStartEdit = (template: Template) => {
    setEditingTemplate(template);
    setName(template.name);
    setPrice(template.price || 149);
    setCategory(template.category);
    setImagePreview(template.imageUrl);
    setImageFile(null); // Clear pending file uploads, default to reusing current URL
    setStatus(null);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setName("");
    setPrice(149);
    setCategory("Islamic");
    setImageFile(null);
    setImagePreview(null);
    setStatus(null);
  };

  // Compile and upload images Helper
  const compressAndUpload = async (file: File) => {
    console.log("Starting image compression...");
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true
    };
    const compressedFile = await imageCompression(file, options);
    console.log("Compression done:", compressedFile.size, "bytes");

    const formData = new FormData();
    formData.append("file", compressedFile);

    console.log("Sending fetch request to /api/upload...");
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    }).catch(err => {
      console.error("Upload fetch failed:", err);
      throw new Error(`Connection failed: ${err.message}. The server might be restarting or unreachable.`);
    });

    if (!uploadRes.ok) {
      let errorMessage = `Upload failed with status ${uploadRes.status}`;
      try {
        const contentType = uploadRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await uploadRes.json();
          errorMessage = data.error || errorMessage;
        } else {
          const text = await uploadRes.text();
          errorMessage = `Server Error (${uploadRes.status}): ${text.slice(0, 100)}`;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }

    const responseText = await uploadRes.text();
    const responseData = JSON.parse(responseText);
    return responseData.url;
  };

  // Add / Edit Template Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (!editingTemplate && !imageFile) {
      setStatus({ type: 'error', message: "Please select an image for the new design" });
      return;
    }

    setFormLoading(true);
    setStatus(null);

    try {
      let finalImageUrl = imagePreview || "";

      // If new image file is chosen, upload it
      if (imageFile) {
        const uploadedUrl = await compressAndUpload(imageFile);
        
        // If editing template, delete old image file first
        if (editingTemplate && editingTemplate.imageUrl) {
          try {
            await fetch("/api/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: editingTemplate.imageUrl }),
            });
          } catch (delErr) {
            console.error("Could not delete old image:", delErr);
          }
        }
        
        finalImageUrl = uploadedUrl;
      }

      if (editingTemplate) {
        // UPDATE MODE
        const templateRef = doc(db, "templates", editingTemplate.id);
        const updatedFields = {
          name,
          price,
          category,
          imageUrl: finalImageUrl,
          // Preserve createdAt
          createdAt: editingTemplate.createdAt || Date.now()
        };
        
        await setDoc(templateRef, updatedFields, { merge: true });
        setStatus({ type: 'success', message: `Design "${name}" updated successfully!` });
        handleCancelEdit();
      } else {
        // CREATE MODE
        const newTemplate = {
          name,
          price,
          category,
          imageUrl: finalImageUrl,
          createdAt: Date.now(),
        };

        await addDoc(collection(db, "templates"), newTemplate);
        setStatus({ type: 'success', message: "Design template added successfully!" });
        
        // Reset Form
        setName("");
        setPrice(149);
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      setStatus({ type: 'error', message: error.message || "Failed to save template" });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Template Catalog
  const handleDelete = async (template: Template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "templates", template.id));
      
      // Attempt to delete from Vercel Blob
      if (template.imageUrl) {
        await fetch("/api/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: template.imageUrl }),
        });
      }
      setStatus({ type: 'success', message: "Design template deleted successfully." });
    } catch (error: any) {
      console.error("Delete error:", error);
      setStatus({ type: 'error', message: error.message || "Failed to delete template" });
    }
  };

  // Submit Gallery Action
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImageFile) {
      setStatus({ type: 'error', message: "Please select an image to upload for gallery" });
      return;
    }

    setGalleryLoading(true);
    setStatus(null);

    try {
      const uploadedUrl = await compressAndUpload(galleryImageFile);
      
      const newWorkImage = {
        imageUrl: uploadedUrl,
        createdAt: Date.now()
      };

      await addDoc(collection(db, "workGallery"), newWorkImage);
      
      setGalleryImageFile(null);
      setGalleryImagePreview(null);
      setStatus({ type: 'success', message: "Finished work uploaded to gallery successfully!" });
    } catch (error: any) {
      console.error("Gallery upload error:", error);
      setStatus({ type: 'error', message: error.message || "Failed to upload to gallery" });
    } finally {
      setGalleryLoading(false);
    }
  };

  // Delete Gallery Action
  const handleGalleryDelete = async (image: WorkImage) => {
    if (!window.confirm("Are you sure you want to delete this finished work from the gallery?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "workGallery", image.id));
      
      // Delete from Vercel Blob
      if (image.imageUrl) {
        await fetch("/api/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: image.imageUrl }),
        });
      }
      setStatus({ type: 'success', message: "Gallery image deleted successfully." });
    } catch (error: any) {
      console.error("Gallery delete error:", error);
      setStatus({ type: 'error', message: error.message || "Failed to delete gallery image" });
    }
  };

  // Save Site Configuration
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setStatus(null);

    try {
      const siteConfigRef = doc(db, "config", "site");
      await setDoc(siteConfigRef, settingsForm, { merge: true });
      setStatus({ type: 'success', message: "Site settings updated successfully!" });
    } catch (error: any) {
      console.error("Settings save error:", error);
      setStatus({ type: 'error', message: error.message || "Failed to save site settings" });
    } finally {
      setSettingsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-deep" size={32} />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl border border-gold/10 text-center">
          <h1 className="text-3xl font-serif text-emerald-deep mb-4">Admin Access</h1>
          <p className="text-ink/60 mb-8 font-light">Please sign in with the authorized administrator account.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-deep text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone selection:bg-emerald-deep selection:text-gold">
      {/* Navigation */}
      <nav className="bg-emerald-deep text-white px-8 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-50 gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={24} className="text-gold" />
          <h1 className="text-xl font-serif tracking-wide">HUROOF Studio Admin</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-light opacity-80">{user.email}</span>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Modern Dashboard Admin Tab-Bar */}
      <div className="flex justify-center border-b border-gold/10 bg-white/70 backdrop-blur-md px-12 py-4 gap-8 text-xs font-bold sticky top-[72px] z-40 shadow-sm">
        <button 
          onClick={() => { setActiveTab("templates"); setStatus(null); }}
          className={`pb-2 px-4 transition-all uppercase tracking-[0.2em] relative ${activeTab === 'templates' ? 'text-emerald-deep' : 'text-emerald-deep/40 hover:text-emerald-deep'}`}
        >
          Design Catalogs
          {activeTab === 'templates' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
          )}
        </button>
        <button 
          onClick={() => { setActiveTab("gallery"); setStatus(null); }}
          className={`pb-2 px-4 transition-all uppercase tracking-[0.2em] relative ${activeTab === 'gallery' ? 'text-emerald-deep' : 'text-emerald-deep/40 hover:text-emerald-deep'}`}
        >
          Completed Works
          {activeTab === 'gallery' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
          )}
        </button>
        <button 
          onClick={() => { setActiveTab("settings"); setStatus(null); }}
          className={`pb-2 px-4 transition-all uppercase tracking-[0.2em] relative ${activeTab === 'settings' ? 'text-emerald-deep' : 'text-emerald-deep/40 hover:text-emerald-deep'}`}
        >
          Site Settings
          {activeTab === 'settings' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
          )}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Universal Info Status banner */}
        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-5 rounded-2xl mb-8 shadow-sm flex items-center justify-between border ${
                status.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {status.type === 'success' ? <CheckCircle2 size={22} className="text-emerald-600" /> : <AlertCircle size={22} className="text-red-600" />}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
              <button onClick={() => setStatus(null)} className="opacity-60 hover:opacity-100 p-1">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. DESIGN TEMPLATES TAB */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
            {/* Left: Designer Create/Edit Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold/10 sticky top-36">
                <div className="flex justify-between items-center mb-6 border-b border-cream pb-4">
                  <h2 className="text-xl font-serif text-emerald-deep">
                    {editingTemplate ? "Edit Design Template" : "Add Design Template"}
                  </h2>
                  {editingTemplate && (
                    <button 
                      onClick={handleCancelEdit}
                      className="text-xs uppercase tracking-widest text-red-500 hover:text-red-600 font-bold flex items-center gap-1"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Template Name</label>
                    <input 
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm"
                      placeholder="e.g., Floral Thuluth"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Starting Price (₹)</label>
                      <input 
                        required
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm"
                      >
                        <option value="Islamic">Islamic Calligraphy</option>
                        <option value="Name">Name Calligraphy</option>
                        <option value="Wedding">Wedding Calligraphy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">
                      {editingTemplate ? "Update Image (Optional)" : "Design Image"}
                    </label>
                    <div className="relative group">
                      <input 
                        required={!editingTemplate && !imagePreview}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-gold/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-stone/20 group-hover:bg-cream/40 transition-all">
                        {imagePreview ? (
                          <div className="relative w-full aspect-square">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-emerald-deep/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                              <Upload className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon size={32} className="text-gold/40" />
                            <span className="text-xs text-emerald-deep/50 uppercase tracking-widest font-bold">Click to Upload</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={formLoading}
                    className="w-full bg-emerald-deep text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-deep/95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Saving Design...</span>
                      </>
                    ) : (
                      <>
                        {editingTemplate ? <Pencil size={16} /> : <Plus size={16} />}
                        <span>{editingTemplate ? "Update Template" : "Save Template"}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Design Lists with Edit/Delete capabilities */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-emerald-deep">Available Designs</h2>
                <span className="text-xs uppercase tracking-[0.15em] text-emerald-deep/40 font-bold">{templates.length} Total Designs</span>
              </div>

              {templates.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gold/10">
                  <p className="text-md font-light text-emerald-deep/50">No designs created yet. Add your first design catalog to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <AnimatePresence>
                    {templates.map((template) => (
                      <motion.div 
                        key={template.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`bg-white p-6 rounded-2xl shadow-sm border group flex flex-col transition-all relative ${editingTemplate?.id === template.id ? 'ring-2 ring-gold border-gold' : 'border-gold/10'}`}
                      >
                        <div className="relative aspect-square bg-cream/30 rounded-xl overflow-hidden mb-6 flex items-center justify-center p-4">
                          <img 
                            src={template.imageUrl} 
                            alt={template.name}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          {/* Super Premium Action bar on Hover */}
                          <div className="absolute inset-0 bg-emerald-deep/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300">
                            <button 
                              onClick={() => handleStartEdit(template)}
                              className="p-3 bg-white text-emerald-deep rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                              title="Edit Details & Price"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(template)}
                              className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                              title="Delete Design"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] uppercase tracking-widest text-gold font-bold">{template.category}</span>
                            {editingTemplate?.id === template.id && (
                              <span className="text-[9px] bg-gold/20 text-gold-800 px-2 py-0.5 rounded font-black tracking-widest uppercase">Currently Editing</span>
                            )}
                          </div>
                          <h3 className="text-lg font-serif text-emerald-deep mb-1">{template.name}</h3>
                          <p className="text-sm font-semibold text-emerald-deep/80 text-gold-600">Starting at ₹{template.price || 149}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. COMPLETED WORKS TAB */}
        {activeTab === "gallery" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
            {/* Left Column: Gallery Image Upload form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold/10 sticky top-36">
                <h2 className="text-xl font-serif text-emerald-deep mb-6 pb-4 border-b border-cream">Upload Completed Work</h2>
                
                <form onSubmit={handleGallerySubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Finished Work Photo</label>
                    <div className="relative group">
                      <input 
                        required
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-gold/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-stone/20 group-hover:bg-cream/40 transition-all">
                        {galleryImagePreview ? (
                          <div className="relative w-full aspect-square">
                            <img 
                              src={galleryImagePreview} 
                              alt="Gallery Preview" 
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-emerald-deep/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                              <Upload className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon size={32} className="text-gold/40" />
                            <span className="text-xs text-emerald-deep/50 uppercase tracking-widest font-bold">Select Photo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={galleryLoading}
                    className="w-full bg-emerald-deep text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-deep/95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                  >
                    {galleryLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Add to Gallery</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Existing Completed Works Grid with delete */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-emerald-deep">Completed Works Gallery</h2>
                <span className="text-xs uppercase tracking-[0.15em] text-emerald-deep/40 font-bold">{galleryImages.length} Photos</span>
              </div>

              {galleryImages.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gold/10">
                  <p className="text-md font-light text-emerald-deep/50">No photos in the gallery yet. Upload some finished works!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {galleryImages.map((img) => (
                      <motion.div 
                        key={img.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="aspect-square bg-white rounded-2xl overflow-hidden border border-gold/10 group relative shadow-sm"
                      >
                        <img 
                          src={img.imageUrl} 
                          alt="completed writing" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {/* Overlay delete */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                          <button 
                            onClick={() => handleGalleryDelete(img)}
                            className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 active:scale-95 transition-all"
                            title="Delete Photo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SITE SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gold/10 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-cream">
              <div className="flex items-center gap-3">
                <Settings className="text-gold" size={24} />
                <h2 className="text-2xl font-serif text-emerald-deep">Alter Site Configuration</h2>
              </div>
              <span className="text-xs uppercase tracking-widest text-emerald-deep/40 font-bold">Main Settings</span>
            </div>

            {settingsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-gold" size={36} />
                <p className="text-sm font-light uppercase tracking-widest text-emerald-deep/50">Fetching dynamic config...</p>
              </div>
            ) : (
              <form onSubmit={handleSettingsSubmit} className="space-y-8">
                {/* Contact configurations */}
                <div className="bg-stone/20 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-xs uppercase tracking-widest text-gold font-bold mb-2">Order Integrations</h3>
                    <p className="text-xs text-emerald-deep/50 font-light mb-4">
                      Define the WhatsApp phone number and contact email which users will see on all support links and floating actions.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">WhatsApp Number</label>
                    <input 
                      required
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full bg-stone/40 border border-gold/15 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm"
                      placeholder="e.g., +91 95411 20459"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Order Email</label>
                    <input 
                      required
                      type="email"
                      value={settingsForm.orderEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, orderEmail: e.target.value })}
                      className="w-full bg-stone/40 border border-gold/15 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm"
                      placeholder="order@huroof.com"
                    />
                  </div>
                </div>

                {/* Hero section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-xs uppercase tracking-widest text-gold font-bold">Landing Page Headers</h3>
                    <hr className="border-cream/40 my-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Hero Title (Main Header)</label>
                    <input 
                      required
                      type="text"
                      value={settingsForm.heroTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                      className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm"
                      placeholder="Every Letter Tells a Story"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Hero Subtitle</label>
                    <textarea 
                      required
                      rows={2}
                      value={settingsForm.heroSubtitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                      className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm resize-none"
                      placeholder="Preserve memories, love, and faith..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Our Story (Philosophy Narrative)</label>
                    <textarea 
                      required
                      rows={4}
                      value={settingsForm.conceptText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, conceptText: e.target.value })}
                      className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm resize-none"
                      placeholder="In a world of mass production, HUROOF stands..."
                    />
                  </div>
                </div>

                {/* Search Engine Optimization */}
                <div className="bg-cream/30 p-6 rounded-2xl grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-gold font-bold mb-1">Search Engine Optimization (SEO)</h3>
                    <p className="text-[11px] text-emerald-deep/50 mb-4 font-light">Custom titles and snippets displayed on search results and shared browser tags.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">SEO Meta Title</label>
                    <input 
                      type="text"
                      value={settingsForm.seoTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seoTitle: e.target.value })}
                      className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm"
                      placeholder="e.g., HUROOF | Sacred Calligraphy Art Collective"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">SEO Meta Description</label>
                    <textarea 
                      rows={2}
                      value={settingsForm.seoDescription || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, seoDescription: e.target.value })}
                      className="w-full bg-stone/30 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-gold transition-all text-sm resize-none"
                      placeholder="e.g., Transforming the ancient beauty of calligraphy into personalized art frames..."
                    />
                  </div>
                </div>

                {/* Submit settings button */}
                <div className="flex justify-end gap-4 border-t border-cream pt-6">
                  <button 
                    type="submit"
                    disabled={settingsLoading}
                    className="bg-emerald-deep text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-deep/95 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                  >
                    {settingsLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        <span>Updating Changes...</span>
                      </div>
                    ) : (
                      "Apply Configurations"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
