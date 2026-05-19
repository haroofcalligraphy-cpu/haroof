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
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [frameName, setFrameName] = useState("");
  const [requirements, setRequirements] = useState("");

  if (!template) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `*New Order Inquiry from HUROOF*\n\n` +
      `*Customer:* ${customerName || "Not provided"}\n` +
      `*Contact:* ${customerContact || "Not provided"}\n\n` +
      `*Design Selected:* ${template.name}\n` +
      `*Category:* ${template.category}\n` +
      `*Name for Frame:* ${frameName || "Not provided"}\n` +
      `*Requirements:* ${requirements || "None"}\n` +
      `*Starting Price:* ₹${template.price || 149}\n\n` +
      `*Design Preview:* ${template.imageUrl}`
    );

    const targetNumber = "919541120459";
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${text}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDirectChat = () => {
    const text = encodeURIComponent(
      `Hi HUROOF! I'm interested in the "${template.name}" design. Can you help me customize it?`
    );
    const targetNumber = "919541120459";
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${text}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Order Inquiry: ${template.name}`);
    const body = encodeURIComponent(
      `New Order Inquiry from HUROOF\n\n` +
      `Customer Name: ${customerName}\n` +
      `Contact: ${customerContact}\n` +
      `Template: ${template.name}\n` +
      `Name for Frame: ${frameName}\n` +
      `Requirements: ${requirements}\n` +
      `Base Price: ₹${template.price}\n\n` +
      `Image Link: ${template.imageUrl}`
    );
    const orderEmail = config?.orderEmail || "order@huroof.com";
    window.location.href = `mailto:${orderEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-emerald-deep/95 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl bg-cream rounded-[2rem] shadow-2xl flex flex-col lg:flex-row max-h-[95vh] overflow-hidden my-auto"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-30 p-2 bg-emerald-deep/5 hover:bg-emerald-deep/10 rounded-full transition-colors text-emerald-deep"
          >
            <X size={24} />
          </button>

          {/* Left: Image Preview */}
          <div className="w-full lg:w-[45%] h-64 lg:h-auto bg-emerald-deep flex items-center justify-center p-8 lg:p-16 relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full border-[40px] border-gold/30 rotate-12 scale-150 transform" />
            </div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute -inset-4 border-2 border-gold/20 pointer-events-none" />
              <img 
                src={template.imageUrl} 
                alt={template.name}
                className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Right: Customization Form */}
          <div className="w-full lg:w-[55%] p-8 md:p-12 lg:p-16 overflow-y-auto bg-white/50 backdrop-blur-sm">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-[1px] bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.4em] gold-text font-black">Option 1: Complete Web Form</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-emerald-deep mb-2">{template.name}</h2>
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-emerald-deep/40">
                Custom Calligraphy Design • Starting at ₹{template.price || '149'}
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <label className="block text-[9px] uppercase tracking-[0.2em] font-black mb-2 text-emerald-deep/60">
                    Your Name *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-0 py-3 bg-transparent border-b border-emerald-deep/10 focus:border-gold outline-none text-base transition-all placeholder:text-ink/10 font-sans"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <label className="block text-[9px] uppercase tracking-[0.2em] font-black mb-2 text-emerald-deep/60">
                    Contact Details (WhatsApp/Email) *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Where can we reach you?"
                    className="w-full px-0 py-3 bg-transparent border-b border-emerald-deep/10 focus:border-gold outline-none text-base transition-all placeholder:text-ink/10 font-sans"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[9px] uppercase tracking-[0.2em] font-black mb-2 text-emerald-deep/60">
                  Text to add in Frame *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., The name or quote you want written"
                  className="w-full px-0 py-4 bg-transparent border-b border-emerald-deep/10 focus:border-gold outline-none text-xl transition-all placeholder:text-ink/10 font-serif"
                  value={frameName}
                  onChange={(e) => setFrameName(e.target.value)}
                />
              </div>

              <div className="relative">
                <label className="block text-[9px] uppercase tracking-[0.2em] font-black mb-2 text-emerald-deep/60">
                  Additional Requirements
                </label>
                <textarea 
                  rows={2}
                  placeholder="Color preferences, frame size, or specific gift instructions..."
                  className="w-full px-0 py-3 bg-transparent border-b border-emerald-deep/10 focus:border-gold outline-none text-base transition-all resize-none placeholder:text-ink/10 font-light"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={handleWhatsApp}
                  disabled={!customerName || !customerContact || !frameName}
                  className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#20ba5a] hover:shadow-2xl hover:shadow-green-500/30 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none translate-y-0 hover:-translate-y-1 active:translate-y-0"
                >
                  <MessageCircle size={22} className="shrink-0" />
                  <span className="uppercase tracking-[0.15em] text-[12px] font-black">Submit & Inquiry via WhatsApp</span>
                </button>
                
                <button 
                  onClick={handleEmail}
                  disabled={!customerName || !customerContact || !frameName}
                  className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-emerald-deep/5 text-emerald-deep border border-emerald-deep/10 font-bold rounded-2xl hover:bg-emerald-deep/10 transition-all disabled:opacity-30"
                >
                  <Mail size={18} className="shrink-0" />
                  <span className="uppercase tracking-[0.1em] text-[11px]">Send Inquiry via Email</span>
                </button>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-emerald-deep/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-[1px] bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-emerald-deep/40 font-black">Option 2: Direct Chat</span>
              </div>
              
              <button 
                onClick={handleDirectChat}
                className="w-full group flex items-center justify-between p-6 bg-emerald-deep text-cream rounded-2xl hover:bg-gold hover:text-emerald-deep transition-all duration-500"
              >
                <div className="text-left">
                  <span className="block text-[10px] uppercase tracking-widest font-black opacity-60 mb-1 group-hover:opacity-100">Skip the form</span>
                  <span className="block text-lg font-serif">Chat directly with the artist</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-cream/10 flex items-center justify-center group-hover:bg-emerald-deep group-hover:text-cream transition-colors">
                  <MessageCircle size={24} />
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
