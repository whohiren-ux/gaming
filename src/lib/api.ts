import { NextResponse } from "next/server";
import { ZodError } from "zod";

const SAFE_MESSAGES: Record<string, string> = {
  "Unauthorized": "Authentication required",
  "Forbidden": "You do not have permission to perform this action",
  "Not Found": "Resource not found",
};

function sanitizeErrorMessage(message: string): string {
  if (SAFE_MESSAGES[message]) return SAFE_MESSAGES[message];
  if (/unauthorized/i.test(message)) return "Authentication required";
  if (/forbidden/i.test(message)) return "You do not have permission to perform this action";
  if (/not found/i.test(message)) return "Resource not found";
  if (/overlap|conflict/i.test(message)) return "This slot is not available";
  if (/not available/i.test(message)) return "This resource is not available";
  if (/past/i.test(message)) return "Invalid time selection";
  if (/overdue|expired/i.test(message)) return "Session has ended";
  if (/already/i.test(message)) return "This action has already been completed";
  if (/not.*bookable/i.test(message)) return "This setup is not available for booking";
  if (/maintenance/i.test(message)) return "This setup is currently under maintenance";
  if (/insufficient/i.test(message)) return "Insufficient balance";
  if (/invalid.*signature/i.test(message)) return "Payment verification failed";
  return "An error occurred. Please try again.";
}

export function apiError(error: unknown) {
  if (error instanceof Response) {
    return NextResponse.json(
      { error: error.statusText || "Request failed" },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: error.flatten()
      },
      { status: 422 }
    );
  }

  if (error instanceof Error) {
    const status = /unauthorized/i.test(error.message)
      ? 401
      : /forbidden/i.test(error.message)
        ? 403
        : /not found/i.test(error.message)
          ? 404
          : 400;

    return NextResponse.json({ error: sanitizeErrorMessage(error.message) }, { status });
  }

  return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
