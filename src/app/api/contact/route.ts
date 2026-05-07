import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, ok } from "@/lib/api";
import { createNotification } from "@/lib/notification-service";
import { rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(1000)
});

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "contact", 5, 60_000);
  if (limited) {
    return limited;
  }

  try {
    const input = contactSchema.parse(await request.json());

    await createNotification({
      type: "SYSTEM",
      title: `Contact request from ${input.name}`,
      message: input.message,
      metadata: {
        email: input.email,
        source: "contact-page"
      }
    });

    return ok({ sent: true });
  } catch (error) {
    return apiError(error);
  }
}
