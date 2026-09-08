"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ADMIN ERROR BOUNDARY]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white/90">
          Admin Error
        </h1>
        <p className="text-sm text-white/40">
          Something went wrong in the admin panel. Please try again.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
      >
        Try Again
      </button>
    </div>
  );
}
