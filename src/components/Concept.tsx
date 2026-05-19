import { motion } from "motion/react";
import { SiteConfig } from "@/src/types";

interface ConceptProps {
  config: SiteConfig | null;
}

export function Concept({ config }: ConceptProps) {
  return (
    <section id="concept" className="py-24 bg-stone/30">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-square bg-emerald-deep/5 p-4 rounded-3xl overflow-hidden"
        >
           <img 
            src={config?.conceptImageUrl || "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000&auto=format&fit=crop"} 
            alt="Classic Calligraphy" 
            className="w-full h-full object-cover rounded-2xl grayscale transition-all duration-700 hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-8 left-8 p-6 glass-panel rounded-2xl gold-text font-serif italic text-xl">
            Ethical. Spiritual. Timeless.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-emerald-deep">
            Why <span className="italic">HUROOF?</span>
          </h2>
          <div className="space-y-6 text-lg text-ink/70 font-light leading-relaxed">
            {config?.conceptText ? (
              <p className="whitespace-pre-line">{config.conceptText}</p>
            ) : (
              <>
                <p>
                  In a world of mass production, <span className="font-bold text-emerald-deep">HUROOF</span> stands for the sacred beauty of the written word. We believe that every letter is a vessel for emotion, a reflection of the soul.
                </p>
                <p>
                  Our frames are more than just decoration; they are milestones. Whether it's a name that defines an identity, a verse that guides a soul, or a union that celebrates a lifetime—our calligraphy transforms these moments into enduring masterpieces.
                </p>
              </>
            )}
          </div>
          <div className="flex gap-12 mt-4">
             <div>
                <span className="block text-3xl font-serif gold-text font-bold">100%</span>
                <span className="text-xs uppercase tracking-widest text-ink/50">Handcrafted</span>
             </div>
             <div>
                <span className="block text-3xl font-serif gold-text font-bold">Premium</span>
                <span className="text-xs uppercase tracking-widest text-ink/50">Wood Frames</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
