"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import CartItem from "@/components/store/CartItem";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

export default function CartDrawer() {
  const {
    isReady,
    isOpen,
    items,
    itemCount,
    subtotal,
    shippingCost,
    total,
    updateQuantity,
    removeItem,
    closeDrawer,
  } = useCart();

  const amountToFreeShipping = Math.max(0, 3000 - subtotal);
  const shippingProgress = useMemo(() => {
    if (subtotal <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((subtotal / 3000) * 100));
  }, [subtotal]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart drawer"
            className="fixed inset-0 z-[70] bg-charcoal/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={closeDrawer}
          />

          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[71] flex h-[100dvh] w-full flex-col bg-cream shadow-2xl sm:w-[420px]"
          >
            <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <h3 className="font-playfair text-2xl text-charcoal">Your Bag ({isReady ? itemCount : 0})</h3>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-charcoal transition hover:border-charcoal"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isReady && items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItem
                      key={item.productId}
                      item={item}
                      onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                      onRemove={() => removeItem(item.productId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
                  <ShoppingBag className="h-9 w-9 text-charcoal/45" />
                  <p className="mt-3 font-playfair text-2xl text-charcoal">Your bag is empty</p>
                  <p className="mt-2 text-sm text-charcoal/65">Add your favorite pieces to continue.</p>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="mt-5 inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm text-cream transition hover:bg-gold hover:text-charcoal"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>

            <footer className="sticky bottom-0 space-y-3 border-t border-stone-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between text-sm text-charcoal/75">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-charcoal/75">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? "font-semibold text-green-600" : "font-semibold text-charcoal"}>
                  {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-charcoal/60">
                  {amountToFreeShipping > 0
                    ? `Add ${formatPrice(amountToFreeShipping)} more for free shipping`
                    : "You unlocked free shipping"}
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                <span className="text-sm font-semibold text-charcoal">Total</span>
                <span className="text-xl font-bold text-charcoal">{formatPrice(total)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-charcoal text-sm tracking-[0.08em] text-cream transition hover:bg-gold hover:text-charcoal"
              >
                Proceed to Checkout
              </Link>

              <button
                type="button"
                onClick={closeDrawer}
                className="w-full text-center text-xs tracking-[0.08em] text-charcoal/65 underline-offset-4 transition hover:text-charcoal hover:underline"
              >
                Continue Shopping
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-charcoal/62">
                <span className="rounded-full border border-stone-300 px-2 py-1">COD</span>
                <span className="rounded-full border border-stone-300 px-2 py-1">EasyPaisa</span>
                <span className="rounded-full border border-stone-300 px-2 py-1">JazzCash</span>
              </div>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
