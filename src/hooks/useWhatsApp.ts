"use client";

import { useMemo } from "react";
import { getWhatsAppLink } from "@/lib/utils";
import type { IProduct } from "@/types";

export function useWhatsApp(phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000") {
  return useMemo(
    () => ({
      getProductLink: (product: IProduct) => getWhatsAppLink(product, phone),
      getGeneralLink: (message = "Assalam o Alaikum! I need help with my order.") =>
        `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`,
    }),
    [phone],
  );
}
