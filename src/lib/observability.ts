import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = {
  level: LogLevel;
  message: string;
  requestId?: string;
  event?: string;
  [key: string]: unknown;
};

type RequestLike = NextRequest | Request;

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const CURRENT_LOG_LEVEL =
  (process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined) ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[CURRENT_LOG_LEVEL];
}

function extractClientIp(request: RequestLike): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function writeLog(payload: LogPayload): void {
  if (!shouldLog(payload.level)) {
    return;
  }

  const record = {
    ts: new Date().toISOString(),
    app: "zarvaya-jewels",
    env: process.env.NODE_ENV ?? "development",
    ...payload,
  };

  const output = JSON.stringify(record);
  if (payload.level === "error") {
    console.error(output);
    return;
  }

  if (payload.level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
}

export function getRequestContext(request: RequestLike): {
  requestId: string;
  ip: string;
  userAgent: string;
} {
  return {
    requestId: request.headers.get("x-request-id") ?? randomUUID(),
    ip: extractClientIp(request),
    userAgent: request.headers.get("user-agent") ?? "unknown",
  };
}

export function attachRequestIdHeader<T extends { headers: Headers }>(
  response: T,
  requestId: string,
): T {
  response.headers.set("x-request-id", requestId);
  return response;
}

export function infoLog(message: string, payload: Omit<LogPayload, "level" | "message"> = {}): void {
  writeLog({ level: "info", message, ...payload });
}

export function warnLog(message: string, payload: Omit<LogPayload, "level" | "message"> = {}): void {
  writeLog({ level: "warn", message, ...payload });
}

export function errorLog(message: string, payload: Omit<LogPayload, "level" | "message"> = {}): void {
  writeLog({ level: "error", message, ...payload });
}

export function auditLog(event: string, payload: Omit<LogPayload, "level" | "message" | "event"> = {}): void {
  writeLog({
    level: "info",
    message: "audit-event",
    event,
    ...payload,
  });
}
