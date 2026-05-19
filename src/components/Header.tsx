import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteConfig } from "@/src/types";

interface HeaderProps {
  config: SiteConfig | null;
}

export function Header({ config }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      navigate("/admin");
      setLogoClicks(0);
    } else {
      setLogoClicks(newCount);
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-stone/80 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-12 h-24 flex items-center justify-between">
        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-emerald-deep/60">
          <a href="#gallery" className="hover:text-emerald-deep transition-colors">Designs</a>
          <a href="#work-gallery" className="hover:text-emerald-deep transition-colors">Our Work</a>
          <a href="#concept" className="hover:text-emerald-deep transition-colors">Process</a>
        </div>

        <motion.div 
          onClick={handleLogoClick}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="cursor-pointer select-none active:scale-95 transition-transform"
        >
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="HUROOF" className="h-12 md:h-16 w-auto object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-4xl md:text-5xl font-serif tracking-[0.1em] text-emerald-deep font-medium">HUROOF</span>
          )}
        </motion.div>

        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-emerald-deep/60">
          <a href="#footer" className="hover:text-emerald-deep transition-colors">Contact</a>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button onClick={() => setIsOpen(!isOpen)} className="text-emerald-deep">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-stone border-t border-gold/10"
      >
        <div className="flex flex-col gap-6 p-8 text-center text-[13px] uppercase tracking-widest font-bold text-emerald-deep">
          <a href="#gallery" onClick={() => setIsOpen(false)}>Designs</a>
          <a href="#work-gallery" onClick={() => setIsOpen(false)}>Our Work</a>
          <a href="#concept" onClick={() => setIsOpen(false)}>Process</a>
          <a href="#footer" onClick={() => setIsOpen(false)}>Contact</a>
        </div>
      </motion.div>
    </header>
  );
}
