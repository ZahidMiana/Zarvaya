import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { attachRequestIdHeader, auditLog, errorLog, getRequestContext, warnLog } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";
import User from "@/models/User";
import type { ApiResponse } from "@/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function isBcryptHash(value: string): boolean {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
}

async function compareEnvPassword(inputPassword: string, configuredPassword: string): Promise<boolean> {
  if (isBcryptHash(configuredPassword)) {
    return bcrypt.compare(inputPassword, configuredPassword);
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return inputPassword === configuredPassword;
}

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return attachRequestIdHeader(NextResponse.json(
        {
          success: false,
          message: "Invalid login payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      ), context.requestId);
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

    const limit = enforceRateLimit({
      key: `admin-login:${context.ip}:${email}`,
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!limit.allowed) {
      warnLog("Admin login rate limit exceeded", {
        requestId: context.requestId,
        ip: context.ip,
        email,
        retryAfterSeconds: limit.retryAfterSeconds,
      });

      const response = NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
          meta: { retryAfterSeconds: limit.retryAfterSeconds },
        } satisfies ApiResponse<null>,
        { status: 429 },
      );
      response.headers.set("Retry-After", String(limit.retryAfterSeconds));
      return attachRequestIdHeader(response, context.requestId);
    }

    await connectDB();

    const user = await User.findOne({ email, role: "admin", isActive: true }).select("+passwordHash").lean();

    let valid = false;
    let adminId = "";

    if (user?.passwordHash) {
      valid = await bcrypt.compare(password, user.passwordHash);
      adminId = String(user._id);
    } else if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
      const fallbackEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
      if (email === fallbackEmail) {
        if (process.env.NODE_ENV === "production" && !isBcryptHash(process.env.ADMIN_PASSWORD_HASH)) {
          warnLog("Rejected plain text ADMIN_PASSWORD_HASH in production", {
            requestId: context.requestId,
            ip: context.ip,
            email,
          });
        }
        valid = await compareEnvPassword(password, process.env.ADMIN_PASSWORD_HASH);
        adminId = "env-admin";
      }
    }

    if (!valid) {
      warnLog("Admin login failed", {
        requestId: context.requestId,
        ip: context.ip,
        email,
      });

      return attachRequestIdHeader(NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        } satisfies ApiResponse<null>,
        { status: 401 },
      ), context.requestId);
    }

    const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!secret) {
      errorLog("JWT secret missing during admin login", {
        requestId: context.requestId,
        ip: context.ip,
        email,
      });

      return attachRequestIdHeader(NextResponse.json(
        {
          success: false,
          message: "JWT secret is not configured.",
        } satisfies ApiResponse<null>,
        { status: 500 },
      ), context.requestId);
    }

    const token = jwt.sign(
      {
        adminId,
        email,
        role: "admin",
      },
      secret,
      { expiresIn: "7d" },
    );

    auditLog("admin.login.success", {
      requestId: context.requestId,
      ip: context.ip,
      adminId,
      email,
      userAgent: context.userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      data: { email },
    } satisfies ApiResponse<{ email: string }>);

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return attachRequestIdHeader(response, context.requestId);
  } catch (error) {
    errorLog("Admin login route error", {
      requestId: context.requestId,
      ip: context.ip,
      error: error instanceof Error ? error.message : "unknown",
    });

    return attachRequestIdHeader(NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Login failed.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    ), context.requestId);
  }
}
