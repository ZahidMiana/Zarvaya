import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export default function StoreLoading() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-md bg-stone-200" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-stone-200" />
      </div>
      <LoadingSkeleton count={6} />
    </div>
  );
}
