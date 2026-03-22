export default function RootLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-md bg-stone-200" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-stone-200" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="relative h-64 overflow-hidden rounded-2xl border border-stone-200 bg-cream-dark">
              <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
