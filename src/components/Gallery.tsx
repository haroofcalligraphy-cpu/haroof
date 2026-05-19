import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Category, Template } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

interface GalleryProps {
  onSelectTemplate: (template: Template) => void;
}

export function Gallery({ onSelectTemplate }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("Islamic");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const categories: Category[] = ["Islamic", "Name", "Wedding"];

  useEffect(() => {
    // This will error if firebase isn't setup yet, so we catch it
    try {
      const q = query(
        collection(db, "templates"),
        where("category", "==", activeCategory)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Template));
        setTemplates(data);
        setLoading(false);
      }, (error) => {
        console.error("Gallery snapshot error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase not initialized for gallery yet");
      setLoading(false);
    }
  }, [activeCategory]);

  return (
    <section id="gallery" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-emerald-deep mb-4">The Collection</h2>
          <p className="text-ink/60 font-light max-w-xl mx-auto">
            Choose a foundation for your custom masterpiece. Each template is meticulously balanced for aesthetic perfection.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center flex-wrap gap-12 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-300 pb-2",
                activeCategory === category 
                  ? "text-emerald-deep border-b-2 border-emerald-deep" 
                  : "text-emerald-deep/40 hover:text-emerald-deep"
              )}
            >
              {category} Calligraphy
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-emerald-deep/5 animate-pulse" />
              ))
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 shadow-sm border border-gold/10 flex flex-col items-center group cursor-pointer"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="relative w-full aspect-[4/5] bg-emerald-deep flex items-center justify-center p-6 overflow-hidden">
                    <div className="absolute inset-0 border-2 border-gold/20 m-4 pointer-events-none z-10" />
                    <img 
                      src={template.imageUrl} 
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-emerald-deep/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                      <span className="px-6 py-2 bg-white text-emerald-deep text-[10px] uppercase tracking-[0.2em] font-bold">
                        Customize Frame
                      </span>
                    </div>
                  </div>
                  <div className="text-center mt-6">
                    <h3 className="text-lg font-serif tracking-wide text-emerald-deep mb-1">{template.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-deep/60">
                      Starting at ${template.price || '149'}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center text-ink/40 font-serif italic text-2xl">
                More designs coming soon...
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
