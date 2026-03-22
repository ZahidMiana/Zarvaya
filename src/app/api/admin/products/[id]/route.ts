import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import { productUpdateSchema } from "@/lib/validations";
import Product from "@/models/Product";
import { clearProductCaches } from "@/lib/services/product-service";
import { getPrimaryImageUrl } from "@/lib/utils";
import type { ApiResponse, IProduct } from "@/types";

type Context = {
  params: {
    id: string;
  };
};

type ProductEntity = IProduct & {
  _id: string | { toString: () => string };
  createdAt: string | Date;
  updatedAt: string | Date;
};

function toProduct(entity: ProductEntity): IProduct {
  const product = {
    ...(entity as IProduct),
    _id: String(entity._id),
    createdAt: new Date(entity.createdAt).toISOString(),
    updatedAt: new Date(entity.updatedAt).toISOString(),
  };

  return {
    ...product,
    thumbnail: getPrimaryImageUrl(product),
  };
}

export async function GET(request: NextRequest, context: Context) {
  try {
    verifyAdmin(request);
    await connectDB();

    const item = await Product.findById(context.params.id).lean();
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product fetched successfully.",
      data: toProduct(item as unknown as ProductEntity),
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
        message: error instanceof Error ? error.message : "Failed to fetch product.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    verifyAdmin(request);
    await connectDB();

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid update payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    const updated = await Product.findByIdAndUpdate(context.params.id, { $set: parsed.data }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    await clearProductCaches([updated.slug]);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      data: toProduct(updated as unknown as ProductEntity),
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

export async function PATCH(request: NextRequest, context: Context) {
  try {
    verifyAdmin(request);
    await connectDB();

    const body = (await request.json()) as {
      isAvailable?: boolean;
      isTrending?: boolean;
      isFeatured?: boolean;
      isNewArrival?: boolean;
      isBestSeller?: boolean;
    };

    const update: Record<string, boolean> = {};
    for (const key of ["isAvailable", "isTrending", "isFeatured", "isNewArrival", "isBestSeller"] as const) {
      if (typeof body[key] === "boolean") {
        update[key] = body[key] as boolean;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Nothing to update.",
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    const updated = await Product.findByIdAndUpdate(context.params.id, { $set: update }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    await clearProductCaches([updated.slug]);

    return NextResponse.json({
      success: true,
      message: "Product flags updated.",
      data: toProduct(updated as unknown as ProductEntity),
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
        message: error instanceof Error ? error.message : "Failed to update product flags.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    verifyAdmin(request);
    await connectDB();

    const deleted = await Product.findByIdAndDelete(context.params.id).lean();
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    await clearProductCaches([deleted.slug]);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
      data: toProduct(deleted as unknown as ProductEntity),
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
