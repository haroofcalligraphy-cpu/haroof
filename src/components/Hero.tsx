import { motion } from "motion/react";
import { SiteConfig } from "@/src/types";

interface HeroProps {
  config: SiteConfig | null;
}

export function Hero({ config }: HeroProps) {
  return (
    <section id="home" className="relative pt-24 pb-12 flex items-center justify-center overflow-hidden min-h-[60vh] md:min-h-[80vh]">
      {config?.heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={config.heroImageUrl} 
            className="w-full h-full object-cover opacity-10 grayscale" 
            alt="Hero Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone/60 backdrop-blur-[2px]" />
        </div>
      )}
      <div className="relative z-10 text-center px-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-4 block">
            Spiritual Artistry & Timeless Gifts
          </span>
          <h1 className="text-4xl md:text-6xl text-emerald-deep font-serif italic mb-8 leading-[1.1]">
            “{config?.heroTitle || "Every letter is a prayer, every frame a memory."}”
          </h1>
          <p className="text-sm md:text-base text-emerald-deep/70 max-w-lg mx-auto leading-relaxed mb-12">
            {config?.heroSubtitle || "Huroof transforms the ancient beauty of calligraphy into personalized art. Whether celebrating a union, a name, or a verse, we craft vessels for your most profound emotions."}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <a href="#gallery" className="text-[11px] uppercase tracking-[0.2em] font-bold text-emerald-deep border-b-2 border-emerald-deep pb-1 hover:text-gold hover:border-gold transition-all">
              Explore Collection
            </a>
            <a href="#concept" className="text-[11px] uppercase tracking-[0.2em] font-bold text-emerald-deep/40 hover:text-emerald-deep transition-all pb-1">
              The Process
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
