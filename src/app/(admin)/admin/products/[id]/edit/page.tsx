import PageHeader from "@/components/common/PageHeader";
import ProductForm from "@/components/admin/ProductForm";

type AdminEditProductPageProps = {
  params: {
    id: string;
  };
};

export default function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader title="Edit Product" subtitle="Update product details, media, pricing and visibility." />
      <ProductForm mode="edit" productId={params.id} />
    </div>
  );
}
