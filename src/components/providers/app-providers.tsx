"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";

function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw").catch(() => undefined);
    }
  }, []);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <PwaRegister />
      <Toaster />
    </SessionProvider>
  );
}
