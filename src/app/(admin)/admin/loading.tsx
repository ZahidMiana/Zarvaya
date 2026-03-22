export default function AdminDashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-stone-200 bg-white" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-stone-200 bg-white" />
    </div>
  );
}
