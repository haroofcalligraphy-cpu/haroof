import { motion } from "motion/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { WhatsAppFloating } from "../components/WhatsAppFloating";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SiteConfig } from "../types";

export default function Terms() {
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
    <div className="min-h-screen bg-stone">
      <Header config={config} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-4xl text-emerald-deep mb-8 tracking-tight">Terms & Conditions</h1>
            
            <div className="prose prose-emerald text-emerald-deep/80 font-sans space-y-6">
              <p className="italic underline">Last updated: May 2024</p>
              
              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Huroof website, you agree to comply with and be bound by these Terms and Conditions.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">2. Custom Orders</h2>
                <p>
                  For custom calligraphy requests, final approval of the design is required before production starts. Once production has begun, changes cannot be made.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">3. Intellectual Property</h2>
                <p>
                  All designs, artwork, and photography on this website are the intellectual property of Huroof and may not be reproduced or used without express written permission.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">4. Returns & Exchanges</h2>
                <p>
                  Due to the made-to-order and custom nature of our products, we do not accept returns or exchanges unless the item is damaged during transit or defective.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer config={config} />
      <WhatsAppFloating config={config} />
    </div>
  );
}
