import { motion } from "motion/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { WhatsAppFloating } from "../components/WhatsAppFloating";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SiteConfig } from "../types";

export default function About() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      const configDoc = await getDoc(doc(db, "config", "site"));
      if (configDoc.exists()) {
        setConfig(configDoc.data() as SiteConfig);
      }
    }
    fetchConfig();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-stone selection:bg-emerald-deep selection:text-gold">
      <Header config={config} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl text-emerald-deep mb-8 tracking-tight">About Huroof</h1>
            
            <div className="prose prose-emerald lg:prose-xl text-emerald-deep/80 font-sans leading-relaxed space-y-6">
              <p>
                Huroof Art Collective is a pursuit of bringing the timeless beauty of Arabic calligraphy into modern living spaces. Founded with a passion for the written word and spiritual aesthetics, we bridge the gap between traditional artistry and contemporary design.
              </p>
              
              <p>
                Our collection features a range of meticulously crafted pieces, from minimalist geometric patterns to fluid, expressive scripts. Each design is more than just art; it's a reflection of heritage, meaning, and soul.
              </p>

              <div className="my-12 border-l-2 border-gold pl-8 py-2 italic font-serif text-2xl text-emerald-deep">
                "Writing is the geometry of the soul, made visible."
              </div>

              <h2 className="font-serif text-2xl text-emerald-deep mt-12 mb-4">Our Philosophy</h2>
              <p>
                We believe that the environment we inhabit shapes our inner state. By integrating sacred geometry and calligraphy into daily life, we aim to create spaces that inspire peace, reflection, and appreciation for artistic excellence.
              </p>

              <h2 className="font-serif text-2xl text-emerald-deep mt-12 mb-4">Craftsmanship</h2>
              <p>
                Quality is at the core of everything we do. From the selection of premium materials to the precision of our custom framing, we ensure that every piece that leaves our studio meets the highest standards of craftsmanship.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer config={config} />
      <WhatsAppFloating config={config} />
    </div>
  );
}
