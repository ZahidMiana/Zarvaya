export default function ProductLoading() {
  return (
    <div className="grid gap-8 py-8 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-stone-200" />
      <div className="space-y-3">
        <div className="h-8 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-full animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-stone-200" />
        <div className="h-12 w-48 animate-pulse rounded-full bg-stone-200" />
      </div>
    </div>
  );
}
