import { NextResponse } from "next/server";

export function withPublicCache<T extends NextResponse>(
  response: T,
  options: {
    sMaxAgeSeconds: number;
    staleWhileRevalidateSeconds: number;
  },
): T {
  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${options.sMaxAgeSeconds}, stale-while-revalidate=${options.staleWhileRevalidateSeconds}`,
  );
  return response;
}
