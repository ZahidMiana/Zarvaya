"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useWishlistStore } from "@/store/wishlistStore";
import FallbackImage from "@/components/ui/FallbackImage";
import type { IProduct } from "@/types";

type ProductCardProps = {
  product: IProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has(product._id ?? product.slug));

  const productId = product._id ?? product.slug;
  const primaryImage = product.images[0]?.url ?? getPrimaryImageUrl(product);
  const secondaryImage = product.images[1]?.url;
  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = typeof product.discountPrice === "number" && product.discountPrice < product.price;
  const savePercent = hasDiscount ? Math.round(((product.price - effectivePrice) / product.price) * 100) : 0;

  const onWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(productId);
  };

  function HeartIcon({ filled }: { filled?: boolean }) {
    return (
      <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5" aria-hidden="true">
        <path d="M12 20.2C11.8 20.2 11.6 20.1 11.4 20C7.1 16.4 4 13.5 4 9.7C4 7.3 5.9 5.4 8.3 5.4C9.8 5.4 11.2 6.2 12 7.4C12.8 6.2 14.2 5.4 15.7 5.4C18.1 5.4 20 7.3 20 9.7C20 13.5 16.9 16.4 12.6 20C12.4 20.1 12.2 20.2 12 20.2Z" />
      </svg>
    );
  }

  function BagIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
        <path d="M6.5 8.5H17.5L16.4 20H7.6L6.5 8.5Z" />
        <path d="M9 8.5V7.5C9 5.8 10.3 4.5 12 4.5C13.7 4.5 15 5.8 15 7.5V8.5" />
      </svg>
    );
  }

  const onAdd = () => {
    addItem(product, 1);
    openDrawer();
  };

  return (
    <article className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_8px_22px_rgba(26,26,26,0.04)] transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(26,26,26,0.1)]">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-cream-dark">
        <FallbackImage
          src={primaryImage}
          fallbackSrc="/placeholders/jewelry-fallback.svg"
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:-translate-x-full"
        />
        {secondaryImage ? (
          <FallbackImage
            src={secondaryImage}
            fallbackSrc={primaryImage || "/placeholders/jewelry-fallback.svg"}
            alt={`${product.name} alternate`}
            fill
            className="object-cover translate-x-full transition-transform duration-700 group-hover:translate-x-0"
          />
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {product.isNewArrival ? (
            <span className="rounded-full bg-gold px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-charcoal">NEW</span>
          ) : null}
          {hasDiscount ? (
            <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white">SALE</span>
          ) : null}
          {product.isTrending ? (
            <span className="rounded-full bg-charcoal px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-cream">TRENDING</span>
          ) : null}
        </div>

        <motion.button
          type="button"
          onClick={onWishlist}
          whileTap={{ scale: 0.92 }}
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-charcoal opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
          aria-label="Toggle wishlist"
        >
          <HeartIcon filled={isWishlisted} />
        </motion.button>
      </Link>

      <div className="space-y-2 p-4 pb-[68px]">
        <p className="text-[11px] uppercase tracking-[0.1em] text-gold">{product.category}</p>
        <Link href={`/shop/${product.slug}`} className="line-clamp-2 text-[14px] font-medium text-charcoal/95 transition hover:text-charcoal">
          {product.name}
        </Link>

        <div className="flex flex-wrap items-end gap-y-1">
          <span className="text-base font-semibold text-charcoal">{formatPrice(effectivePrice)}</span>
          {hasDiscount ? (
            <>
              <span className="ml-2 text-[13px] text-charcoal/45 line-through">{formatPrice(product.price)}</span>
              <span className="ml-2 text-[11px] font-medium text-gold">Save {savePercent}%</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 translate-y-0 border-t border-stone-200 bg-white p-3 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] md:translate-y-full md:group-hover:translate-y-0">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-[13px] font-medium tracking-[0.06em] text-cream transition-colors duration-500 hover:bg-gold hover:text-charcoal"
        >
          <BagIcon />
          Add to Bag
        </button>
        <a
          href={`https://wa.me/923000000000?text=${encodeURIComponent(`Quick buy request for ${product.name}`)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-[10px] tracking-[0.08em] text-charcoal/58"
        >
          Quick Buy via WhatsApp
        </a>
      </div>
    </article>
  );
}
