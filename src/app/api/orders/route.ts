import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import { orderCreateSchema } from "@/lib/validations";
import { createOrder, getAdminOrders, ServiceError } from "@/lib/services/order-service";
import type { ApiResponse, IOrder } from "@/types";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = orderCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    const order = await createOrder(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        data: order,
      } satisfies ApiResponse<IOrder>,
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ServiceError) {
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
        message: error instanceof Error ? error.message : "Failed to create order.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const data = await getAdminOrders({
      status: searchParams.get("status") ?? undefined,
      paymentStatus: searchParams.get("paymentStatus") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
      search: searchParams.get("search") ?? undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Orders fetched successfully.",
      data,
    } satisfies ApiResponse<typeof data>);
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
        message: error instanceof Error ? error.message : "Failed to fetch orders.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
