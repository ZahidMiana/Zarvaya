import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withPublicCache } from "@/lib/http-cache";
import { getTrendingProducts } from "@/lib/services/product-service";
import type { ApiResponse, IProduct } from "@/types";

export async function GET() {
  try {
    await connectDB();
    const data = await getTrendingProducts();

    return withPublicCache(NextResponse.json({
      success: true,
      message: "Trending products fetched successfully.",
      data,
    } satisfies ApiResponse<IProduct[]>), {
      sMaxAgeSeconds: 180,
      staleWhileRevalidateSeconds: 900,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch trending products.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
