"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/ui/FallbackImage";
import type { ICartItem } from "@/types";

type CartItemProps = {
  item: ICartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export default function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const outOfStock = item.stock <= 0 || item.quantity > item.stock;

  useEffect(() => {
    if (!confirmingRemove) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setConfirmingRemove(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [confirmingRemove]);

  const onRemoveClick = () => {
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }

    onRemove();
  };

  return (
    <article className={`relative flex gap-4 rounded-xl border border-stone-200 bg-white p-3 transition ${outOfStock ? "opacity-60" : "opacity-100"}`}>
      {outOfStock ? (
        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
          Out of stock
        </span>
      ) : null}

      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-cream-dark">
        <FallbackImage src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-1">
          <span className="inline-flex w-fit rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-charcoal/75">
            {item.category}
          </span>
          <p className="line-clamp-2 text-sm font-medium text-charcoal">{item.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-charcoal">{formatPrice(item.price)}</p>
            {item.discountPrice ? (
              <p className="text-xs text-charcoal/45 line-through">{formatPrice(item.discountPrice)}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDecrease}
              disabled={item.quantity <= 1}
            >
              <Minus size={13} />
            </Button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onIncrease}
              disabled={item.quantity >= item.stock}
            >
              <Plus size={13} />
            </Button>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            animate={confirmingRemove ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.28 }}
            onClick={onRemoveClick}
            className={`inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs transition ${
              confirmingRemove ? "bg-red-600 text-white" : "text-red-600 hover:bg-red-50"
            }`}
          >
            <Trash2 size={14} />
            <span>{confirmingRemove ? "Confirm" : "Remove"}</span>
          </motion.button>
        </div>
      </div>
    </article>
  );
}
