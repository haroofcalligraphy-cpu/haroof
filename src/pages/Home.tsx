import { useState, useEffect } from "react";
import { Header } from "@/src/components/Header";
import { Hero } from "@/src/components/Hero";
import { Concept } from "@/src/components/Concept";
import { Gallery } from "@/src/components/Gallery";
import { WorkGallery } from "@/src/components/WorkGallery";
import { WhatsAppFloating } from "@/src/components/WhatsAppFloating";
import { CustomizerModal } from "@/src/components/CustomizerModal";
import { Footer } from "@/src/components/Footer";
import { Template, SiteConfig } from "@/src/types";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [config, setConfig] = useState<SiteConfig>({
    heroTitle: "Every Letter Tells a Story",
    heroSubtitle: "Preserve memories, love, and faith through timeless premium calligraphy gift frames.",
    conceptTitle: "The Art of Huroof",
    conceptText: "In a world of mass production, HUROOF stands for the sacred beauty of the written word. Each piece is a unique creation, blending traditional script with modern aesthetics.",
    conceptImageUrl: "",
    heroImageUrl: "",
    whatsappNumber: "0000000000", // Generic default
    orderEmail: "order@huroof.com",
    seoTitle: "HUROOF | Sacred Calligraphy Art Collective",
    seoDescription: "Transforming the ancient beauty of calligraphy into personalized art frames for your home and soulful gifts."
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteConfig;
        setConfig(prev => ({ ...prev, ...data }));
        
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
      <Helmet>
        <title>{config?.seoTitle || "HUROOF | Art Collective"}</title>
        <meta name="description" content={config?.seoDescription || "Sacred calligraphy art for your home."} />
      </Helmet>
      <Header config={config} />
      <main>
        <Hero config={config} />
        <Concept config={config} />
        <Gallery onSelectTemplate={(t) => setSelectedTemplate(t)} />
        <WorkGallery />
      </main>
      <Footer config={config} />
      <WhatsAppFloating config={config} />
      
      <CustomizerModal 
        template={selectedTemplate} 
        onClose={() => setSelectedTemplate(null)} 
        config={config}
      />
    </div>
  );
}
