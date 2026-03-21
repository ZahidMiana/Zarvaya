"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import type { ICartItem, IProduct } from "@/types";

type CartState = {
  items: ICartItem[];
  isOpen: boolean;
  hydrated: boolean;
  addItem: (product: IProduct, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOpen: (open: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

const createNoopStorage = (): Storage => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
});

function toCartItem(product: IProduct, quantity: number): ICartItem {
  const hasDiscount =
    typeof product.discountPrice === "number" &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  return {
    productId: product._id ?? product.slug,
    slug: product.slug,
    name: product.name,
    image: product.thumbnail ?? product.images[0]?.url ?? "/placeholders/jewelry-fallback.svg",
    price: hasDiscount ? product.discountPrice ?? product.price : product.price,
    discountPrice: hasDiscount ? product.price : undefined,
    quantity,
    category: product.category,
    stock: Math.max(0, product.stock),
  };
}

export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectCartShippingCost = (state: CartState) =>
  selectCartSubtotal(state) >= 3000 ? 0 : 150;

export const selectCartTotal = (state: CartState) =>
  selectCartSubtotal(state) + selectCartShippingCost(state);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hydrated: false,
      addItem: (product, quantity) =>
        set((state) => {
          const requestedQty = Math.max(1, Math.floor(quantity || 1));
          const stock = Math.max(0, product.stock);

          if (stock <= 0) {
            toast.error("This item is currently out of stock.");
            return state;
          }

          const productId = product._id ?? product.slug;
          const existing = state.items.find((item) => item.productId === productId);

          if (!existing) {
            const safeQty = Math.min(requestedQty, stock);
            const next = [...state.items, toCartItem(product, safeQty)];
            toast.success(`${product.name} added to your bag.`);
            return { items: next };
          }

          const nextQty = Math.min(existing.quantity + requestedQty, stock);
          if (nextQty === existing.quantity) {
            toast.error(`Maximum available quantity is ${stock}.`);
            return state;
          }

          toast.success(`${product.name} quantity updated in your bag.`);
          return {
            items: state.items.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: nextQty,
                    stock,
                    price:
                      typeof product.discountPrice === "number" && product.discountPrice < product.price
                        ? product.discountPrice
                        : product.price,
                    discountPrice:
                      typeof product.discountPrice === "number" && product.discountPrice < product.price
                        ? product.price
                        : undefined,
                    image: product.thumbnail ?? product.images[0]?.url ?? item.image,
                  }
                : item,
            ),
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.items.find((cartItem) => cartItem.productId === productId);
          if (!item) {
            return state;
          }

          const safeQty = Math.max(1, Math.floor(quantity));
          const clampedQty = Math.min(safeQty, Math.max(1, item.stock));

          if (safeQty > item.stock) {
            toast.error(`Only ${item.stock} item(s) available in stock.`);
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem.productId === productId ? { ...cartItem, quantity: clampedQty } : cartItem,
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      setOpen: (open) => set({ isOpen: open }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "zarvaya-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? createNoopStorage() : localStorage,
      ),
      partialize: (state) => ({ items: state.items, isOpen: state.isOpen }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    },
  ),
);
