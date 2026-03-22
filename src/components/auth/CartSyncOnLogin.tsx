"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

export default function CartSyncOnLogin() {
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const replaceCart = useCartStore((state) => state.replaceCart);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!session?.user?.id || synced) {
        return;
      }

      const response = await fetch("/api/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });

      const result = await response.json();
      if (response.ok && result?.data?.items) {
        const normalized = result.data.items
          .map((item: { product: { _id: string; slug: string; name: string; thumbnail?: string; images?: Array<{ url: string }>; price: number; discountPrice?: number; category: string; stock: number; }; quantity: number; }) => ({
            productId: String(item.product._id),
            slug: item.product.slug,
            name: item.product.name,
            image: item.product.thumbnail ?? item.product.images?.[0]?.url ?? "/placeholders/jewelry-fallback.svg",
            price: typeof item.product.discountPrice === "number" ? item.product.discountPrice : item.product.price,
            discountPrice: typeof item.product.discountPrice === "number" ? item.product.price : undefined,
            quantity: item.quantity,
            category: item.product.category,
            stock: item.product.stock,
          }));

        replaceCart(normalized);
      }

      setSynced(true);
    };

    void run();
  }, [items, replaceCart, session?.user?.id, synced]);

  return null;
}
