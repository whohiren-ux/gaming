"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ERROR BOUNDARY]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white/90">
          Something went wrong
        </h1>
        <p className="text-sm text-white/40">
          An unexpected error occurred. Please try again.
        </p>
      </div>
      <Button
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
        onClick={() => reset()}
      >
        Try Again
      </Button>
    </div>
  );
}
