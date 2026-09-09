import nodemailer from "nodemailer";

import { CAFE_NAME } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { getOptionalEnv } from "@/lib/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = getOptionalEnv("GMAIL_USER");
  const pass = getOptionalEnv("GMAIL_APP_PASSWORD");

  if (!user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  return transporter;
}

function buildWhatsAppLink(phone: string, message: string) {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

type BookingEmailInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  reference: string;
  setupName: string;
  startTime: Date;
  durationMinutes: number;
  priceTotal: number | string;
  qrUrl: string;
  cafePhone?: string | null;
};

export async function sendBookingConfirmationEmail(input: BookingEmailInput) {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email-service] Gmail SMTP not configured. Skipping email.");
    return null;
  }

  const whatsappMsg = `Hi! My booking reference is ${input.reference}. ${input.setupName} on ${formatDateTime(input.startTime)}. Need any help!`;
  const whatsappLink = input.cafePhone
    ? buildWhatsAppLink(input.cafePhone, whatsappMsg)
    : null;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:32px;text-align:center;border-radius:16px 16px 0 0;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:1px;">${CAFE_NAME}</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Booking Confirmed</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111111;padding:32px;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.08);border-top:none;">
              <p style="color:#a1a1aa;font-size:14px;margin:0 0 8px;">Hi ${input.customerName},</p>
              <p style="color:#d4d4d8;font-size:15px;margin:0 0 24px;">Your gaming session is confirmed! Here are your booking details:</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid rgba(99,102,241,0.2);">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;"><span style="color:#a1a1aa;font-size:13px;">Reference</span></td>
                        <td style="padding:6px 0;text-align:right;"><span style="color:#ffffff;font-size:14px;font-weight:700;">${input.reference}</span></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;"><span style="color:#a1a1aa;font-size:13px;">Setup</span></td>
                        <td style="padding:6px 0;text-align:right;"><span style="color:#ffffff;font-size:14px;font-weight:600;">${input.setupName}</span></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;"><span style="color:#a1a1aa;font-size:13px;">Date & Time</span></td>
                        <td style="padding:6px 0;text-align:right;"><span style="color:#ffffff;font-size:14px;font-weight:600;">${formatDateTime(input.startTime)}</span></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;"><span style="color:#a1a1aa;font-size:13px;">Duration</span></td>
                        <td style="padding:6px 0;text-align:right;"><span style="color:#ffffff;font-size:14px;font-weight:600;">${input.durationMinutes} min</span></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;border-top:1px solid rgba(255,255,255,0.1);"><span style="color:#a1a1aa;font-size:13px;">Total</span></td>
                        <td style="padding:6px 0;border-top:1px solid rgba(255,255,255,0.1);text-align:right;"><span style="color:#a855f7;font-size:18px;font-weight:900;">${formatINR(input.priceTotal)}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#a1a1aa;font-size:13px;margin:0 0 16px;text-align:center;">Show this QR code at the cafe:</p>
              <div style="text-align:center;margin-bottom:24px;">
                <img src="${input.qrUrl}" alt="Booking QR Code" style="border-radius:8px;background:#ffffff;padding:8px;" />
              </div>

              ${whatsappLink ? `
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${whatsappLink}" target="_blank" style="display:inline-block;background-color:#25d366;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:14px;">
                  Chat on WhatsApp
                </a>
                <p style="color:#71717a;font-size:12px;margin:8px 0 0;">Need help? Message us on WhatsApp</p>
              </div>
              ` : ""}

              <div style="text-align:center;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
                <p style="color:#71717a;font-size:12px;margin:0;">This is an automated confirmation from ${CAFE_NAME}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const info = await transport.sendMail({
    from: `"${CAFE_NAME}" <${process.env.GMAIL_USER}>`,
    to: input.customerEmail,
    subject: `Booking Confirmed - ${input.reference} | ${CAFE_NAME}`,
    html
  });

  console.log(`[email-service] Confirmation email sent: ${info.messageId}`);
  return info;
}
