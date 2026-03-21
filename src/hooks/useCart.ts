"use client";

import { useEffect, useState } from "react";
import {
  selectCartItemCount,
  selectCartShippingCost,
  selectCartSubtotal,
  selectCartTotal,
  useCartStore,
} from "@/store/cartStore";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const isOpen = useCartStore((state) => state.isOpen);
  const hydrated = useCartStore((state) => state.hydrated);

  const itemCount = useCartStore(selectCartItemCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const shippingCost = useCartStore(selectCartShippingCost);
  const total = useCartStore(selectCartTotal);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReady = mounted && hydrated;

  return {
    isReady,
    isOpen,
    items,
    itemCount,
    subtotal,
    shippingCost,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    openDrawer,
    closeDrawer,
  };
}
