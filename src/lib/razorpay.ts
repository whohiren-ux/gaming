import Razorpay from "razorpay";

import { getEnv } from "@/lib/env";

let razorpay: Razorpay | null = null;

export function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: getEnv("RAZORPAY_KEY_ID"),
      key_secret: getEnv("RAZORPAY_KEY_SECRET")
    });
  }

  return razorpay;
}
