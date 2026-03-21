"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
};

const createNoopStorage = (): Storage => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
});

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
    }),
    {
      name: "zarvaya-wishlist",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? createNoopStorage() : localStorage,
      ),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);
