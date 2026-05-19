import { useState, useEffect } from "react";
import { Header } from "@/src/components/Header";
import { Hero } from "@/src/components/Hero";
import { Concept } from "@/src/components/Concept";
import { Gallery } from "@/src/components/Gallery";
import { CustomizerModal } from "@/src/components/CustomizerModal";
import { Footer } from "@/src/components/Footer";
import { Template, SiteConfig } from "@/src/types";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as SiteConfig);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bordered-container bg-stone">
      <Header />
      <main>
        <Hero config={config} />
        <Concept config={config} />
        <Gallery onSelectTemplate={(t) => setSelectedTemplate(t)} />
      </main>
      <Footer config={config} />
      
      <CustomizerModal 
        template={selectedTemplate} 
        onClose={() => setSelectedTemplate(null)} 
        config={config}
      />
    </div>
  );
}
