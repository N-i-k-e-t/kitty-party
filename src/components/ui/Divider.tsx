import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-0 border-t border-stroke-subtle", className)} {...props} />;
}
