export default function BlogDetailLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="h-10 w-3/4 animate-pulse rounded bg-stone-200" />
      <div className="aspect-[16/7] animate-pulse rounded-3xl bg-stone-200" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded bg-stone-200" />
        ))}
      </div>
    </div>
  );
}
