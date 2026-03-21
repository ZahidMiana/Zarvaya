export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <article
          key={`skeleton-${index}`}
          className="overflow-hidden rounded-xl border border-stone-200 bg-white"
        >
          <div className="aspect-square animate-pulse bg-stone-200/70" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-stone-200/70" />
            <div className="h-4 w-full animate-pulse rounded bg-stone-200/70" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200/70" />
            <div className="h-5 w-24 animate-pulse rounded bg-stone-200/70" />
          </div>
        </article>
      ))}
    </div>
  );
}
