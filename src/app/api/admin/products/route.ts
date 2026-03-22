import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import Product from "@/models/Product";
import { getPrimaryImageUrl } from "@/lib/utils";
import { productCreateSchema } from "@/lib/validations";
import { clearProductCaches } from "@/lib/services/product-service";
import type { ApiResponse, IProduct } from "@/types";

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

function parseNumber(input: string | null, fallback: number): number {
  const value = Number(input);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
}

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") ?? "").trim();
    const category = searchParams.get("category") ?? "all";
    const status = searchParams.get("status") ?? "all";
    const stock = searchParams.get("stock") ?? "all";
    const page = parseNumber(searchParams.get("page"), 1);
    const limit = Math.min(100, parseNumber(searchParams.get("limit"), 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { sku: regex }, { tags: regex }];
    }

    if (category !== "all") {
      filter.category = category;
    }

    if (status === "active") {
      filter.isAvailable = true;
    } else if (status === "inactive") {
      filter.isAvailable = false;
    }

    if (stock === "in-stock") {
      filter.stock = { $gt: 10 };
    } else if (stock === "low") {
      filter.stock = { $gte: 1, $lte: 10 };
    } else if (stock === "out") {
      filter.stock = { $lte: 0 };
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const payload = {
      items: items.map((item) => toProduct(item as unknown as ProductEntity)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully.",
      data: payload,
    } satisfies ApiResponse<typeof payload>);
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

    const created = await Product.create(parsed.data);
    await clearProductCaches([created.slug]);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: toProduct(created.toObject() as unknown as ProductEntity),
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
