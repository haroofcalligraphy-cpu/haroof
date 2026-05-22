import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WorkImage } from "@/src/types";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { X, Images } from "lucide-react";

// Exquisite curated fallback completed commission works to showcase if none are uploaded yet
const FALLBACK_WORKS = [
  {
    id: "fb1",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
    caption: "Custom Gold Foil Arabic Calligraphy with Textured Matting"
  },
  {
    id: "fb2",
    imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80",
    caption: "Teal Stroke Minimalist Diwani Script Frame"
  },
  {
    id: "fb3",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    caption: "Elegant Dual Monogram Wedding Gift Commission"
  },
  {
    id: "fb4",
    imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80",
    caption: "Large-scale Textured Thuluth Art in Walnut Wood Frame"
  }
];

export function WorkGallery() {
  const [images, setImages] = useState<WorkImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
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

  const displayImages = images.length > 0 ? images : FALLBACK_WORKS.map(fb => ({
    id: fb.id,
    imageUrl: fb.imageUrl,
    createdAt: 0
  }));

  const isUsingFallback = images.length === 0 && !loading;

  return (
    <section id="work-gallery" className="py-24 bg-stone border-t border-emerald-deep/5 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/15 rounded-full mb-4">
            <Images size={12} className="text-gold" />
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-emerald-deep">COMMISSIONS GALLERY</span>
          </div>
          <h2 className="text-4xl font-serif text-emerald-deep mb-4">Our Completed Works</h2>
          <p className="text-emerald-deep/60 font-light max-w-xl mx-auto text-sm md:text-base">
            Explore a curated selection of physical custom art frames and unique commissions we've handcrafted for homes and spaces.
          </p>
          {isUsingFallback && (
            <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-gold mt-4">
              * Showcasing sample completed works. Upload your real commissions anytime via Admin Panel!
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-emerald-deep/5 animate-pulse rounded-2xl" />
              ))
            ) : (
              displayImages.map((image) => {
                const fallbackInfo = FALLBACK_WORKS.find(f => f.id === image.id);
                const caption = fallbackInfo ? fallbackInfo.caption : "Premium Handcrafted Commission Frame";
                
                return (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm border border-gold/5 bg-white flex items-center justify-center p-3"
                    onClick={() => {
                      setSelectedImage(image.imageUrl);
                      setSelectedCaption(caption);
                    }}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden relative">
                      <img 
                        src={image.imageUrl} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        referrerPolicy="no-referrer"
                        alt="Handcrafted finished commission"
                      />
                      <div className="absolute inset-0 bg-emerald-deep/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left">
                        <p className="text-white font-serif text-xs md:text-sm line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          {caption}
                        </p>
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                          Click to expand
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
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
            className="fixed inset-0 z-[100] bg-emerald-deep/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 sm:p-12"
            onClick={() => {
              setSelectedImage(null);
              setSelectedCaption(null);
            }}
          >
            <button 
              className="absolute top-8 right-8 text-stone/60 hover:text-stone transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full"
              onClick={() => {
                setSelectedImage(null);
                setSelectedCaption(null);
              }}
            >
              <X size={24} />
            </button>
            <div className="relative max-w-4xl max-h-[75vh] flex flex-col items-center gap-4">
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={selectedImage}
                className="max-w-full max-h-[65vh] object-contain shadow-2xl rounded-2xl border border-gold/10"
                referrerPolicy="no-referrer"
                onClick={(e) => e.stopPropagation()}
              />
              {selectedCaption && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-stone/10 border border-white/10 px-6 py-3 rounded-xl max-w-md text-center backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-white text-xs md:text-sm font-sans tracking-wide">
                    {selectedCaption}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
