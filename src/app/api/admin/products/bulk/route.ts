import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import Product from "@/models/Product";
import { clearProductCaches } from "@/lib/services/product-service";
import type { ApiResponse } from "@/types";

export async function PATCH(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();

    const body = (await request.json()) as {
      ids?: string[];
      action?: "delete" | "toggle-availability";
      value?: boolean;
    };

    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No items selected.",
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    if (body.action === "delete") {
      const deletedDocs = await Product.find({ _id: { $in: ids } }).select({ slug: 1 }).lean();
      const slugs = deletedDocs.map((item) => item.slug);
      const result = await Product.deleteMany({ _id: { $in: ids } });
      await clearProductCaches(slugs);

      return NextResponse.json({
        success: true,
        message: "Products deleted.",
        data: { modified: result.deletedCount ?? 0 },
      } satisfies ApiResponse<{ modified: number }>);
    }

    if (body.action === "toggle-availability") {
      const result = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { isAvailable: Boolean(body.value) } },
      );

      await clearProductCaches();

      return NextResponse.json({
        success: true,
        message: "Availability updated.",
        data: { modified: result.modifiedCount ?? 0 },
      } satisfies ApiResponse<{ modified: number }>);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid bulk action.",
      } satisfies ApiResponse<null>,
      { status: 400 },
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
        message: error instanceof Error ? error.message : "Bulk update failed.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
