import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRedisClient } from "@/lib/redis";
import { connectDB } from "@/lib/db";
import OTP from "@/models/OTP";

const sendOtpSchema = z.object({
  phone: z.string().regex(/^03[0-9]{9}$/),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid phone number format." }, { status: 400 });
    }

    const phone = parsed.data.phone;
    const rateKey = `otp_rate:${phone}`;
    const redis = await getRedisClient();

    if (redis) {
      const existing = await redis.get(rateKey);
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Please wait before requesting another OTP" },
          { status: 429 },
        );
      }
    }

    await connectDB();

    await OTP.updateMany({ phone, purpose: "login", isUsed: false }, { $set: { isUsed: true } });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
    const expiresAt = new Date(Date.now() + Math.max(1, expiryMinutes) * 60 * 1000);

    await OTP.create({
      phone,
      otp: hashedOtp,
      purpose: "login",
      expiresAt,
    });

    if (redis) {
      await redis.set(rateKey, "1", "EX", 60);
    }

    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your number",
      ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Could not send OTP.",
      },
      { status: 500 },
    );
  }
}
