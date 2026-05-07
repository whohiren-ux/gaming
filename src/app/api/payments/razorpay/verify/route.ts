import { z } from "zod";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated } from "@/lib/access-control";
import { confirmRazorpayCheckoutPayment } from "@/lib/payment-service";

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string()
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    assertAuthenticated(session);
    const input = verifySchema.parse(await request.json());

    const payment = await confirmRazorpayCheckoutPayment({
      orderId: input.razorpay_order_id,
      paymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature
    });

    return ok({ payment });
  } catch (error) {
    return apiError(error);
  }
}
