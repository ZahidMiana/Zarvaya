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

    await User.findByIdAndUpdate(session.user.id, { $pull: { wishlist: context.params.productId } });

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
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
