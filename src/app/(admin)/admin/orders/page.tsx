import PageHeader from "@/components/common/PageHeader";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Orders" subtitle="Track and manage customer orders across fulfillment stages." />
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-charcoal/70">
        Orders management table will render here.
      </div>
    </div>
  );
}
