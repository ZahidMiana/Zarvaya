import PageHeader from "@/components/common/PageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Create Product" subtitle="Add a new product to the ZARVAYA catalog." />
      <ProductForm mode="create" />
    </div>
  );
}
