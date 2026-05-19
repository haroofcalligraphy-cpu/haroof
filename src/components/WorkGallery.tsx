import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WorkImage } from "@/src/types";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { X } from "lucide-react";

export function WorkGallery() {
  const [images, setImages] = useState<WorkImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(
        collection(db, "workGallery"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as WorkImage));
        setImages(data);
        setLoading(false);
      }, (error) => {
        console.error("Work gallery snapshot error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase not initialized for work gallery yet");
      setLoading(false);
    }
  }, []);

  if (!loading && images.length === 0) return null;

  return (
    <section id="work-gallery" className="py-24 bg-stone border-t border-emerald-deep/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-emerald-deep mb-4">Our Completed Works</h2>
          <p className="text-emerald-deep/60 font-light max-w-xl mx-auto">
            A small glimpse into the sacred vessels we've crafted for homes across the world.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square bg-emerald-deep/5 animate-pulse rounded-2xl" />
              ))
            ) : (
              images.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative"
                  onClick={() => setSelectedImage(image.imageUrl)}
                >
                  <img 
                    src={image.imageUrl} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                    alt="Calligraphy work"
                  />
                  <div className="absolute inset-0 bg-emerald-deep/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-deep/95 backdrop-blur-xl flex items-center justify-center p-6 sm:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-stone/60 hover:text-stone transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
