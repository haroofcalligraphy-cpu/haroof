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
  const [frameName, setFrameName] = useState("");
  const [requirements, setRequirements] = useState("");

  if (!template) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `*New Order from HUROOF*\n\n` +
      `*Design Selected:* ${template.name}\n` +
      `*Category:* ${template.category}\n` +
      `*Name for Frame:* ${frameName}\n` +
      `*Specific Requirements:* ${requirements || 'None'}\n` +
      `*Starting Price:* ${template.price || 149}\n\n` +
      `*Design Preview:* ${template.imageUrl}`
    );

    // Sanitize number: +91 95411 20459 -> 919541120459
    const targetNumber = "919541120459";
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${text}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Order Inquiry: ${template.name}`);
    const body = encodeURIComponent(
      `New Order Inquiry from HUROOF\n\n` +
      `Template: ${template.name}\n` +
      `Name for Frame: ${frameName}\n` +
      `Requirements: ${requirements}\n` +
      `Base Price: ${template.price}\n\n` +
      `Image Link: ${template.imageUrl}`
    );
    const orderEmail = config?.orderEmail || "order@huroof.com";
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
          className="relative w-full max-w-5xl bg-cream rounded-3xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2 bg-emerald-deep/5 hover:bg-emerald-deep/10 rounded-full transition-colors text-emerald-deep"
          >
            <X size={24} />
          </button>

          {/* Left: Image Preview */}
          <div className="w-full md:w-1/2 h-64 md:h-auto bg-emerald-deep flex items-center justify-center border-r border-gold/10 p-12">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 border-[16px] border-gold/20 m-[-20px] pointer-events-none" />
              <img 
                src={template.imageUrl} 
                alt={template.name}
                className="w-full h-full object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Right: Customization Form */}
          <div className="w-full md:w-1/2 p-8 md:p-14 overflow-y-auto">
            <div className="mb-10">
              <span className="text-xs uppercase tracking-[0.3em] gold-text font-bold mb-4 block">Bespoke Customizer</span>
              <h2 className="text-4xl font-serif text-emerald-deep mb-2">{template.name}</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-deep/50">
                Starting at ${template.price || '149'}
              </p>
            </div>

            <div className="space-y-10">
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-black mb-3 text-emerald-deep/70">
                  Name to add in Frame *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Zainab & Omar"
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-emerald-deep/10 focus:border-gold outline-none text-xl transition-all placeholder:text-ink/20 font-serif"
                  value={frameName}
                  onChange={(e) => setFrameName(e.target.value)}
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-black mb-3 text-emerald-deep/70">
                  Specific Order Requirements
                </label>
                <textarea 
                  rows={3}
                  placeholder="Additional framing details, color accents, or specific script preferences..."
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-emerald-deep/10 focus:border-gold outline-none text-lg transition-all resize-none placeholder:text-ink/20 font-light leading-relaxed"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={handleWhatsApp}
                  disabled={!frameName}
                  className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-[#25D366] text-white font-black rounded-2xl hover:bg-[#20ba5a] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-green-500/20"
                >
                  <MessageCircle size={22} />
                  <span className="uppercase tracking-widest text-[13px]">Order via WhatsApp</span>
                </button>
                
                <button 
                  onClick={handleEmail}
                  disabled={!frameName}
                  className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-emerald-deep/5 text-emerald-deep border-2 border-emerald-deep/10 font-bold rounded-2xl hover:bg-emerald-deep/10 transition-all disabled:opacity-50"
                >
                  <Mail size={20} />
                  <span className="uppercase tracking-widest text-[12px]">Inquire via Email</span>
                </button>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-4 p-4 bg-gold/5 rounded-2xl border border-gold/10">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <p className="text-[10px] text-emerald-deep/60 uppercase tracking-[0.15em] font-medium leading-relaxed">
                We will share a design draft for approval within 24-48 hours of your order.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
