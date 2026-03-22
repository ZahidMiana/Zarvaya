import crypto from "crypto";
import nodemailer from "nodemailer";

function getMailer() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendWelcomeEmail(input: { to: string; name: string }) {
  const mailer = getMailer();
  if (!mailer) {
    return;
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: input.to,
    subject: "Welcome to ZARVAYA JEWELS",
    html: `<div style=\"font-family:Inter,Arial,sans-serif\"><h2>Welcome, ${input.name}</h2><p>Your account is ready. Start exploring elegant collections from ZARVAYA JEWELS.</p></div>`,
  });
}

export function createResetToken(): { plain: string; hashed: string; expiresAt: Date } {
  const plain = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(plain).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return { plain, hashed, expiresAt };
}

export async function sendResetPasswordEmail(input: { to: string; resetToken: string }) {
  const mailer = getMailer();
  if (!mailer) {
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = `${baseUrl}/reset-password?token=${encodeURIComponent(input.resetToken)}`;

  await mailer.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: input.to,
    subject: "Reset your ZARVAYA password",
    html: `<div style=\"font-family:Inter,Arial,sans-serif\"><h2>Password reset request</h2><p>Click below to reset your password.</p><p><a href=\"${link}\">Reset Password</a></p><p>This link expires in 1 hour.</p></div>`,
  });
}
