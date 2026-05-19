import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { SiteConfig } from "@/src/types";

interface WhatsAppFloatingProps {
  config: SiteConfig | null;
}

export function WhatsAppFloating({ config }: WhatsAppFloatingProps) {
  if (!config?.whatsappNumber) return null;

  // Remove any non-numeric characters from the phone number
  const cleanNumber = config.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-[60] group flex items-center gap-3 bg-[#25D366] text-white pr-6 pl-4 py-3 rounded-full shadow-2xl hover:bg-[#20ba5a] transition-all duration-300"
      title="Chat on WhatsApp"
    >
      <div className="relative">
        <MessageCircle size={24} fill="currentColor" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>
      <span className="font-bold text-sm tracking-wide">Chat with us</span>
    </motion.a>
  );
}
