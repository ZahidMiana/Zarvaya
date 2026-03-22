import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuthHttpError, verifyAdmin } from "@/lib/admin-auth";
import { attachRequestIdHeader, auditLog, errorLog, getRequestContext } from "@/lib/observability";
import { orderStatusUpdateSchema } from "@/lib/validations";
import { ServiceError, updateOrderStatus } from "@/lib/services/order-service";
import type { ApiResponse, IOrder } from "@/types";

type OrderStatusContext = {
  params: {
    orderNumber: string;
  };
};

export async function PATCH(request: NextRequest, context: OrderStatusContext) {
  const requestContext = getRequestContext(request);

  try {
    const session = verifyAdmin(request);
    await connectDB();

    const body = await request.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return attachRequestIdHeader(NextResponse.json(
        {
          success: false,
          message: "Invalid status update payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      ), requestContext.requestId);
    }

    const updated = await updateOrderStatus(context.params.orderNumber, {
      status: parsed.data.status,
      note: parsed.data.note,
      trackingNumber: parsed.data.trackingNumber,
      courier: parsed.data.courier,
    });

    auditLog("admin.order.status.updated", {
      requestId: requestContext.requestId,
      ip: requestContext.ip,
      adminId: session.adminId,
      adminEmail: session.email,
      orderNumber: context.params.orderNumber,
      status: parsed.data.status,
    });

    return attachRequestIdHeader(NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      data: updated,
    } satisfies ApiResponse<IOrder>), requestContext.requestId);
  } catch (error) {
    if (error instanceof AuthHttpError) {
      return attachRequestIdHeader(NextResponse.json(
        {
          success: false,
          message: error.message,
        } satisfies ApiResponse<null>,
        { status: error.statusCode },
      ), requestContext.requestId);
    }

    if (error instanceof ServiceError) {
      return attachRequestIdHeader(NextResponse.json(
        {
          success: false,
          message: error.message,
        } satisfies ApiResponse<null>,
        { status: error.statusCode },
      ), requestContext.requestId);
    }

    errorLog("Order status update route error", {
      requestId: requestContext.requestId,
      ip: requestContext.ip,
      orderNumber: context.params.orderNumber,
      error: error instanceof Error ? error.message : "unknown",
    });

    return attachRequestIdHeader(NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update order status.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    ), requestContext.requestId);
  }
}
