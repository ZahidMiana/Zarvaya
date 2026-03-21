"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/shop", label: "Collections" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/shop?sort=trending", label: "Trending" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-[18px] w-[18px]">
      <path d="M4 7H20" />
      <path d="M4 12H20" />
      <path d="M4 17H20" />
    </svg>
  );
}

export default function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button size="icon" variant="outline" className="rounded-full border-charcoal/25 md:hidden" aria-label="Open menu" />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="bg-cream">
        <SheetHeader>
          <SheetTitle className="font-playfair text-2xl tracking-[0.12em] text-charcoal">ZARVAYA</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 grid gap-1">
          {links.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={link.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium tracking-[0.08em] text-charcoal transition-colors hover:bg-gold-light/35"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="mt-8 rounded-2xl border border-gold/30 bg-white/80 p-4 text-xs text-charcoal/70">
          WhatsApp Concierge: +92 3XX XXXXXXX
        </div>
      </SheetContent>
    </Sheet>
  );
}
