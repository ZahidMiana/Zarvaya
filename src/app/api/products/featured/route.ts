import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getFeaturedProducts } from "@/lib/services/product-service";
import type { ApiResponse, IProduct } from "@/types";

export async function GET() {
  try {
    await connectDB();
    const data = await getFeaturedProducts();

    return NextResponse.json({
      success: true,
      message: "Featured products fetched successfully.",
      data,
    } satisfies ApiResponse<IProduct[]>);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch featured products.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
