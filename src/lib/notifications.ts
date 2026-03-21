import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/utils";
import type { IOrder } from "@/types";

function getAdminWhatsAppNumber() {
  return (process.env.WHATSAPP_NUMBER ?? "").replace(/[^\d]/g, "");
}

function getCustomerWhatsAppNumber(order: IOrder) {
  const raw = order.customer.whatsapp || order.customer.phone;
  return (raw ?? "").replace(/[^\d]/g, "");
}

export function sendAdminWhatsApp(order: IOrder): void {
  const adminNumber = getAdminWhatsAppNumber();

  if (!adminNumber) {
    console.warn("WHATSAPP_NUMBER missing. Skipping admin WhatsApp message.");
    return;
  }

  const itemSummary = order.items.map((item) => `${item.productName} x${item.quantity}`).join(", ");
  const message = [
    "New ZARVAYA order received",
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Items: ${itemSummary}`,
    `Total: ${formatPrice(order.total)}`,
  ].join("\n");

  const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
  console.log("Admin WhatsApp URL:", url);
}

export function sendCustomerWhatsAppUpdate(order: IOrder, updateMessage: string): void {
  const customerNumber = getCustomerWhatsAppNumber(order);

  if (!customerNumber) {
    return;
  }

  const message = [
    "Assalam o Alaikum from ZARVAYA JEWELS",
    `Order ${order.orderNumber}`,
    updateMessage,
  ].join("\n");

  const url = `https://wa.me/${customerNumber}?text=${encodeURIComponent(message)}`;
  console.log("Customer WhatsApp URL:", url);
}

export async function sendCustomerEmail(order: IOrder): Promise<void> {
  if (!order.customer.email) {
    return;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("SMTP config missing. Skipping customer email.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const itemRows = order.items
      .map(
        (item) =>
          `<tr><td style=\"padding:8px;border-bottom:1px solid #eee\">${item.productName}</td><td style=\"padding:8px;border-bottom:1px solid #eee\">${item.quantity}</td><td style=\"padding:8px;border-bottom:1px solid #eee\">${formatPrice((item.discountPrice ?? item.price) * item.quantity)}</td></tr>`,
      )
      .join("");

    const supportLink = getAdminWhatsAppNumber()
      ? `https://wa.me/${getAdminWhatsAppNumber()}?text=${encodeURIComponent(`Need support for order ${order.orderNumber}`)}`
      : "#";

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `ZARVAYA JEWELS <${smtpUser}>`,
      to: order.customer.email,
      subject: `Your ZARVAYA order ${order.orderNumber}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; background:#faf8f5; padding:24px; color:#1a1a1a;">
          <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #eee; border-radius:12px; overflow:hidden;">
            <div style="padding:20px 24px; background:#1a1a1a; color:#f0ede8;">
              <h1 style="margin:0; font-family:'Playfair Display',serif; font-size:24px;">ZARVAYA JEWELS</h1>
              <p style="margin:8px 0 0; font-size:14px;">Order confirmation</p>
            </div>
            <div style="padding:24px;">
              <p style="margin-top:0;">Assalam o Alaikum ${order.customer.name},</p>
              <p>Thank you for your order. Your order number is <strong>${order.orderNumber}</strong>.</p>
              <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <thead>
                  <tr>
                    <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Item</th>
                    <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Qty</th>
                    <th style="text-align:left; padding:8px; border-bottom:1px solid #ddd;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
              <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
              <p><strong>Tracking:</strong> ${order.trackingNumber ?? "Will be shared soon"}</p>
              <p style="margin-top:18px;">Need help? <a href="${supportLink}" style="color:#8b6914">Chat on WhatsApp</a></p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send customer email", error);
  }
}
