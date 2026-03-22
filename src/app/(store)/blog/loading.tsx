export default function BlogLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="h-10 w-64 animate-pulse rounded bg-stone-200" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="aspect-[4/3] animate-pulse bg-stone-200" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
              <div className="h-6 w-full animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
