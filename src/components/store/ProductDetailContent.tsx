"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/common/Breadcrumb";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useWishlistStore } from "@/store/wishlistStore";
import type { IProduct } from "@/types";

type ProductDetailContentProps = {
  product: IProduct;
  siteUrl: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(rating);
        return (
          <svg
            key={`star-${index}`}
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-gold"
            aria-hidden="true"
          >
            <path d="M12 3.8L14.7 9.3L20.7 10.2L16.3 14.5L17.4 20.6L12 17.7L6.6 20.6L7.7 14.5L3.3 10.2L9.3 9.3L12 3.8Z" />
          </svg>
        );
      })}
    </div>
  );
}

function ShareRow({ shareUrl, productName }: { shareUrl: string; productName: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 pt-4">
      <span className="text-xs uppercase tracking-[0.12em] text-charcoal/55">Share</span>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }}
        className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-charcoal/80"
      >
        {copied ? "Copied" : "Copy Link"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${productName} - ${shareUrl}`)}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-charcoal/80"
      >
        WhatsApp Share
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-charcoal/80"
      >
        Facebook Share
      </a>
    </div>
  );
}

export function ProductTabsSection({ product }: { product: IProduct }) {
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");

  return (
    <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { key: "description", label: "Description" },
          { key: "details", label: "Details" },
          { key: "reviews", label: "Reviews" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as "description" | "details" | "reviews")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeTab === tab.key
                ? "bg-charcoal text-cream"
                : "border border-stone-300 text-charcoal/75 hover:border-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "description" ? (
        <p className="font-playfair text-lg leading-relaxed text-charcoal/85">{product.description}</p>
      ) : null}

      {activeTab === "details" ? (
        <dl className="grid gap-3 text-sm text-charcoal/75 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.1em] text-charcoal/50">Material</dt>
            <dd className="mt-1">{product.material.replace(/-/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.1em] text-charcoal/50">Occasion</dt>
            <dd className="mt-1">{product.occasion.join(", ") || "Everyday"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.1em] text-charcoal/50">Weight</dt>
            <dd className="mt-1">{product.weight ?? "18g"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.1em] text-charcoal/50">Dimensions</dt>
            <dd className="mt-1">{product.dimensions ?? "6cm x 4cm"}</dd>
          </div>
        </dl>
      ) : null}

      {activeTab === "reviews" ? (
        <div className="space-y-3">
          {[
            "Beautiful finish and exactly as shown in photos.",
            "Great quality and very elegant for events.",
            "Fast delivery and premium packaging.",
          ].map((review, index) => (
            <article key={`review-${index}`} className="rounded-2xl border border-stone-200 bg-cream-dark/45 p-4">
              <Stars rating={5} />
              <p className="mt-2 text-sm text-charcoal/78">{review}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function ProductDetailContent({ product, siteUrl }: ProductDetailContentProps) {
  const { addItem, openDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has(product._id ?? product.slug));

  const effectivePrice = product.discountPrice ?? product.price;
  const saveAmount = Math.max(0, product.price - effectivePrice);
  const savePercent = product.price > 0 ? Math.round((saveAmount / product.price) * 100) : 0;
  const stock = Math.max(0, product.stock);
  const shareUrl = `${siteUrl.replace(/\/$/, "")}/shop/${product.slug}`;

  const badges = useMemo(() => {
    const items: string[] = [];
    if (product.isNewArrival) {
      items.push("New Arrival");
    }
    if (product.isTrending) {
      items.push("Trending");
    }
    if (stock > 0 && stock < 5) {
      items.push(`Only ${stock} Left!`);
    }
    return items;
  }, [product.isNewArrival, product.isTrending, stock]);

  const onAddToBag = () => {
    addItem(product, quantity);
    openDrawer();
  };

  const whatsappMessage = [
    "Assalam o Alaikum!",
    `I want to order: ${product.name}`,
    `Price: ${formatPrice(effectivePrice)}`,
    `Quantity: ${quantity}`,
    `Product URL: ${shareUrl}`,
  ].join("\n");

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.category, href: `/categories/${product.category}` },
          { label: product.name },
        ]}
      />

      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full bg-gold/18 px-3 py-1 text-xs tracking-[0.08em] text-charcoal">
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      <h1 className="font-playfair text-[22px] leading-tight text-charcoal md:text-[28px]">{product.name}</h1>

      <div className="flex items-center gap-2">
        <Stars rating={product.rating || 4.8} />
        <span className="text-sm text-charcoal/65">{(product.rating || 4.8).toFixed(1)} ({product.reviewCount || 24} reviews)</span>
      </div>

      <div className="space-y-2">
        <p className="text-[24px] font-bold text-charcoal">{formatPrice(effectivePrice)}</p>
        {product.discountPrice ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base text-charcoal/45 line-through">{formatPrice(product.price)}</span>
            <span className="rounded-full bg-gold/18 px-3 py-1 text-xs text-charcoal">
              Save {formatPrice(saveAmount)} ({savePercent}% off)
            </span>
          </div>
        ) : null}
      </div>

      <div className="h-px w-full bg-gold/40" />

      <dl className="grid gap-2 text-sm text-charcoal/78">
        <div>
          <dt className="inline text-charcoal/55">Material: </dt>
          <dd className="inline">{product.material.replace(/-/g, " ")}</dd>
        </div>
        <div>
          <dt className="inline text-charcoal/55">Occasion: </dt>
          <dd className="inline">{product.occasion.join(", ") || "Daily"}</dd>
        </div>
        <div>
          <dt className="inline text-charcoal/55">Weight: </dt>
          <dd className="inline">{product.weight ?? "18g"}</dd>
        </div>
        <div>
          <dt className="inline text-charcoal/55">Dimensions: </dt>
          <dd className="inline">{product.dimensions ?? "6cm x 4cm"}</dd>
        </div>
        <div>
          <dt className="inline text-charcoal/55">SKU: </dt>
          <dd className="inline">{product.sku ?? `ZJ-${product.category.toUpperCase()}-042`}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <p className="text-sm leading-relaxed text-charcoal/78">
          {expanded ? product.description : `${product.description.slice(0, 180)}${product.description.length > 180 ? "..." : ""}`}
        </p>
        {product.description.length > 180 ? (
          <button
            type="button"
            onClick={() => setExpanded((state) => !state)}
            className="text-xs tracking-[0.08em] text-gold-dark"
          >
            {expanded ? "Collapse" : "Read More"}
          </button>
        ) : null}
      </div>

      <div className="inline-flex items-center rounded-full border border-stone-300 p-1">
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="h-8 w-8 rounded-full border border-stone-200 text-sm text-charcoal"
        >
          -
        </button>
        <input
          type="number"
          min={1}
          max={Math.max(1, stock)}
          value={quantity}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) {
              return;
            }
            setQuantity(Math.min(Math.max(1, Math.floor(next)), Math.max(1, stock)));
          }}
          className="w-14 bg-transparent text-center text-sm text-charcoal outline-none"
        />
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.min(Math.max(1, stock), value + 1))}
          className="h-8 w-8 rounded-full border border-stone-200 text-sm text-charcoal"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onAddToBag}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-charcoal text-sm tracking-[0.08em] text-cream transition hover:bg-gold hover:text-charcoal"
        >
          Add to Bag
        </motion.button>

        <a
          href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000").replace(/[^\d]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gold text-sm tracking-[0.08em] text-charcoal transition hover:bg-gold-dark hover:text-cream"
        >
          Order on WhatsApp
        </a>

        <button
          type="button"
          onClick={() => toggleWishlist(product._id ?? product.slug)}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-stone-300 bg-white text-sm tracking-[0.08em] text-charcoal transition hover:border-charcoal"
        >
          <span>{isWishlisted ? "♡" : "♥"}</span>
          Add to Wishlist
        </button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-cream-dark/35 p-4 text-sm text-charcoal/78">
        <p>Free delivery on orders above PKR 3,000</p>
        <p className="mt-1">Cash on Delivery available</p>
        <p className="mt-1">Easy 7-day returns</p>
        <p className="mt-1">Estimated delivery: 3-5 business days</p>
      </div>

      <ShareRow shareUrl={shareUrl} productName={product.name} />

      <div className="pt-3">
        <Link href="/shop" className="text-xs tracking-[0.08em] text-charcoal/60 hover:text-charcoal">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
