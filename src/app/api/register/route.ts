import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

import { apiError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "register", 8, 60_000);
  if (limited) {
    return limited;
  }

  try {
    const input = registerSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return ok({ error: "An account already exists for this email." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        phone: input.phone,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: "CUSTOMER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return ok({ user }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
