"use client";

type AdminOrdersSparklineProps = {
  values: number[];
};

export default function AdminOrdersSparkline({ values }: AdminOrdersSparklineProps) {
  const safe = values.length > 1 ? values : [2, 5, 4, 8, 6, 9, 7];
  const max = Math.max(...safe, 1);
  const min = Math.min(...safe, 0);
  const span = Math.max(1, max - min);

  const points = safe
    .map((value, index) => {
      const x = (index / (safe.length - 1)) * 118 + 1;
      const y = 29 - ((value - min) / span) * 24;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 120 32" className="h-8 w-full" fill="none" aria-hidden="true">
      <polyline points={points} stroke="#C9A84C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
