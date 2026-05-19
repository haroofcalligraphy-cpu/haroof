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
  doc 
} from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { Template, Category } from "@/src/types";
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
  Loader2
} from "lucide-react";
import imageCompression from "browser-image-compression";

const ADMIN_EMAIL = "haroofcalligraphy@gmail.com";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState(149);
  const [category, setCategory] = useState<Category>("Islamic");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !name) return;

    setFormLoading(true);
    setStatus(null);

    try {
      // 1. Optimize Image
      console.log("Starting image compression...");
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(imageFile, options);
      console.log("Compression done:", compressedFile.size, "bytes");

      // 2. Upload to Vercel Blob via API
      const formData = new FormData();
      formData.append("file", compressedFile);

      console.log("Sending fetch request to /api/upload...");
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      }).catch(err => {
        console.error("Fetch call specifically failed:", err);
        throw new Error(`Connection failed: ${err.message}. The server might be restarting or unreachable.`);
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        let errorMessage = errorData.error || `Upload failed with status ${uploadRes.status}`;
        
        if (errorMessage.includes("token is missing")) {
          errorMessage = "Vercel Blob token is missing. Please go to Settings -> Secrets in AI Studio and add BLOB_READ_WRITE_TOKEN.";
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await uploadRes.json();
      const imageUrl = responseData.url;
      console.log("Upload successful, received URL:", imageUrl);

      // 3. Save to Firestore
      const newTemplate = {
        name,
        price,
        category,
        imageUrl,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, "templates"), newTemplate);

      // Reset Form
      setName("");
      setPrice(149);
      setImageFile(null);
      setImagePreview(null);
      setStatus({ type: 'success', message: "Design template added successfully!" });
    } catch (error: any) {
      console.error("Submit error:", error);
      setStatus({ type: 'error', message: error.message || "Failed to add template" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (template: Template) => {
    if (!window.confirm("Are you sure you want to delete this design?")) return;

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
    } catch (error) {
      console.error("Delete error:", error);
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
    <div className="min-h-screen bg-[#fcfbf7]">
      <nav className="bg-emerald-deep text-white px-12 py-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={24} className="text-gold" />
          <h1 className="text-xl font-serif tracking-wide">HUROOF Studio Admin</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-light opacity-80">{user.email}</span>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gold/10 sticky top-32">
            <h2 className="text-2xl font-serif text-emerald-deep mb-8">Add New Design Template</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Template Name</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cream/50 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:border-gold transition-colors"
                  placeholder="e.g., Floral Thuluth"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Starting Price</label>
                  <input 
                    required
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-cream/50 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-cream/50 border border-gold/10 rounded-xl px-4 py-3 outline-none focus:border-gold transition-colors"
                  >
                    <option value="Islamic">Islamic Calligraphy</option>
                    <option value="Name">Name Calligraphy</option>
                    <option value="Wedding">Wedding Calligraphy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-2 text-emerald-deep/60">Design Image</label>
                <div className="relative group">
                  <input 
                    required={!imagePreview}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gold/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-cream/30 group-hover:bg-cream/50 transition-all">
                    {imagePreview ? (
                      <div className="relative w-full aspect-square">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                          <Upload className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-gold/40" />
                        <span className="text-sm text-ink/40">Click to upload design</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                disabled={formLoading}
                className="w-full bg-emerald-deep text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-deep/90 transition-all disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Save Template</span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
                      status.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-emerald-deep font-light">Existing Catalogs</h2>
            <span className="text-xs uppercase tracking-widest text-emerald-deep/40">{templates.length} Designs Total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <AnimatePresence>
              {templates.map((template) => (
                <motion.div 
                  key={template.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gold/10 group flex flex-col"
                >
                  <div className="relative aspect-square bg-cream rounded-xl overflow-hidden mb-6 flex items-center justify-center p-4">
                    <img 
                      src={template.imageUrl} 
                      alt={template.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => handleDelete(template)}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-widest gold-text font-bold mb-2 block">{template.category}</span>
                    <h3 className="text-lg font-serif text-emerald-deep mb-1">{template.name}</h3>
                    <p className="text-sm font-light text-ink/60 italic">Starting at ${template.price}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
