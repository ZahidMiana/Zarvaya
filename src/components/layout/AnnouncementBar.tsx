"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const announcements = [
  "Free Delivery on orders above PKR 3,000",
  "Cash on Delivery Available Nationwide",
  "New Bridal Collection Now Available",
  "WhatsApp us: +92 3XX XXXXXXX",
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const hidden = window.localStorage.getItem("zarvaya-announcement-hidden") === "true";
    if (hidden) {
      setIsVisible(false);
      return;
    }

    const timer = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  const dismiss = () => {
    window.localStorage.setItem("zarvaya-announcement-hidden", "true");
    setIsVisible(false);
  };

  return (
    <div className="relative z-[60] border-b border-white/10 bg-charcoal text-cream">
      <div className="mx-auto flex h-8 w-full max-w-[1800px] items-center px-4 sm:px-6 lg:px-8">
        <div className="hidden flex-1 items-center justify-center md:flex">
          <AnimatePresence mode="wait">
            <motion.p
              key={announcements[messageIndex]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="text-[11px] tracking-[0.1em]"
            >
              {announcements[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="relative flex h-full flex-1 items-center overflow-hidden md:hidden">
          <motion.div
            className="flex w-max items-center gap-8 whitespace-nowrap text-[10px] tracking-[0.1em]"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 14, ease: "linear", repeat: Infinity }}
          >
            {[...announcements, ...announcements].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </motion.div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-cream/80 transition hover:bg-white/10 hover:text-cream"
          aria-label="Dismiss announcement bar"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
