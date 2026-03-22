import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAdmin, AuthHttpError } from "@/lib/admin-auth";
import { withPublicCache } from "@/lib/http-cache";
import { productCreateSchema } from "@/lib/validations";
import Product from "@/models/Product";
import { clearProductCaches, listProducts } from "@/lib/services/product-service";
import { getPrimaryImageUrl } from "@/lib/utils";
import type { ApiResponse, IProduct } from "@/types";

function parseNumber(input: string | null | undefined): number | undefined {
  if (!input) {
    return undefined;
  }

  const value = Number(input);
  return Number.isFinite(value) ? value : undefined;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const data = await listProducts({
      category: searchParams.get("category") ?? undefined,
      material: searchParams.get("material") ?? undefined,
      occasion: searchParams.get("occasion") ?? undefined,
      minPrice: parseNumber(searchParams.get("minPrice")),
      maxPrice: parseNumber(searchParams.get("maxPrice")),
      sort: (searchParams.get("sort") as
        | "newest"
        | "price-asc"
        | "price-desc"
        | "trending"
        | "bestseller"
        | undefined) ?? "newest",
      page: parseNumber(searchParams.get("page")),
      limit: parseNumber(searchParams.get("limit")),
    });

    return withPublicCache(NextResponse.json({
      success: true,
      message: "Products fetched successfully.",
      data,
    } satisfies ApiResponse<typeof data>), {
      sMaxAgeSeconds: 120,
      staleWhileRevalidateSeconds: 600,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch products.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();

    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    const product = await Product.create(parsed.data);
    await clearProductCaches([product.slug]);

    const serialized = {
      ...(product.toObject() as unknown as IProduct),
      _id: String(product._id),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: {
          ...serialized,
          thumbnail: getPrimaryImageUrl(serialized),
        },
      } satisfies ApiResponse<IProduct>,
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthHttpError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        } satisfies ApiResponse<null>,
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create product.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
