import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export default function ShopLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="h-10 w-72 animate-pulse rounded bg-stone-200" />
      <LoadingSkeleton count={9} />
    </div>
  );
}
