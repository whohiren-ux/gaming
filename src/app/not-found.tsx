import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-6xl font-bold tracking-tight text-white/90">
          404
        </h1>
        <p className="text-lg text-white/60">Page not found</p>
        <p className="text-sm text-white/40">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
