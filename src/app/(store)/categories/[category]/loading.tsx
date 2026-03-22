import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export default function CategoryLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="h-64 animate-pulse rounded-3xl bg-stone-200" />
      <LoadingSkeleton count={8} />
    </div>
  );
}
