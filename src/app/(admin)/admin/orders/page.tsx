import PageHeader from "@/components/common/PageHeader";
import OrdersManager from "@/components/admin/OrdersManager";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Orders" subtitle="Track and manage customer orders across fulfillment stages." />
      <OrdersManager />
    </div>
  );
}
