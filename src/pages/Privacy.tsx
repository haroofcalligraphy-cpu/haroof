import { motion } from "motion/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { WhatsAppFloating } from "../components/WhatsAppFloating";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SiteConfig } from "../types";

export default function Privacy() {
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
            <h1 className="font-serif text-4xl text-emerald-deep mb-8 tracking-tight">Privacy Policy</h1>
            
            <div className="prose prose-emerald text-emerald-deep/80 font-sans space-y-6">
              <p>
                At Huroof, we respect your privacy and are committed to protecting it. This policy outlines how we handle your information.
              </p>
              
              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">Information Collection</h2>
                <p>
                  We collect information that you provide directly to us when you make reach out for an order, including your name, contact information, and shipping address.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">How We Use Your Information</h2>
                <p>
                  We use the information we collect to process your orders, communicate with you about your order status, and, with your permission, send you updates about new collections.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-2xl text-emerald-deep mt-8 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about our privacy practices, please contact us via email or WhatsApp.
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
