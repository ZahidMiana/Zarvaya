import Link from "next/link";

type CategoryCardProps = {
  category: string;
  label: string;
};

export default function CategoryCard({ category, label }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category}`}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-lg"
    >
      <p className="font-playfair text-2xl text-charcoal">{label}</p>
      <p className="mt-2 text-sm text-charcoal/70">Explore premium {label.toLowerCase()} collection.</p>
      <span className="mt-4 inline-block text-sm font-medium text-gold-dark transition-transform group-hover:translate-x-1">
        Browse Category
      </span>
    </Link>
  );
}
