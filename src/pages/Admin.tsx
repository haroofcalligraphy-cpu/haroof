import { useState, useEffect, type FormEvent } from "react";
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { db, storage, auth, googleProvider, handleFirestoreError } from "@/src/lib/firebase";
import { Template, Category, WorkImage } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Plus, LogOut, Image as ImageIcon, Loader2, Grid } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [workImages, setWorkImages] = useState<WorkImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingWorkId, setDeletingWorkId] = useState<string | null>(null);
  
  // Form state for Site Config
  const [config, setConfig] = useState<any>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Form state for Templates
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("149");
  const [newCategory, setNewCategory] = useState<Category>("Islamic");
  const [newFile, setNewFile] = useState<File | null>(null);

  const adminEmail = "haroofcalligraphy@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === adminEmail) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const configUnsubscribe = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data());
      } else {
        setConfig({
          heroTitle: "Every Letter Tells a Story",
          heroSubtitle: "Preserve memories, love, and faith through timeless premium calligraphy gift frames.",
          conceptText: "In a world of mass production, HUROOF stands for the sacred beauty of the written word...",
          conceptImageUrl: "",
          heroImageUrl: "",
          // @ts-ignore
          whatsappNumber: (import.meta as any).env.VITE_WHATSAPP_NUMBER || "",
          // @ts-ignore
          orderEmail: (import.meta as any).env.VITE_ORDER_EMAIL || ""
        });
      }
    });

    const templatesQuery = query(collection(db, "templates"));
    const templatesUnsubscribe = onSnapshot(templatesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Template));
      setTemplates(data);
    });

    const workGalleryQuery = query(collection(db, "workGallery"));
    const workGalleryUnsubscribe = onSnapshot(workGalleryQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WorkImage));
      setWorkImages(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => {
      configUnsubscribe();
      templatesUnsubscribe();
      workGalleryUnsubscribe();
    };
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== adminEmail) {
        await signOut(auth);
        alert(`Unauthorized: Only ${adminEmail} can access this portal.`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Failed to authenticate with Google");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSavingConfig(true);
    try {
      await setDoc(doc(db, "config", "site"), config);
      alert("Configuration updated successfully");
    } catch (err) {
      // @ts-ignore
      handleFirestoreError(err, "write", "config/site");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const uploadImage = async (file: File, oldUrl?: string): Promise<string> => {
    // 0. Image Optimization
    const options = {
      maxSizeMB: 0.8, // Max 800KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.85
    };
    
    let fileToUpload = file;
    try {
      // Don't compress if file is already small
      if (file.size > 200 * 1024) {
        fileToUpload = await imageCompression(file, options);
      }
    } catch (error) {
      console.warn("Image compression failed, using original:", error);
    }

    // 1. Cleanup old image if it exists
    if (oldUrl && oldUrl.includes("public.blob.vercel-storage.com")) {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: oldUrl }),
      }).catch(err => console.warn("Blob deletion hint:", err));
    }

    // 2. Upload new image
    const formData = new FormData();
    formData.append("file", fileToUpload);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Upload failed");
    }
    
    const { url } = await response.json();
    return url;
  };

  const handleConceptImageUpload = async (file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file, config.conceptImageUrl);
      setConfig({ ...config, conceptImageUrl: url });
      alert("Concept image uploaded! Remember to save settings.");
    } catch (err) {
      console.error("Config upload error:", err);
      alert(`Config upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file, config.heroImageUrl);
      setConfig({ ...config, heroImageUrl: url });
      alert("Hero background uploaded! Remember to save settings.");
    } catch (err) {
      console.error("Hero upload error:", err);
      alert(`Hero upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file, config.logoUrl);
      setConfig({ ...config, logoUrl: url });
      alert("Logo uploaded! Remember to save settings.");
    } catch (err) {
      alert(`Logo upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file, config.faviconUrl);
      setConfig({ ...config, faviconUrl: url });
      alert("Favicon uploaded! Remember to save settings.");
    } catch (err) {
      alert(`Favicon upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkImageUpload = async (file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file);
      await addDoc(collection(db, "workGallery"), {
        imageUrl: url,
        createdAt: Date.now()
      });
      alert("Gallery image added!");
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkImage = async (image: WorkImage) => {
    if (!window.confirm("Are you sure you want to delete this gallery image?")) return;

    setDeletingWorkId(image.id);
    try {
      if (image.imageUrl && image.imageUrl.includes("public.blob.vercel-storage.com")) {
        await fetch("/api/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: image.imageUrl }),
        }).catch(err => console.warn("Blob deletion hint:", err));
      }
      await deleteDoc(doc(db, "workGallery", image.id));
    } catch (err) {
      // @ts-ignore
      handleFirestoreError(err, "delete", `workGallery/${image.id}`);
    } finally {
      setDeletingWorkId(null);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newFile) {
      alert("Please select an image file.");
      return;
    }
    if (!newName.trim()) {
      alert("Please enter a template name.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload to Vercel Blob (via optimized helper)
      const url = await uploadImage(newFile);

      // 2. Save metadata to Firestore
      const priceVal = parseFloat(newPrice);
      const templateData = {
        name: newName.trim(),
        category: newCategory,
        imageUrl: url,
        price: isNaN(priceVal) ? 149 : priceVal,
        createdAt: Date.now(),
        blobUrl: url // Keeping track for deletion if needed
      };

      await addDoc(collection(db, "templates"), templateData);

      setNewName("");
      setNewPrice("149");
      setNewFile(null);
      alert("Template uploaded successfully!");
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: Template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) return;

    setDeletingId(template.id);
    try {
      // 1. Delete from Vercel Blob if URL exists
      if (template.imageUrl && template.imageUrl.includes("public.blob.vercel-storage.com")) {
        await fetch("/api/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: template.imageUrl }),
        }).catch(err => console.warn("Blob deletion hint:", err));
      }
      
      // 2. Delete from Firestore
      await deleteDoc(doc(db, "templates", template.id));
    } catch (err) {
      // @ts-ignore
      handleFirestoreError(err, "delete", `templates/${template.id}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen luxury-gradient flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen luxury-gradient flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl text-center"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-emerald-deep mb-2">Admin Access</h1>
            <p className="text-ink/40 text-sm uppercase tracking-widest font-bold">HUROOF PORTAL</p>
          </div>
          
          <p className="text-emerald-deep/60 text-sm mb-8">
            Sign in with the authorized Google account to manage your gallery and site configuration.
          </p>

          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-emerald-deep text-white font-bold rounded-xl hover:bg-emerald-deep/90 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-deep/5 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif text-emerald-deep">Dashboard</h1>
            <p className="text-emerald-deep/60">Manage your calligraphy collection</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-deep font-bold rounded-xl hover:bg-emerald-deep hover:text-white transition-all shadow-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Settings Section */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-deep/5 h-fit">
            <h2 className="text-xl font-serif mb-8 flex items-center gap-2">
              <Plus size={24} className="gold-text" />
              Site Settings
            </h2>
            {config && (
              <form onSubmit={handleSaveConfig} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Logo (Header/Footer)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-deep/5 overflow-hidden border border-gold/20 shrink-0 p-2">
                      {config.logoUrl ? (
                        <img src={config.logoUrl} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-deep/20 font-serif text-xs">
                          LOGO
                        </div>
                      )}
                    </div>
                    <label className="flex-1 px-4 py-2 border border-gold/30 rounded-xl text-xs font-bold text-emerald-deep cursor-pointer hover:bg-gold/5 transition-all text-center">
                      Change Logo
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Hero Title</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                    value={config.heroTitle}
                    onChange={(e) => setConfig({...config, heroTitle: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Hero Background Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-deep/5 overflow-hidden border border-gold/20 shrink-0">
                      {config.heroImageUrl ? (
                        <img src={config.heroImageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-deep/20">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <label className="flex-1 px-4 py-2 border border-gold/30 rounded-xl text-xs font-bold text-emerald-deep cursor-pointer hover:bg-gold/5 transition-all text-center">
                      Change Hero Background
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleHeroImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Hero Subtitle</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold min-h-[100px]"
                    value={config.heroSubtitle}
                    onChange={(e) => setConfig({...config, heroSubtitle: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Concept Text (Markdown supported)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold min-h-[150px]"
                    value={config.conceptText}
                    onChange={(e) => setConfig({...config, conceptText: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Concept Section Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-deep/5 overflow-hidden border border-gold/20 shrink-0">
                      {config.conceptImageUrl ? (
                        <img src={config.conceptImageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-deep/20">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <label className="flex-1 px-4 py-2 border border-gold/30 rounded-xl text-xs font-bold text-emerald-deep cursor-pointer hover:bg-gold/5 transition-all text-center">
                      Change Image
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleConceptImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Site Favicon</label>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-deep/5 overflow-hidden border border-gold/20 shrink-0 flex items-center justify-center">
                      {config.faviconUrl ? (
                        <img src={config.faviconUrl} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-deep/20">
                          <ImageIcon size={14} />
                        </div>
                      )}
                    </div>
                    <label className="flex-1 px-4 py-2 border border-gold/30 rounded-xl text-xs font-bold text-emerald-deep cursor-pointer hover:bg-gold/5 transition-all text-center">
                      Change Favicon
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFaviconUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">SEO Title</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                    value={config.seoTitle || ""}
                    placeholder="HUROOF | Art Collective"
                    onChange={(e) => setConfig({...config, seoTitle: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">SEO Description</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold min-h-[80px]"
                    value={config.seoDescription || ""}
                    placeholder="Sacred calligraphy art for your home."
                    onChange={(e) => setConfig({...config, seoDescription: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">WhatsApp</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold text-sm"
                      value={config.whatsappNumber}
                      onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Email</label>
                    <input 
                      type="email"
                      className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold text-sm"
                      value={config.orderEmail}
                      onChange={(e) => setConfig({...config, orderEmail: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  disabled={isSavingConfig || loading}
                  className="w-full py-4 bg-gradient-to-r from-gold via-gold/80 to-gold text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 active:scale-[0.98] relative overflow-hidden group shadow-lg"
                >
                  <span className="relative z-10">{isSavingConfig ? "Saving..." : "Save All Changes"}</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                </button>
              </form>
            )}
          </section>

          {/* Upload Section */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-deep/5 h-fit">
            <h2 className="text-xl font-serif mb-8 flex items-center gap-2">
              <Plus size={24} className="gold-text" />
              Add New Template
            </h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Template Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Royal Wedding Script"
                  className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Starting Price ($)</label>
                <input 
                  type="number"
                  required
                  placeholder="149"
                  className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Category</label>
                <select 
                  className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                >
                  <option value="Islamic">Islamic</option>
                  <option value="Name">Name</option>
                  <option value="Wedding">Wedding</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Image File</label>
                <label className="flex flex-col items-center justify-center w-full aspect-video bg-emerald-deep/5 rounded-2xl border-2 border-dashed border-gold/20 cursor-pointer hover:bg-emerald-deep/[0.08] transition-all">
                  {newFile ? (
                    <div className="text-center p-4">
                      <ImageIcon size={32} className="mx-auto mb-2 gold-text" />
                      <p className="text-xs font-bold line-clamp-1">{newFile.name}</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Plus size={32} className="mx-auto mb-2 text-emerald-deep/30" />
                      <p className="text-xs text-emerald-deep/40 font-bold">Select high-res image</p>
                    </div>
                  )}
                  <input 
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <button 
                disabled={loading}
                className="w-full py-4 bg-emerald-deep text-white font-bold rounded-xl hover:bg-emerald-deep/90 transition-all disabled:opacity-50 active:scale-[0.98] relative overflow-hidden group shadow-lg flex items-center justify-center gap-3"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                  <span>Upload Template</span>
                </div>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
              </button>
            </form>
          </section>

          {/* List Section */}
          <section className="lg:col-span-2 space-y-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif">Work Gallery</h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-emerald-deep text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-deep/90 transition-all shadow-sm">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Add Work Image</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleWorkImageUpload(file);
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {workImages.map((image) => (
                    <motion.div
                      key={image.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative aspect-square bg-white rounded-2xl overflow-hidden border border-emerald-deep/5 shadow-sm"
                    >
                      <img src={image.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteWorkImage(image)}
                          disabled={deletingWorkId === image.id}
                          className="p-3 bg-white rounded-full text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-lg overflow-hidden relative"
                        >
                          {deletingWorkId === image.id ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {workImages.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-emerald-deep/5 text-emerald-deep/40 italic font-serif">
                    No work images uploaded yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-serif mb-6">Live Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence>
                {templates.map((t) => (
                  <motion.div 
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-emerald-deep/5 flex gap-6"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-emerald-deep/5 shrink-0">
                      <img src={t.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-serif text-lg text-emerald-deep truncate">{t.name}</h3>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold">{t.category}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(t)}
                        disabled={deletingId === t.id}
                        className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {deletingId === t.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        <span>{deletingId === t.id ? "Removing..." : "Remove Item"}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {templates.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-emerald-deep/5 text-emerald-deep/40 italic font-serif">
                  No templates uploaded yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
);
}
