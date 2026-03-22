import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createResetToken, sendResetPasswordEmail } from "@/lib/auth-mail";
import User from "@/models/User";

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const neutralMessage = "If this email is registered, you'll receive a reset link";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: true, message: neutralMessage });
    }

    await connectDB();

    const user = await User.findOne({ email: parsed.data.email }).select("email").exec();
    if (user?.email) {
      const token = createResetToken();
      user.resetToken = token.hashed;
      user.resetTokenExpiry = token.expiresAt;
      await user.save();
      void sendResetPasswordEmail({ to: user.email, resetToken: token.plain });
    }

    return NextResponse.json({ success: true, message: neutralMessage });
  } catch {
    return NextResponse.json({ success: true, message: neutralMessage });
  }
}
