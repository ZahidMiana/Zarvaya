import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import { orderStatusUpdateSchema } from "@/lib/validations";
import { ServiceError, updateOrderStatus } from "@/lib/services/order-service";
import type { ApiResponse, IOrder } from "@/types";

type OrderStatusContext = {
  params: {
    orderNumber: string;
  };
};

export async function PATCH(request: NextRequest, context: OrderStatusContext) {
  try {
    verifyAdmin(request);
    await connectDB();

    const body = await request.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status update payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      );
    }

    const updated = await updateOrderStatus(context.params.orderNumber, {
      status: parsed.data.status,
      note: parsed.data.note,
      trackingNumber: parsed.data.trackingNumber,
      courier: parsed.data.courier,
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      data: updated,
    } satisfies ApiResponse<IOrder>);
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
        message: error instanceof Error ? error.message : "Failed to update order status.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
