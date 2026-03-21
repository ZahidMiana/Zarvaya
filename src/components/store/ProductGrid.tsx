import EmptyState from "@/components/common/EmptyState";
import ProductCard from "@/components/store/ProductCard";
import type { IProduct } from "@/types";

type ProductGridProps = {
  products: IProduct[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your filters or search query to discover more jewellery pieces."
        ctaLabel="Browse All"
        ctaHref="/shop"
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id ?? product.slug} product={product} />
      ))}
    </div>
  );
}
