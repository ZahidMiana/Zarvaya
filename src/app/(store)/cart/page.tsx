"use client";

import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import CartItem from "@/components/store/CartItem";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, shippingCost, total, updateQuantity, removeItem } = useCart();

  return (
    <div className="space-y-8">
      <PageHeader title="Your Cart" subtitle="Review your selected pieces and continue to checkout." />

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center">
          <p className="text-charcoal/75">Your cart is currently empty.</p>
          <Link
            href="/shop"
            className="mt-4 inline-flex h-9 items-center rounded-full bg-charcoal px-4 text-sm font-medium text-cream transition-colors hover:bg-gold-dark"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
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
          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5">
            <p className="font-playfair text-2xl">Order Summary</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-full bg-charcoal px-4 text-sm font-medium text-cream transition-colors hover:bg-gold-dark"
            >
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
