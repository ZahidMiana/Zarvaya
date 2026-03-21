import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Counter from "@/models/Counter";
import Product from "@/models/Product";
import {
  ProductCategory,
  ProductMaterial,
  ProductOccasion,
  type IProductImage,
} from "@/types";

type SeedProduct = {
  name: string;
  category: ProductCategory;
  subcategory: string;
  material: ProductMaterial;
  price: number;
  shortDescription: string;
  description: string;
  tags: string[];
  occasion: ProductOccasion[];
  stock: number;
};

function createImages(seed: string, name: string): IProductImage[] {
  return [
    {
      url: `https://picsum.photos/seed/${seed}-1/1200/1500`,
      publicId: `zarvaya/seed/${seed}-1`,
      alt: `${name} primary image`,
      isPrimary: true,
    },
    {
      url: `https://picsum.photos/seed/${seed}-2/1200/1500`,
      publicId: `zarvaya/seed/${seed}-2`,
      alt: `${name} detail image`,
      isPrimary: false,
    },
  ];
}

const seedProducts: SeedProduct[] = [
  {
    name: "Chandbali Gold-Plated Jhumky",
    category: ProductCategory.JHUMKY,
    subcategory: "chandbali",
    material: ProductMaterial.GOLD_PLATED,
    price: 1200,
    shortDescription: "Classic chandbali jhumky with premium gold-plated finish.",
    description:
      "Elegant chandbali jhumky featuring intricate motif work and a lightweight frame for all-day comfort.",
    tags: ["bridal", "wedding", "party", "gold"],
    occasion: [ProductOccasion.FESTIVE, ProductOccasion.PARTY],
    stock: 45,
  },
  {
    name: "Pearl Drop Silver Jhumky",
    category: ProductCategory.JHUMKY,
    subcategory: "drop",
    material: ProductMaterial.SILVER,
    price: 1800,
    shortDescription: "Pearl drop jhumky crafted with silver-toned elegance.",
    description:
      "A graceful pair of silver jhumky with pearl drops that pair beautifully with both formal and festive outfits.",
    tags: ["pearl", "silver", "gift", "party"],
    occasion: [ProductOccasion.PARTY, ProductOccasion.OFFICE],
    stock: 30,
  },
  {
    name: "Oxidized Bohemian Jhumky",
    category: ProductCategory.JHUMKY,
    subcategory: "bohemian",
    material: ProductMaterial.OXIDIZED,
    price: 800,
    shortDescription: "Boho-inspired oxidized jhumky with textured detailing.",
    description:
      "Bold oxidized jhumky designed for statement styling, featuring artisanal texture and a timeless silhouette.",
    tags: ["oxidized", "casual", "boho", "gift"],
    occasion: [ProductOccasion.CASUAL, ProductOccasion.DAILY],
    stock: 60,
  },
  {
    name: "Kundan Meenakari Jhumky",
    category: ProductCategory.JHUMKY,
    subcategory: "meenakari",
    material: ProductMaterial.KUNDAN,
    price: 2200,
    shortDescription: "Traditional kundan meenakari jhumky for festive looks.",
    description:
      "Hand-finished kundan meenakari jhumky with vibrant detailing, perfect for wedding festivities and family events.",
    tags: ["kundan", "bridal", "wedding", "party"],
    occasion: [ProductOccasion.BRIDAL, ProductOccasion.FESTIVE],
    stock: 25,
  },
  {
    name: "Hoop Studs Jhumky",
    category: ProductCategory.JHUMKY,
    subcategory: "hoop",
    material: ProductMaterial.GOLD_PLATED,
    price: 600,
    shortDescription: "Compact hoop-style jhumky for daily minimal wear.",
    description:
      "A contemporary take on jhumky with a hoop-stud profile, ideal for lightweight everyday styling.",
    tags: ["daily", "casual", "gold", "gift"],
    occasion: [ProductOccasion.DAILY, ProductOccasion.CASUAL],
    stock: 70,
  },
  {
    name: "Gold Choker Necklace",
    category: ProductCategory.NECKLACE,
    subcategory: "choker",
    material: ProductMaterial.GOLD_PLATED,
    price: 2500,
    shortDescription: "Polished gold choker designed for instant glamour.",
    description:
      "A structured gold-plated choker necklace with detailed craftsmanship for sangeet, dinner events, and festive evenings.",
    tags: ["gold", "party", "wedding", "gift"],
    occasion: [ProductOccasion.PARTY, ProductOccasion.FESTIVE],
    stock: 28,
  },
  {
    name: "Silver Layered Necklace",
    category: ProductCategory.NECKLACE,
    subcategory: "layered",
    material: ProductMaterial.SILVER,
    price: 1900,
    shortDescription: "Layered silver necklace with contemporary edge.",
    description:
      "Modern layered silver necklace suited for smart casual and formal outfits with effortless styling flexibility.",
    tags: ["silver", "office", "casual", "gift"],
    occasion: [ProductOccasion.OFFICE, ProductOccasion.CASUAL],
    stock: 35,
  },
  {
    name: "Pearl Strand Necklace",
    category: ProductCategory.NECKLACE,
    subcategory: "strand",
    material: ProductMaterial.PEARL,
    price: 3200,
    shortDescription: "Elegant pearl strand necklace with classic charm.",
    description:
      "A refined pearl strand necklace that elevates bridal events, formal dinners, and timeless occasion dressing.",
    tags: ["pearl", "bridal", "wedding", "gift"],
    occasion: [ProductOccasion.BRIDAL, ProductOccasion.PARTY],
    stock: 22,
  },
  {
    name: "Kundan Haar Necklace",
    category: ProductCategory.NECKLACE,
    subcategory: "haar",
    material: ProductMaterial.KUNDAN,
    price: 4500,
    shortDescription: "Statement kundan haar crafted for bridal grandeur.",
    description:
      "A majestic kundan haar necklace inspired by traditional Pakistani bridal artistry with rich ceremonial appeal.",
    tags: ["kundan", "bridal", "wedding", "gold"],
    occasion: [ProductOccasion.BRIDAL, ProductOccasion.FESTIVE],
    stock: 14,
  },
  {
    name: "Adjustable Floral Ring",
    category: ProductCategory.RING,
    subcategory: "floral",
    material: ProductMaterial.GOLD_PLATED,
    price: 650,
    shortDescription: "Adjustable floral ring with delicate detailing.",
    description:
      "Lightweight adjustable floral ring perfect for gifting and daily wear with a premium polished finish.",
    tags: ["ring", "gift", "gold", "daily"],
    occasion: [ProductOccasion.DAILY, ProductOccasion.CASUAL],
    stock: 80,
  },
  {
    name: "Silver Band Ring",
    category: ProductCategory.RING,
    subcategory: "band",
    material: ProductMaterial.SILVER,
    price: 900,
    shortDescription: "Minimal silver band ring for versatile styling.",
    description:
      "A minimalist silver band ring that transitions seamlessly from office wear to weekend looks.",
    tags: ["silver", "ring", "office", "gift"],
    occasion: [ProductOccasion.OFFICE, ProductOccasion.DAILY],
    stock: 75,
  },
  {
    name: "Kundan Cocktail Ring",
    category: ProductCategory.RING,
    subcategory: "cocktail",
    material: ProductMaterial.KUNDAN,
    price: 1500,
    shortDescription: "Bold kundan cocktail ring for festive statements.",
    description:
      "A vibrant kundan cocktail ring designed to stand out at mehndi nights, celebrations, and party events.",
    tags: ["kundan", "party", "wedding", "ring"],
    occasion: [ProductOccasion.PARTY, ProductOccasion.FESTIVE],
    stock: 42,
  },
  {
    name: "Rose Gold Statement Ring",
    category: ProductCategory.RING,
    subcategory: "statement",
    material: ProductMaterial.ROSE_GOLD,
    price: 1200,
    shortDescription: "Rose gold statement ring with contemporary shine.",
    description:
      "An eye-catching rose gold ring with a modern profile for brunches, date nights, and special gatherings.",
    tags: ["rose-gold", "gift", "party", "ring"],
    occasion: [ProductOccasion.PARTY, ProductOccasion.CASUAL],
    stock: 50,
  },
  {
    name: "Gold-Plated Bangles Set of 4",
    category: ProductCategory.BANGLES,
    subcategory: "set-of-4",
    material: ProductMaterial.GOLD_PLATED,
    price: 1800,
    shortDescription: "Premium gold-plated bangles set for festive stacking.",
    description:
      "A coordinated set of four gold-plated bangles crafted for layering with festive and semi-formal outfits.",
    tags: ["gold", "bangles", "wedding", "party"],
    occasion: [ProductOccasion.FESTIVE, ProductOccasion.PARTY],
    stock: 38,
  },
  {
    name: "Oxidized Cuff Bangle",
    category: ProductCategory.BANGLES,
    subcategory: "cuff",
    material: ProductMaterial.OXIDIZED,
    price: 950,
    shortDescription: "Textured oxidized cuff bangle with artisan character.",
    description:
      "A handcrafted-feel oxidized cuff bangle tailored for fusion wardrobes and standout casual styling.",
    tags: ["oxidized", "bangles", "casual", "gift"],
    occasion: [ProductOccasion.CASUAL, ProductOccasion.DAILY],
    stock: 46,
  },
  {
    name: "Kundan Bangle Pair",
    category: ProductCategory.BANGLES,
    subcategory: "pair",
    material: ProductMaterial.KUNDAN,
    price: 2800,
    shortDescription: "Elegant kundan bangle pair for wedding festivities.",
    description:
      "A rich kundan bangle pair with intricate embellishments to complement bridal and festive ensembles.",
    tags: ["kundan", "bridal", "wedding", "bangles"],
    occasion: [ProductOccasion.BRIDAL, ProductOccasion.FESTIVE],
    stock: 21,
  },
  {
    name: "Glass Bangles 12pc",
    category: ProductCategory.BANGLES,
    subcategory: "glass",
    material: ProductMaterial.BRASS,
    price: 400,
    shortDescription: "Color-rich 12-piece bangles stack for everyday glam.",
    description:
      "An affordable 12-piece bangle stack inspired by classic desi styling, ideal for daily and festive looks.",
    tags: ["bangles", "daily", "gift", "party"],
    occasion: [ProductOccasion.DAILY, ProductOccasion.FESTIVE],
    stock: 95,
  },
  {
    name: "Bridal Full Set",
    category: ProductCategory.SET,
    subcategory: "bridal",
    material: ProductMaterial.KUNDAN,
    price: 8500,
    shortDescription: "Full bridal jewellery set with regal kundan finish.",
    description:
      "A complete bridal set featuring necklace, earrings, and complementary accents for a grand wedding look.",
    tags: ["bridal", "wedding", "kundan", "gold"],
    occasion: [ProductOccasion.BRIDAL],
    stock: 12,
  },
  {
    name: "Party Wear Necklace + Earrings Set",
    category: ProductCategory.SET,
    subcategory: "party",
    material: ProductMaterial.GOLD_PLATED,
    price: 3200,
    shortDescription: "Party-ready coordinated necklace and earrings combo.",
    description:
      "A polished set balancing elegance and comfort, perfect for evening events and celebratory dinners.",
    tags: ["party", "gift", "gold", "wedding"],
    occasion: [ProductOccasion.PARTY, ProductOccasion.FESTIVE],
    stock: 26,
  },
  {
    name: "Daily Wear 3pc Set",
    category: ProductCategory.SET,
    subcategory: "daily",
    material: ProductMaterial.SILVER,
    price: 1500,
    shortDescription: "Three-piece daily wear set for effortless styling.",
    description:
      "A practical and stylish 3-piece set designed for regular wear with lightweight comfort and clean finishing.",
    tags: ["daily", "casual", "silver", "gift"],
    occasion: [ProductOccasion.DAILY, ProductOccasion.OFFICE],
    stock: 40,
  },
];

const trendingIndexes = new Set([0, 8, 18]);
const featuredIndexes = new Set([0, 5, 8, 17]);
const newArrivalIndexes = new Set([0, 1, 2, 5, 6, 10, 17, 19]);
const bestSellerIndexes = new Set([0, 17]);

async function runSeed() {
  if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/zarvaya-jewels";
    console.log("MONGODB_URI not provided. Falling back to local MongoDB: mongodb://127.0.0.1:27017/zarvaya-jewels");
  }

  await connectDB();

  await Product.syncIndexes();
  await Product.deleteMany({});
  await Counter.deleteMany({ _id: { $regex: /^sku-/ } });

  const docs = seedProducts.map((product, index) => ({
    ...product,
    images: createImages(`zarvaya-${index + 1}`, product.name),
    isAvailable: product.stock > 0,
    isTrending: trendingIndexes.has(index),
    isFeatured: featuredIndexes.has(index),
    isNewArrival: newArrivalIndexes.has(index),
    isBestSeller: bestSellerIndexes.has(index),
    metaTitle: `${product.name} | ZARVAYA JEWELS`,
    metaDescription: product.shortDescription,
    views: Math.floor(Math.random() * 500) + 20,
    soldCount: Math.floor(Math.random() * 80),
    rating: Number((Math.random() * 1.4 + 3.6).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 120),
    relatedProducts: [],
  }));

  const inserted = await Product.insertMany(docs, { ordered: true });

  const trendingCount = inserted.filter((item) => item.isTrending).length;
  const featuredCount = inserted.filter((item) => item.isFeatured).length;
  const newArrivalCount = inserted.filter((item) => item.isNewArrival).length;
  const bestSellerCount = inserted.filter((item) => item.isBestSeller).length;

  console.log("Seed completed successfully.");
  console.log(`Inserted products: ${inserted.length}`);
  console.log(`Trending: ${trendingCount} | Featured: ${featuredCount} | NewArrival: ${newArrivalCount} | BestSeller: ${bestSellerCount}`);
  console.log("Indexes synchronized on Product model.");

  await mongoose.disconnect();
}

runSeed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
