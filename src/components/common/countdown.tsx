"use client";

import { useEffect, useMemo, useState } from "react";

export function CountdownText({
  endsAt,
  fallback,
  expiredText = "Expired"
}: {
  endsAt?: string | null;
  fallback?: string;
  expiredText?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const text = useMemo(() => {
    if (!endsAt) {
      return fallback ?? "";
    }

    const diff = new Date(endsAt).getTime() - now;
    if (diff <= 0) {
      return expiredText;
    }

    const totalSeconds = Math.ceil(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
    }

    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }, [endsAt, expiredText, fallback, now]);

  return <span>{text}</span>;
}
