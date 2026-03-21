"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useWhatsApp } from "@/hooks/useWhatsApp";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const { getGeneralLink } = useWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000");

  if (pathname === "/checkout") {
    return null;
  }

  return (
    <Link
      href={getGeneralLink("Hello ZARVAYA JEWELS")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_rgba(37,211,102,0.42)] transition hover:scale-105"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/45" />
      <MessageCircle size={22} className="relative z-10" />
      <span className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-x-full -translate-y-1/2 rounded-full bg-charcoal px-3 py-1.5 text-xs tracking-[0.08em] text-cream shadow-lg sm:block">
        Chat with us
      </span>
    </Link>
  );
}
