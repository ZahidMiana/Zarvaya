import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const profilePatchSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["female", "male", "other", "prefer-not-to-say"]).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select({
        name: 1,
        email: 1,
        phone: 1,
        avatar: 1,
        dateOfBirth: 1,
        gender: 1,
        savedAddresses: 1,
        isEmailVerified: 1,
        isPhoneVerified: 1,
        createdAt: 1,
      })
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile fetched", data: user });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profilePatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid profile payload",
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

    if (parsed.data.name !== undefined) {
      user.name = parsed.data.name;
    }

    if (parsed.data.email !== undefined && parsed.data.email !== user.email) {
      user.email = parsed.data.email;
      user.isEmailVerified = false;
    }

    if (parsed.data.dateOfBirth !== undefined) {
      user.dateOfBirth = new Date(parsed.data.dateOfBirth);
    }

    if (parsed.data.gender !== undefined) {
      user.gender = parsed.data.gender;
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
