import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

type Context = {
  params: {
    productId: string;
  };
};

export async function DELETE(_: Request, context: Context) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    user.cart = user.cart.filter((item) => String(item.product) !== context.params.productId);
    await user.save();

    return NextResponse.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove cart item",
      },
      { status: 500 },
    );
  }
}
