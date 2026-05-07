"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "border border-neon-blue/20 bg-ink-900 text-foreground shadow-neon-sm",
          title: "text-foreground",
          description: "text-muted-foreground"
        }
      }}
    />
  );
}
