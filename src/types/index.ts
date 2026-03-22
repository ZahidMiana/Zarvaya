export enum ProductCategory {
  NECKLACE = "necklace",
  JHUMKY = "jhumky",
  RING = "ring",
  BANGLES = "bangles",
  SET = "set",
  ANKLET = "anklet",
}

export enum ProductMaterial {
  GOLD_PLATED = "gold-plated",
  SILVER = "silver",
  ROSE_GOLD = "rose-gold",
  KUNDAN = "kundan",
  PEARL = "pearl",
  OXIDIZED = "oxidized",
  BRASS = "brass",
}

export enum ProductOccasion {
  BRIDAL = "bridal",
  CASUAL = "casual",
  PARTY = "party",
  DAILY = "daily",
  FESTIVE = "festive",
  OFFICE = "office",
}

export enum OrderProvince {
  PUNJAB = "Punjab",
  SINDH = "Sindh",
  KPK = "KPK",
  BALOCHISTAN = "Balochistan",
  ISLAMABAD = "Islamabad",
}

export enum OrderStatus {
  PLACED = "placed",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  PACKED = "packed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  COD = "cod",
  EASYPAISA = "easypaisa",
  JAZZCASH = "jazzcash",
  BANK_TRANSFER = "bank-transfer",
}

export enum Courier {
  LEOPARDS = "leopards",
  TCS = "tcs",
  TRAX = "trax",
  CALL_COURIER = "call-courier",
  OTHER = "other",
}

export interface IProductImage {
  url: string;
  publicId: string;
  alt: string;
  isPrimary: boolean;
}

export interface IProduct {
  _id?: string;
  name: string;
  slug: string;
  sku?: string;
  category: ProductCategory;
  subcategory?: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  images: IProductImage[];
  thumbnail?: string;
  material: ProductMaterial;
  occasion: ProductOccasion[];
  weight?: string;
  dimensions?: string;
  stock: number;
  isAvailable: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  views: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  relatedProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  product: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  discountPrice?: number;
}

export interface IOrderCustomer {
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
}

export interface IShippingAddress {
  street?: string;
  area?: string;
  city: string;
  province: OrderProvince;
  postalCode?: string;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  customer: IOrderCustomer;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courier?: Courier;
  notes?: string;
  adminNotes?: string;
  statusHistory: IOrderStatusHistory[];
  isWhatsAppNotified: boolean;
  isEmailNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  category: ProductCategory;
  stock: number;
}

export interface IUser {
  _id?: string;
  name: string;
  email?: string;
  passwordHash?: string;
  googleId?: string;
  authProvider: "email" | "google" | "phone";
  role: "admin" | "customer";
  phone?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "female" | "male" | "other" | "prefer-not-to-say";
  savedAddresses: IUserAddress[];
  cart: IUserServerCartItem[];
  wishlist: string[];
  orderHistory: string[];
  isActive: boolean;
  lastLoginAt?: string;
  lastLoginMethod?: "email" | "google" | "phone";
  createdAt: string;
  updatedAt: string;
}

export interface IUserAddress {
  _id?: string;
  label: string;
  street?: string;
  area?: string;
  city: string;
  province?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface IUserServerCartItem {
  product: string;
  quantity: number;
  addedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}
