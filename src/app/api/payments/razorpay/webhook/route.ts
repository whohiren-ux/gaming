import { NextRequest } from "next/server";

import { apiError, ok } from "@/lib/api";
import { handleRazorpayWebhook, verifyRazorpayWebhook } from "@/lib/payment-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!verifyRazorpayWebhook(rawBody, signature)) {
      return ok({ error: "Invalid signature" }, { status: 401 });
    }

    const result = await handleRazorpayWebhook(rawBody);
    return ok(result);
  } catch (error) {
    return apiError(error);
  }
}
