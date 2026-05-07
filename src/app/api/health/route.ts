import { ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startedAt = Date.now();
  await prisma.$queryRaw`SELECT 1`;

  return ok({
    ok: true,
    database: "online",
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString()
  });
}
