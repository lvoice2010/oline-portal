import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "soon"
  | "new"
  | "season"
  | "industry"
  | "recommend"
  | "neutral"
  | "success"
  | "warning"
  | "info";

const styles: Record<Variant, string> = {
  soon: "bg-navy-50 text-navy/55 border border-navy/15",
  new: "bg-copper/10 text-copper border border-copper/20",
  season: "bg-amber-100 text-amber-800 border border-amber-200",
  industry: "bg-navy text-white",
  recommend: "bg-copper text-white",
  neutral: "bg-navy-50 text-navy/70",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  info: "bg-sky-50 text-sky-700 border border-sky-200",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
