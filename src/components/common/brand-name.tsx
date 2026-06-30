import type { ElementType } from "react";

import { CAFE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandNameProps = {
  as?: ElementType;
  className?: string;
};

export function BrandName({ as: Component = "span", className }: BrandNameProps) {
  return (
    <Component className={cn("brand-name", className)} aria-label={CAFE_NAME}>
      <span aria-hidden="true">HOUSE</span>
      <span aria-hidden="true" className="brand-name-of">
        OF
      </span>
      <span aria-hidden="true">GAMERS</span>
    </Component>
  );
}
