import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { AdminJWTPayload } from "@/lib/admin-auth";

function readToken(): string | null {
  const store = cookies();

  return (
    store.get("admin_token")?.value ??
    store.get("token")?.value ??
    store.get("auth_token")?.value ??
    null
  );
}

export function getAdminSession(): AdminJWTPayload | null {
  const token = readToken();
  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret) as AdminJWTPayload;
    if (payload.role !== "admin") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
