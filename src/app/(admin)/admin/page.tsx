import PageHeader from "@/components/common/PageHeader";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle="Overview of store performance, orders, and inventory." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Revenue", "Orders", "Products", "Customers"].map((item) => (
          <article key={item} className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-charcoal/65">{item}</p>
            <p className="mt-2 font-playfair text-3xl text-charcoal">--</p>
          </article>
        ))}
      </div>
    </div>
  );
}
