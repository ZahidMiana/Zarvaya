import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/auth-mail";
import User from "@/models/User";

const registerSchema = z
  .object({
    name: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    await connectDB();

    const exists = await User.findOne({ email: parsed.data.email }).lean();
    if (exists) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      authProvider: "email",
      role: "customer",
      isEmailVerified: false,
    });

    void sendWelcomeEmail({ to: parsed.data.email, name: parsed.data.name });

    return NextResponse.json({
      success: true,
      message: "Account created! Please sign in.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed.",
      },
      { status: 500 },
    );
  }
}
