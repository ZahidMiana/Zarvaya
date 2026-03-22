import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";

type IncomingItem = { productId: string; quantity: number };

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { items?: IncomingItem[] };
    const incoming = Array.isArray(body.items) ? body.items : [];

    await connectDB();

    const user = await User.findById(session.user.id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const serverCartMap = new Map<string, number>();
    for (const item of user.cart) {
      serverCartMap.set(String(item.product), item.quantity);
    }

    for (const item of incoming) {
      const qty = Math.max(1, Math.floor(item.quantity || 1));
      const existingQty = serverCartMap.get(item.productId) ?? 0;
      serverCartMap.set(item.productId, Math.max(existingQty, qty));
    }

    const productIds = Array.from(serverCartMap.keys());
    const products = await Product.find({ _id: { $in: productIds }, isAvailable: true })
      .select({ _id: 1, stock: 1 })
      .lean();

    const availableSet = new Set(products.map((product) => String(product._id)));

    const merged = Array.from(serverCartMap.entries())
      .filter(([productId]) => availableSet.has(productId) && Types.ObjectId.isValid(productId))
      .map(([productId, quantity]) => ({
        product: new Types.ObjectId(productId),
        quantity,
        addedAt: new Date(),
      }));

    user.cart = merged;
    await user.save();

    await user.populate({ path: "cart.product", select: "name slug price discountPrice images thumbnail stock isAvailable" });

    return NextResponse.json({
      success: true,
      message: "Cart synced",
      data: { items: user.cart },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cart sync failed",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .populate({ path: "cart.product", select: "name slug price discountPrice images thumbnail stock isAvailable" })
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cart fetched", data: { items: user.cart } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch cart" },
      { status: 500 },
    );
  }
}
