import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { SiteConfig } from "@/src/types";

interface WhatsAppFloatingProps {
  config: SiteConfig | null;
}

export function WhatsAppFloating({ config }: WhatsAppFloatingProps) {
  // Try to use config number, but if it is empty, generic placeholder, or null, fallback to the env variable
  const rawNumber = config?.whatsappNumber && config.whatsappNumber !== "0000000000" && config.whatsappNumber.trim() !== ""
    ? config.whatsappNumber 
    : ((import.meta as any).env.VITE_WHATSAPP_NUMBER || "");

  if (!rawNumber) return null;

  // Remove any non-numeric characters from the phone number
  const cleanNumber = rawNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ y: 100, opacity: 0, scale: 0.5 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        boxShadow: "0 20px 50px rgba(37,211,102,0.5)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 20 
      }}
      className="fixed bottom-10 right-10 z-[100] group flex items-center gap-3 bg-gradient-to-br from-[#25D366] via-[#25D366] to-[#128C7E] text-white pr-7 pl-5 py-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] overflow-hidden ring-2 ring-white/20"
      title="Chat on WhatsApp"
    >
      {/* Shine effect */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "200%", opacity: [0, 0.5, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 3, 
          ease: "linear",
          repeatDelay: 2
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
      />

      <div className="relative">
        <MessageCircle size={26} fill="currentColor" className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-white/90 border-2 border-[#25D366]"></span>
        </span>
      </div>
      
      <div className="flex flex-col">
        <span className="font-bold text-[13px] uppercase tracking-[0.1em] leading-tight">Chat with us</span>
        <span className="text-[10px] opacity-80 font-medium">Quick Support</span>
      </div>
    </motion.a>
  );
}
