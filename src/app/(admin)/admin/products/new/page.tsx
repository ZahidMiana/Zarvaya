import PageHeader from "@/components/common/PageHeader";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Create Product" subtitle="Add a new product to the ZARVAYA catalog." />
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-charcoal/70">
        Product creation form scaffold is ready for module 2 integration.
      </div>
    </div>
  );
}
