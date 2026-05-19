import { useState, useEffect } from "react";
import { Header } from "@/src/components/Header";
import { Hero } from "@/src/components/Hero";
import { Concept } from "@/src/components/Concept";
import { Gallery } from "@/src/components/Gallery";
import { WorkGallery } from "@/src/components/WorkGallery";
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
        const data = snapshot.data() as SiteConfig;
        setConfig(data);
        
        // Dynamic Favicon
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.faviconUrl;
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bordered-container bg-stone">
      <Header config={config} />
      <main>
        <Hero config={config} />
        <Concept config={config} />
        <Gallery onSelectTemplate={(t) => setSelectedTemplate(t)} />
        <WorkGallery />
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
