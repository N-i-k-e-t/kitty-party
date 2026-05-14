import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const cardVariants = cva("rounded-2xl border transition-shadow", {
  variants: {
    variant: {
      flat: "border-stroke-subtle bg-surface-raised shadow-none",
      raised: "bg-surface-raised border-stroke-subtle shadow-elev-1",
      glass: "glass border-stroke-subtle",
      gradient: "border-stroke-subtle gradient-dawn shadow-soft",
      /** @deprecated use `raised` */
      elevated: "bg-surface-raised border-stroke-subtle shadow-elev-2",
    },
    padding: {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "glass",
    padding: "md",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}
