import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IProduct, IProductImage } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const serial = String(Math.floor((Date.now() % 100000) + Math.random() * 999)).padStart(5, "0");
  return `ZJ-${year}-${serial}`;
}

export function getWhatsAppLink(product: IProduct, phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, "");
  const message = `Assalam o Alaikum! I want to order ${product.name} (${formatPrice(
    product.price,
  )}). Product URL slug: ${product.slug}`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function getPrimaryImage(images: IProductImage[]): IProductImage | undefined {
  if (!images.length) {
    return undefined;
  }

  return images.find((image) => image.isPrimary) ?? images[0];
}

export function getPrimaryImageUrl(product: IProduct): string {
  if (product.thumbnail) {
    return product.thumbnail;
  }

  const primary = getPrimaryImage(product.images);
  return primary?.url ?? "/file.svg";
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, Math.max(0, length - 3)).trimEnd()}...`;
}
