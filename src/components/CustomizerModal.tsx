import { motion, AnimatePresence } from "motion/react";
import { X, MessageCircle, Mail } from "lucide-react";
import { Template, SiteConfig } from "@/src/types";
import { useState } from "react";

interface CustomizerModalProps {
  template: Template | null;
  config: SiteConfig | null;
  onClose: () => void;
}

export function CustomizerModal({ template, config, onClose }: CustomizerModalProps) {
  const [customText, setCustomText] = useState("");
  const [instructions, setInstructions] = useState("");

  if (!template) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`*New Order from HAROOF*\n\n*Template:* ${template.name} (${template.id})\n*Category:* ${template.category}\n*Custom Text:* ${customText}\n*Instructions:* ${instructions}\n\n*Reference Image:* ${template.imageUrl}`);
    const whatsappNumber = config?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${text}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`New Order: ${template.name}`);
    const body = encodeURIComponent(`New Order from HAROOF\n\nTemplate: ${template.name} (${template.id})\nCategory: ${template.category}\nCustom Text: ${customText}\nInstructions: ${instructions}\n\nReference Image: ${template.imageUrl}`);
    const orderEmail = config?.orderEmail || import.meta.env.VITE_ORDER_EMAIL;
    window.location.href = `mailto:${orderEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-emerald-deep/90 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-cream rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white md:text-emerald-deep"
          >
            <X size={24} />
          </button>

          {/* Left: Image Preview */}
          <div className="w-full md:w-1/2 h-64 md:h-auto bg-emerald-deep flex items-center justify-center border-r border-gold/10">
            <img 
              src={template.imageUrl} 
              alt={template.name}
              className="w-full h-full object-contain p-8"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right: Customization Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
            <div className="mb-10">
              <span className="text-xs uppercase tracking-[0.3em] gold-text font-bold mb-2 block">Personalize Your Frame</span>
              <h2 className="text-3xl font-serif text-emerald-deep">{template.name}</h2>
              {template.description && <p className="text-ink/60 mt-4 font-light leading-relaxed">{template.description}</p>}
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-4 text-emerald-deep/70">
                  Your Custom Text / Name / Details
                </label>
                <input 
                  type="text"
                  placeholder="e.g., Arabic calligraphy for 'Safiyah'"
                  className="w-full px-0 py-3 bg-transparent border-b border-emerald-deep/20 focus:border-gold outline-none text-lg transition-colors placeholder:text-ink/30"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-4 text-emerald-deep/70">
                  Special Instructions / Date
                </label>
                <textarea 
                  rows={3}
                  placeholder="e.g., Wedding date: 12.05.2024, Soft gold accents..."
                  className="w-full px-0 py-3 bg-transparent border-b border-emerald-deep/20 focus:border-gold outline-none text-lg transition-colors resize-none placeholder:text-ink/30"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={handleWhatsApp}
                  disabled={!customText}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <MessageCircle size={22} />
                  <span>Order via WhatsApp</span>
                </button>
                <button 
                  onClick={handleEmail}
                  disabled={!customText}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-emerald-deep text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Mail size={22} />
                  <span>Order via Email</span>
                </button>
              </div>
            </div>
            
            <p className="mt-8 text-xs text-ink/40 text-center uppercase tracking-widest leading-relaxed">
              Once ordered, we will reach out to confirm your design draft before production.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
