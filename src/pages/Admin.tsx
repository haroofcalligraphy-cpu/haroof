import { useState, useEffect } from "react";
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/src/lib/firebase";
import { Template, Category } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Plus, LogOut, Image as ImageIcon, Loader2 } from "lucide-react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state for Site Config
  const [config, setConfig] = useState<any>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Form state for Templates
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("Islamic");
  const [newFile, setNewFile] = useState<File | null>(null);

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    if (!isAuthenticated) return;

    const configUnsubscribe = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data());
      } else {
        setConfig({
          heroTitle: "Every Letter Tells a Story",
          heroSubtitle: "Preserve memories, love, and faith through timeless premium calligraphy gift frames.",
          conceptText: "We believe that every letter is a vessel for emotion...",
          whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "",
          orderEmail: import.meta.env.VITE_ORDER_EMAIL || ""
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

    return () => {
      configUnsubscribe();
      templatesUnsubscribe();
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSavingConfig(true);
    try {
      await setDoc(doc(db, "config", "site"), config);
      alert("Configuration updated successfully");
    } catch (err) {
      console.error("Save config error:", err);
      alert("Failed to update site configuration.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile || !newName) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `templates/${Date.now()}_${newFile.name}`);
      await uploadBytes(storageRef, newFile);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "templates"), {
        name: newName,
        category: newCategory,
        imageUrl: url,
        createdAt: Date.now(),
        storagePath: storageRef.fullPath // helpful for deletion
      });

      setNewName("");
      setNewFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: Template & { storagePath?: string }) => {
    if (!window.confirm("Delete this template?")) return;

    try {
      if (template.storagePath) {
        const storageRef = ref(storage, template.storagePath);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, "templates", template.id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen luxury-gradient flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-emerald-deep mb-2">Admin Access</h1>
            <p className="text-ink/40 text-sm uppercase tracking-widest font-bold">HAROOF PORTAL</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password"
              placeholder="Enter Admin Password"
              className="w-full px-6 py-4 bg-emerald-deep/5 border-none rounded-xl outline-none focus:ring-2 ring-gold transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full py-4 bg-emerald-deep text-white font-bold rounded-xl hover:bg-emerald-deep/90 transition-all shadow-lg">
              Unlock Dashboard
            </button>
          </form>
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
            onClick={() => setIsAuthenticated(false)}
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
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Hero Title</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                    value={config.heroTitle}
                    onChange={(e) => setConfig({...config, heroTitle: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">WhatsApp Number</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-3 text-emerald-deep/50">Order Email</label>
                  <input 
                    type="email"
                    className="w-full px-4 py-3 bg-emerald-deep/5 rounded-xl border-none outline-none focus:ring-1 ring-gold"
                    value={config.orderEmail}
                    onChange={(e) => setConfig({...config, orderEmail: e.target.value})}
                  />
                </div>
                <button 
                  disabled={isSavingConfig}
                  className="w-full py-4 border border-gold text-gold font-bold rounded-xl hover:bg-gold hover:text-white transition-all disabled:opacity-50"
                >
                  {isSavingConfig ? "Saving..." : "Update Settings"}
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
                className="w-full py-4 bg-emerald-deep text-white font-bold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                <span>Upload Template</span>
              </button>
            </form>
          </section>

          {/* List Section */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-serif mb-2">Live Gallery Items</h2>
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
                        className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Remove Item</span>
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
          </section>
        </div>
      </div>
    </div>
  );
}
