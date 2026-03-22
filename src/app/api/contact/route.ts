import nodemailer from "nodemailer";
import { NextResponse, type NextRequest } from "next/server";
import { attachRequestIdHeader, auditLog, errorLog, getRequestContext, warnLog } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    const limit = enforceRateLimit({
      key: `contact-submit:${context.ip}`,
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) {
      warnLog("Contact form rate limit exceeded", {
        requestId: context.requestId,
        ip: context.ip,
        retryAfterSeconds: limit.retryAfterSeconds,
      });

      const response = NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
          meta: { retryAfterSeconds: limit.retryAfterSeconds },
        } satisfies ApiResponse<null>,
        { status: 429 },
      );
      response.headers.set("Retry-After", String(limit.retryAfterSeconds));
      return attachRequestIdHeader(response, context.requestId);
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return attachRequestIdHeader(NextResponse.json(
        {
          success: false,
          message: "Invalid contact payload.",
          errors: parsed.error.issues.map((issue) => issue.message),
        } satisfies ApiResponse<null>,
        { status: 400 },
      ), context.requestId);
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_CONTACT_EMAIL ?? process.env.ADMIN_EMAIL ?? "info@zarvayajewels.com";

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? `ZARVAYA JEWELS <${smtpUser}>`,
        to: adminEmail,
        subject: `[Contact] ${parsed.data.subject} - ${parsed.data.name}`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${parsed.data.name}</p>
            <p><strong>Email:</strong> ${parsed.data.email}</p>
            <p><strong>Phone:</strong> ${parsed.data.phone ?? "-"}</p>
            <p><strong>Subject:</strong> ${parsed.data.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${parsed.data.message.replace(/\n/g, "<br />")}</p>
          </div>
        `,
      });

      auditLog("contact.message.delivered", {
        requestId: context.requestId,
        ip: context.ip,
        subject: parsed.data.subject,
        email: parsed.data.email,
      });
    } else {
      warnLog("SMTP config missing. Contact email delivery skipped", {
        requestId: context.requestId,
        ip: context.ip,
      });
    }

    return attachRequestIdHeader(NextResponse.json({
      success: true,
      message: "Message received. Our team will get back to you shortly.",
    } satisfies ApiResponse<null>), context.requestId);
  } catch (error) {
    errorLog("Contact API route error", {
      requestId: context.requestId,
      ip: context.ip,
      error: error instanceof Error ? error.message : "unknown",
    });

    return attachRequestIdHeader(NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit contact form.",
      } satisfies ApiResponse<null>,
      { status: 500 },
    ), context.requestId);
  }
}
