import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost:5432/gaming_cafe";
  const log: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"];
  const options = {
    log
  };

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    ...options
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
