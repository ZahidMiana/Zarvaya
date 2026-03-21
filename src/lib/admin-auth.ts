import { type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AdminJWTPayload = {
  adminId: string;
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
};

export class AuthHttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const pairs = cookieHeader.split(";").map((segment) => segment.trim());
  const hit = pairs.find((pair) => pair.startsWith(`${key}=`));

  if (!hit) {
    return null;
  }

  return decodeURIComponent(hit.slice(key.length + 1));
}

function extractToken(request: NextRequest | Request): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  const cookieHeader = request.headers.get("cookie");

  return (
    getCookieValue(cookieHeader, "admin_token") ??
    getCookieValue(cookieHeader, "token") ??
    getCookieValue(cookieHeader, "auth_token")
  );
}

export function verifyAdmin(request: NextRequest | Request): AdminJWTPayload {
  const token = extractToken(request);

  if (!token) {
    throw new AuthHttpError(401, "Missing admin authentication token.");
  }

  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new AuthHttpError(500, "JWT secret is not configured.");
  }

  try {
    const payload = jwt.verify(token, secret) as AdminJWTPayload;

    if (payload.role !== "admin") {
      throw new AuthHttpError(403, "Admin access required.");
    }

    if (!payload.adminId || !payload.email) {
      throw new AuthHttpError(401, "Invalid admin token payload.");
    }

    return payload;
  } catch (error) {
    if (error instanceof AuthHttpError) {
      throw error;
    }

    throw new AuthHttpError(401, "Invalid or expired admin token.");
  }
}
