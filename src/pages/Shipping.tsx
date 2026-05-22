import { motion } from "motion/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { WhatsAppFloating } from "../components/WhatsAppFloating";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SiteConfig } from "../types";

export default function Shipping() {
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
            <h1 className="font-serif text-4xl text-emerald-deep mb-8 tracking-tight">Shipping Policy</h1>
            
            <div className="prose prose-emerald text-emerald-deep/80 font-sans space-y-6">
              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">Processing Time</h2>
                <p>
                  As each piece is made to order with careful attention to detail, please allow 3-5 business days for processing and preparation before shipment.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">Domestic Shipping (India)</h2>
                <p>
                  We offer standard shipping across India. Delivery typically takes 5-7 business days after processing. Shipping costs are calculated at checkout based on the size and weight of your order.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">Packaging</h2>
                <p>
                  Your art is precious. We use redundant, protective packaging to ensure your piece arrives in perfect condition. In the rare event of damage during transit, please contact us immediately with photographs of the packaging and the product.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">Tracking</h2>
                <p>
                  Once your order is shipped, you will receive a tracking number via email or WhatsApp to monitor its progress.
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
