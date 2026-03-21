import {
  ProductCategory,
  ProductMaterial,
  ProductOccasion,
  type IProduct,
  type IProductImage,
} from "@/types";
import { generateSlug } from "@/lib/utils";

const now = new Date().toISOString();
const localImages = ["/file.svg", "/globe.svg", "/next.svg", "/vercel.svg", "/window.svg"];

function image(seed: string, alt: string): IProductImage {
  const index = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % localImages.length;

  return {
    url: localImages[index],
    publicId: `zarvaya/local/${seed}`,
    alt,
    isPrimary: true,
  };
}

export const sampleProducts: IProduct[] = [
  {
    _id: "p1",
    name: "Noor Kundan Necklace Set",
    slug: generateSlug("Noor Kundan Necklace Set"),
    sku: "ZJ-NECKLACE-001",
    description:
      "A regal kundan necklace set with matching earrings, handcrafted for festive and bridal occasions.",
    shortDescription: "Handcrafted kundan elegance with timeless detailing.",
    category: ProductCategory.NECKLACE,
    subcategory: "haar",
    material: ProductMaterial.KUNDAN,
    price: 18500,
    discountPrice: 16500,
    stock: 12,
    images: [image("sample-p1", "Noor Kundan Necklace Set")],
    tags: ["bridal", "kundan", "necklace"],
    occasion: [ProductOccasion.BRIDAL, ProductOccasion.FESTIVE],
    isAvailable: true,
    isTrending: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    views: 620,
    soldCount: 40,
    rating: 4.8,
    reviewCount: 124,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "p2",
    name: "Mehar Gold-Plated Jhumky",
    slug: generateSlug("Mehar Gold-Plated Jhumky"),
    sku: "ZJ-JHUMKY-001",
    description: "Statement jhumky featuring intricate floral engraving with a lightweight premium finish.",
    shortDescription: "Signature Pakistani jhumky with a modern silhouette.",
    category: ProductCategory.JHUMKY,
    subcategory: "chandbali",
    material: ProductMaterial.GOLD_PLATED,
    price: 4200,
    discountPrice: 3550,
    stock: 40,
    images: [image("sample-p2", "Mehar Gold-Plated Jhumky")],
    tags: ["jhumky", "gold-plated", "wedding"],
    occasion: [ProductOccasion.PARTY, ProductOccasion.FESTIVE],
    isAvailable: true,
    isTrending: true,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    views: 410,
    soldCount: 26,
    rating: 4.6,
    reviewCount: 86,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "p3",
    name: "Sahar Adjustable Ring",
    slug: generateSlug("Sahar Adjustable Ring"),
    sku: "ZJ-RING-001",
    description: "Minimal adjustable ring with a polished texture, designed for daily wear and gifting.",
    shortDescription: "Minimal premium ring crafted for everyday luxury.",
    category: ProductCategory.RING,
    subcategory: "adjustable",
    material: ProductMaterial.SILVER,
    price: 2600,
    stock: 60,
    images: [image("sample-p3", "Sahar Adjustable Ring")],
    tags: ["ring", "minimal", "gift"],
    occasion: [ProductOccasion.DAILY, ProductOccasion.OFFICE],
    isAvailable: true,
    isTrending: false,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    views: 220,
    soldCount: 19,
    rating: 4.5,
    reviewCount: 54,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "p4",
    name: "Roya Bangles Pair",
    slug: generateSlug("Roya Bangles Pair"),
    sku: "ZJ-BANGLES-001",
    description: "Elegant bangle pair with refined texture and anti-tarnish coating for long-lasting shine.",
    shortDescription: "Elegant bangles for formal and festive looks.",
    category: ProductCategory.BANGLES,
    subcategory: "pair",
    material: ProductMaterial.BRASS,
    price: 6800,
    stock: 18,
    images: [image("sample-p4", "Roya Bangles Pair")],
    tags: ["bangles", "festive", "party"],
    occasion: [ProductOccasion.PARTY, ProductOccasion.FESTIVE],
    isAvailable: true,
    isTrending: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    views: 390,
    soldCount: 31,
    rating: 4.7,
    reviewCount: 67,
    createdAt: now,
    updatedAt: now,
  },
];

export const sampleCategories = [
  { key: ProductCategory.NECKLACE, label: "Necklaces" },
  { key: ProductCategory.JHUMKY, label: "Jhumky" },
  { key: ProductCategory.RING, label: "Rings" },
  { key: ProductCategory.BANGLES, label: "Bangles" },
  { key: ProductCategory.SET, label: "Sets" },
  { key: ProductCategory.ANKLET, label: "Anklets" },
];

export const sampleTestimonials = [
  {
    id: 1,
    name: "Areeba M.",
    city: "Lahore",
    quote: "Packaging, quality, aur finish sab premium thi. Exactly luxury feel aaya.",
  },
  {
    id: 2,
    name: "Hira S.",
    city: "Karachi",
    quote: "Mera bridal set expected se bhi zyada beautiful nikla. Highly recommended.",
  },
  {
    id: 3,
    name: "Sana R.",
    city: "Islamabad",
    quote: "WhatsApp ordering bohat smooth thi aur delivery fast aayi.",
  },
];

export const sampleBlogPosts = [
  {
    slug: "how-to-style-jhumky",
    title: "How to Style Jhumky for Day and Night Looks",
    excerpt: "A practical guide to pairing traditional jhumky with contemporary Pakistani outfits.",
  },
  {
    slug: "bridal-necklace-guide",
    title: "Choosing the Perfect Bridal Necklace in Pakistan",
    excerpt: "Kundan, polki, ya minimal? Learn what suits your wedding aesthetic best.",
  },
];
