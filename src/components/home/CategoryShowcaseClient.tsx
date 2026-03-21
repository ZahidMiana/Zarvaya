"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FallbackImage from "@/components/ui/FallbackImage";

export type CategoryShowcaseItem = {
  slug: string;
  name: string;
  count: number;
  imageUrl: string;
};

type Props = {
  categories: CategoryShowcaseItem[];
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CategoryShowcaseClient({ categories }: Props) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible">
      {categories.map((category, index) => (
        <motion.article
          key={category.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, delay: index * 0.06, ease: EASE }}
          className="group relative min-w-[72%] snap-start overflow-hidden rounded-2xl border border-stone-200 bg-charcoal sm:min-w-[48%] lg:min-w-0"
        >
          <Link href={`/categories/${category.slug}`} className="relative block aspect-[3/4]">
            <FallbackImage
              src={category.imageUrl}
              fallbackSrc="/placeholders/jewelry-fallback.svg"
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent transition-colors duration-500 group-hover:from-charcoal/55" />
            <div className="absolute bottom-4 left-4 z-10">
              <p className="font-playfair text-xl text-cream">{category.name}</p>
              <p className="mt-1 text-xs tracking-[0.08em] text-gold">{category.count} pieces</p>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
