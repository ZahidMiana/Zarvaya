import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import { withPublicCache } from "@/lib/http-cache";
import { clearProductCaches, getProductBySlug, softDeleteProduct } from "@/lib/services/product-service";
import { productUpdateSchema } from "@/lib/validations";
import { getPrimaryImageUrl } from "@/lib/utils";
import Product from "@/models/Product";
import type { ApiResponse, IProduct } from "@/types";

type ProductBySlugContext = {
  params: {
    slug: string;
  };
};

export async function GET(_: NextRequest, context: ProductBySlugContext) {
  try {
    await connectDB();

    const data = await getProductBySlug(context.params.slug);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    return withPublicCache(NextResponse.json({
      success: true,
      message: "Product fetched successfully.",
      data,
    } satisfies ApiResponse<typeof data>), {
      sMaxAgeSeconds: 180,
      staleWhileRevalidateSeconds: 900,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch product.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: ProductBySlugContext) {
  try {
    verifyAdmin(request);
    await connectDB();

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product update payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    const existing = await Product.findOne({ slug: context.params.slug });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    Object.assign(existing, parsed.data);
    await existing.save();

    await clearProductCaches([context.params.slug, existing.slug]);

    const serialized = {
      ...(existing.toObject() as unknown as IProduct),
      _id: String(existing._id),
      createdAt: existing.createdAt.toISOString(),
      updatedAt: existing.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      data: {
        ...serialized,
        thumbnail: getPrimaryImageUrl(serialized),
      },
    } satisfies ApiResponse<IProduct>);
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
        message: error instanceof Error ? error.message : "Failed to update product.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: ProductBySlugContext) {
  try {
    verifyAdmin(request);
    await connectDB();

    const deleted = await softDeleteProduct(context.params.slug);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    await clearProductCaches([context.params.slug]);

    return NextResponse.json({
      success: true,
      message: "Product soft-deleted successfully.",
      data: deleted,
    } satisfies ApiResponse<IProduct>);
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
        message: error instanceof Error ? error.message : "Failed to delete product.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
