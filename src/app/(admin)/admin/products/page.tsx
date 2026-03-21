import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";

export default function AdminProductsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        subtitle="Manage catalogue, pricing, inventory and media assets."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex h-9 items-center rounded-full bg-charcoal px-4 text-sm font-medium text-cream transition-colors hover:bg-gold-dark"
          >
            Add Product
          </Link>
        }
      />
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-charcoal/70">
        Product listing table will render here.
      </div>
    </div>
  );
}
