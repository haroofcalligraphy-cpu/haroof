import { motion, AnimatePresence } from "motion/react";
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
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (clickTimeout) clearTimeout(clickTimeout);
    
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      navigate("/admin");
      setLogoClicks(0);
    } else {
      setLogoClicks(newCount);
      const timeout = setTimeout(() => {
        setLogoClicks(0);
      }, 3000); // 3 seconds window to complete 5 clicks
      setClickTimeout(timeout);
    }
  };

  const navItems = [
    { label: "Designs", href: "#gallery" },
    { label: "Our Work", href: "#work-gallery" },
    { label: "Process", href: "#concept" },
    { label: "Contact", href: "#footer" },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-stone/80 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-12 h-24 grid grid-cols-3 items-center">
        {/* Left: Desktop Nav */}
        <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-emerald-deep/60 justify-start">
          {navItems.slice(0, 3).map((item) => (
            <a key={item.label} href={item.href} className="hover:text-emerald-deep transition-colors">
              {item.label}
            </a>
          ))}
        </div>
        {/* Mobile Spacer (replaces the left nav column on mobile to keep symmetry) */}
        <div className="md:hidden"></div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <motion.div 
            onClick={handleLogoClick}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="cursor-pointer select-none active:scale-95 transition-transform flex justify-center"
          >
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="HUROOF" className="h-12 md:h-16 w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-4xl md:text-5xl font-serif tracking-[0.1em] text-emerald-deep font-medium text-center">HUROOF</span>
            )}
          </motion.div>
        </div>

        {/* Right: Desktop Contact / Mobile Hamburger Menu button */}
        <div className="flex justify-end items-center">
          <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-emerald-deep/60">
            <a href="#footer" className="hover:text-emerald-deep transition-colors">Contact</a>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-emerald-deep p-2">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={28} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={28} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0, 0.67, 0] }}
            className="md:hidden overflow-hidden bg-stone border-t border-gold/10"
          >
            <div className="flex flex-col gap-6 p-8 text-center text-[13px] uppercase tracking-widest font-bold text-emerald-deep">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
