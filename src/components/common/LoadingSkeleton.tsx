type LoadingSkeletonProps = {
  count?: number;
};

export default function LoadingSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative h-72 overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-r from-cream-dark via-cream to-cream-dark"
        >
          <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      ))}
    </div>
  );
}
