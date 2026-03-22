import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";

const wishlistSchema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .populate({ path: "wishlist", select: "name slug price discountPrice images thumbnail stock isAvailable" })
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Wishlist fetched", data: { items: user.wishlist } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch wishlist",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = wishlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid product id" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(parsed.data.productId).select({ _id: 1, isAvailable: 1 }).lean();
    if (!product?.isAvailable) {
      return NextResponse.json({ success: false, message: "Product not available" }, { status: 404 });
    }

    await User.findByIdAndUpdate(session.user.id, { $addToSet: { wishlist: parsed.data.productId } });

    return NextResponse.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update wishlist",
      },
      { status: 500 },
    );
  }
}
