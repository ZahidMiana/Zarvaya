import { z } from "zod";
import { Courier, OrderProvince, OrderStatus, PaymentMethod, ProductCategory, ProductMaterial, ProductOccasion } from "@/types";

export const pakistanPhoneRegex = /^(03[0-9]{9}|92[0-9]{10})$/;

const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().min(2).max(180),
  isPrimary: z.boolean().default(false),
});

export const productCreateSchema = z.object({
  name: z.string().min(3).max(200),
  category: z.nativeEnum(ProductCategory),
  subcategory: z.string().trim().max(120).optional(),
  description: z.string().min(10).max(2000),
  shortDescription: z.string().trim().max(200).optional(),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional(),
  images: z.array(productImageSchema).min(1),
  material: z.nativeEnum(ProductMaterial),
  occasion: z.array(z.nativeEnum(ProductOccasion)).default([]),
  weight: z.string().trim().max(40).optional(),
  dimensions: z.string().trim().max(60).optional(),
  stock: z.number().int().nonnegative().default(0),
  isAvailable: z.boolean().default(true),
  isTrending: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1)).default([]),
  metaTitle: z.string().trim().max(180).optional(),
  metaDescription: z.string().trim().max(320).optional(),
  views: z.number().int().nonnegative().default(0),
  soldCount: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().nonnegative().default(0),
  relatedProducts: z.array(z.string()).default([]),
});

export const productUpdateSchema = productCreateSchema.partial();

export const orderCreateSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(120),
    phone: z.string().regex(pakistanPhoneRegex),
    email: z.string().email().optional(),
    whatsapp: z.string().regex(pakistanPhoneRegex).optional(),
  }),
  shippingAddress: z.object({
    street: z.string().trim().max(220).optional(),
    area: z.string().trim().max(220).optional(),
    city: z.string().min(2).max(120),
    province: z.nativeEnum(OrderProvince),
    postalCode: z.string().trim().max(25).optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().trim().max(500).optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().trim().max(300).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  courier: z.nativeEnum(Courier).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(pakistanPhoneRegex).optional(),
  subject: z.enum(["order-support", "product-query", "collaboration", "other"]),
  message: z.string().min(10).max(2000),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(8),
  phone: z.string().regex(pakistanPhoneRegex),
});

// Backward-compatible exports for existing imports.
export const productSchema = productCreateSchema;
export const orderSchema = orderCreateSchema;
