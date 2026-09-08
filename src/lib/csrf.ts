import crypto from "crypto";

import { cookies } from "next/headers";

const CSRF_SECRET = process.env.AUTH_SECRET || "csrf-fallback-secret";
const COOKIE_NAME = "csrf-token";
const HEADER_NAME = "x-csrf-token";

function generateToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const signature = crypto.createHmac("sha256", CSRF_SECRET).update(token).digest("hex");
  return `${token}.${signature}`;
}

function verifyToken(token: string): boolean {
  const [value, signature] = token.split(".");
  if (!value || !signature) return false;

  const expected = crypto.createHmac("sha256", CSRF_SECRET).update(value).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function setCsrfToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  if (existing && verifyToken(existing)) return existing;

  const token = generateToken();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60
  });
  return token;
}

export async function validateCsrfRequest(request: Request): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return true;

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  const headerToken = request.headers.get(HEADER_NAME);

  if (!cookieToken || !headerToken) return false;
  if (cookieToken !== headerToken) return false;
  return verifyToken(cookieToken);
}
