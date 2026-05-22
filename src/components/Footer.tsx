import { motion } from "motion/react";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { SiteConfig } from "@/src/types";
import { Link } from "react-router-dom";

interface FooterProps {
  config: SiteConfig | null;
}

export function Footer({ config }: FooterProps) {
  return (
    <footer id="footer" className="bg-emerald-deep text-stone py-16 px-6 md:px-12 border-t-[12px] border-emerald-deep">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-6">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="HUROOF" className="h-10 w-auto brightness-0 invert opacity-80" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-2xl font-serif tracking-widest opacity-80">HUROOF</div>
            )}
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 leading-relaxed text-center md:text-left">
              &copy; {new Date().getFullYear()} HUROOF ART COLLECTIVE.<br />
              ALL RIGHTS RESERVED.<br />
              CRAFTED BY FAISAL
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-gold text-[11px] uppercase tracking-[0.3em] font-bold mb-2">The Studio</h3>
            <div className="flex flex-col items-center md:items-start gap-3">
              <Link to="/about" className="text-[11px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100 hover:text-gold transition-all">About Us</Link>
              <Link to="/shipping" className="text-[11px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100 hover:text-gold transition-all">Shipping & Delivery</Link>
              <Link to="/terms" className="text-[11px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100 hover:text-gold transition-all">Terms & Conditions</Link>
              <Link to="/privacy" className="text-[11px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100 hover:text-gold transition-all">Privacy Policy</Link>
            </div>
          </div>

          {/* Order Actions */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <h3 className="text-gold text-[11px] uppercase tracking-[0.3em] font-bold mb-2">Connect</h3>
            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              <button 
                onClick={() => {
                  // @ts-ignore
                  const rawNumber = config?.whatsappNumber || (import.meta as any).env.VITE_WHATSAPP_NUMBER || "";
                  const whatsappNumber = rawNumber.replace(/\D/g, "");
                  window.open(`https://wa.me/${whatsappNumber}`, "_blank");
                }}
                className="flex items-center justify-center gap-3 px-6 py-3 border border-gold/30 text-[10px] uppercase tracking-[0.2em] hover:bg-stone hover:text-emerald-deep transition-all font-bold w-full"
              >
                <Phone size={12} />
                WhatsApp Order
              </button>
              <button 
                // @ts-ignore
                onClick={() => window.location.href = `mailto:${config?.orderEmail || (import.meta as any).env.VITE_ORDER_EMAIL}`}
                className="flex items-center justify-center gap-3 px-6 py-3 border border-gold/30 text-[10px] uppercase tracking-[0.2em] hover:bg-stone hover:text-emerald-deep transition-all font-bold w-full"
              >
                <Mail size={12} />
                Email Order
              </button>
              <div className="flex justify-center md:justify-end gap-6 mt-2 opacity-60">
                <a href="#" className="hover:text-gold transition-colors"><Instagram size={18} /></a>
                <a href="#" className="hover:text-gold transition-colors"><Facebook size={18} /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
