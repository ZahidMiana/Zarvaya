"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FallbackImage from "@/components/ui/FallbackImage";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headlineWords = ["Adorn", "Yourself", "With", "Pure", "Elegance"];

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="M6 9L12 15L18 9" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden rounded-[28px] border border-gold/20 bg-[#f7f4ef]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(201,168,76,0.12),transparent_38%),radial-gradient(circle_at_10%_90%,rgba(26,26,26,0.06),transparent_40%)]" />

      <div className="relative grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-6 pb-16 pt-10 sm:px-10 lg:order-1 lg:px-14 lg:pt-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-5 text-[11px] tracking-[0.3em] text-gold"
          >
            NEW COLLECTION 2025
          </motion.p>

          <h1 className="font-playfair text-[40px] leading-[1.04] text-charcoal md:text-[52px] lg:text-[64px]">
            <span className="block">
              {headlineWords.slice(0, 2).map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: EASE }}
                  className="mr-[0.22em] inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {headlineWords.slice(2).map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.18 + index * 0.08, ease: EASE }}
                  className="mr-[0.22em] inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34, ease: EASE }}
            className="mt-6 max-w-[540px] text-base text-charcoal/60"
          >
            Handpicked jewellery for the modern Pakistani woman. From bridal to everyday - find your
            perfect piece.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48, ease: EASE }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3, ease: EASE }}>
              <Link
                href="/shop"
                className="inline-flex h-12 items-center rounded-full bg-charcoal px-6 text-sm font-medium tracking-[0.06em] text-cream transition-colors duration-500 hover:bg-gold"
              >
                Shop Now
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3, ease: EASE }}>
              <Link
                href="/shop"
                className="inline-flex h-12 items-center rounded-full border border-charcoal px-6 text-sm font-medium tracking-[0.06em] text-charcoal transition-colors duration-500 hover:bg-charcoal hover:text-cream"
              >
                View Collections
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="order-1 relative min-h-[52vh] overflow-hidden lg:order-2 lg:min-h-full"
        >
          <FallbackImage
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1880&auto=format&fit=crop"
            fallbackSrc="/placeholders/editorial-fallback.svg"
            alt="Luxury jewellery editorial"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: EASE }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-charcoal/65 md:flex"
      >
        <ChevronDownIcon />
      </motion.div>
    </section>
  );
}
