import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { searchProducts } from "@/lib/services/product-service";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);

  if (!q) {
    return NextResponse.json(
      {
        success: false,
        message: "Search query is required.",
      } satisfies ApiResponse<null>,
      { status: 400 },
    );
  }

  try {
    await connectDB();
    const data = await searchProducts(q, page, limit);

    return NextResponse.json({
      success: true,
      message: "Search results fetched successfully.",
      data,
      meta: {
        query: q,
      },
    } satisfies ApiResponse<typeof data>);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to search products.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
