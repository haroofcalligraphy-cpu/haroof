import { motion } from "motion/react";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { SiteConfig } from "@/src/types";

interface FooterProps {
  config: SiteConfig | null;
}

export function Footer({ config }: FooterProps) {
  return (
    <footer id="footer" className="bg-emerald-deep text-stone py-12 px-12 border-t-[12px] border-emerald-deep">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">
          &copy; {new Date().getFullYear()} HUROOF ART COLLECTIVE. ALL RIGHTS RESERVED. — CRAFTED BY FAISAL
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <button 
            onClick={() => {
              // @ts-ignore
              const rawNumber = config?.whatsappNumber || (import.meta as any).env.VITE_WHATSAPP_NUMBER || "";
              const whatsappNumber = rawNumber.replace(/\D/g, "");
              window.open(`https://wa.me/${whatsappNumber}`, "_blank");
            }}
            className="flex items-center gap-3 px-8 py-3 border border-gold/50 text-[11px] uppercase tracking-[0.2em] hover:bg-stone hover:text-emerald-deep transition-all font-bold"
          >
            <Phone size={14} />
            Order via WhatsApp
          </button>
          <button 
            // @ts-ignore
            onClick={() => window.location.href = `mailto:${config?.orderEmail || (import.meta as any).env.VITE_ORDER_EMAIL}`}
            className="flex items-center gap-3 px-8 py-3 border border-gold/50 text-[11px] uppercase tracking-[0.2em] hover:bg-stone hover:text-emerald-deep transition-all font-bold"
          >
            <Mail size={14} />
            Order via Email
          </button>
        </div>
      </div>
    </footer>
  );
}
