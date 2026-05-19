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
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#20ba5a] transition-colors"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={28} fill="currentColor" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
    </motion.a>
  );
}
