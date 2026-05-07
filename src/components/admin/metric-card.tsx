import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
  tone = "blue"
}: {
  title: string;
  value: string | number;
  caption?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const tones = {
    blue: "text-neon-cyan bg-neon-blue/10 border-neon-blue/25",
    green: "text-neon-green bg-neon-green/10 border-neon-green/25",
    amber: "text-neon-amber bg-neon-amber/10 border-neon-amber/25",
    red: "text-neon-red bg-neon-red/10 border-neon-red/25"
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {caption ? <p className="mt-1 text-xs text-muted-foreground">{caption}</p> : null}
        </div>
        <span className={cn("grid size-12 place-items-center rounded-md border", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
