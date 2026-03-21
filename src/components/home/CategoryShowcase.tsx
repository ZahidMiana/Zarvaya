import CategoryShowcaseClient, { type CategoryShowcaseItem } from "@/components/home/CategoryShowcaseClient";

const categories: CategoryShowcaseItem[] = [
  {
    slug: "necklace",
    name: "Necklaces",
    count: 124,
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "jhumky",
    name: "Jhumky",
    count: 93,
    imageUrl: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "ring",
    name: "Rings",
    count: 110,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "bangles",
    name: "Bangles",
    count: 78,
    imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "set",
    name: "Sets",
    count: 65,
    imageUrl: "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?q=80&w=1200&auto=format&fit=crop",
  },
];

export default async function CategoryShowcase() {
  return (
    <section className="space-y-7">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Curated Selections</p>
        <h2 className="font-playfair text-3xl text-charcoal md:text-4xl">Shop by Category</h2>
      </div>
      <CategoryShowcaseClient categories={categories} />
    </section>
  );
}
