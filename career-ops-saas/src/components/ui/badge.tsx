import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "border-zinc-700 bg-zinc-900 text-zinc-100",
      secondary: "border-zinc-700 bg-zinc-800 text-zinc-100",
      success: "border-emerald-700 bg-emerald-950 text-emerald-200",
      warning: "border-amber-700 bg-amber-950 text-amber-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
