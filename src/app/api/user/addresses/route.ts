import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const addressSchema = z.object({
  label: z.string().trim().min(2).optional(),
  street: z.string().trim().optional(),
  area: z.string().trim().optional(),
  city: z.string().trim().min(2),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid address payload",
          errors: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (parsed.data.isDefault) {
      user.savedAddresses = user.savedAddresses.map((address) => ({
        ...address,
        isDefault: false,
      }));
    }

    user.savedAddresses.push({
      label: parsed.data.label ?? "Home",
      street: parsed.data.street,
      area: parsed.data.area,
      city: parsed.data.city,
      province: parsed.data.province,
      postalCode: parsed.data.postalCode,
      isDefault: Boolean(parsed.data.isDefault),
    });

    await user.save();

    return NextResponse.json({ success: true, message: "Address added", data: user.savedAddresses });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add address",
      },
      { status: 500 },
    );
  }
}
