export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded-md bg-stone-200" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-stone-200 bg-white" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white" />
    </div>
  );
}
