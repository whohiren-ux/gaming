import { NextResponse } from "next/server";
import { ZodError } from "zod";

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

    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
