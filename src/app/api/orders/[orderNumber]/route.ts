import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getOrderForTracking } from "@/lib/services/order-service";
import type { ApiResponse } from "@/types";

type OrderByNumberContext = {
  params: {
    orderNumber: string;
  };
};

export async function GET(_: NextRequest, context: OrderByNumberContext) {
  try {
    await connectDB();

    const order = await getOrderForTracking(context.params.orderNumber);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        } satisfies ApiResponse<null>,
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order fetched successfully.",
      data: order,
    } satisfies ApiResponse<typeof order>);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch order.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    );
  }
}
