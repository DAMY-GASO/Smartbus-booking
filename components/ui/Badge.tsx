import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-primary-100 text-primary-700",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

/** Maps common status strings (Trip/Booking/Parcel) to a sensible badge tone. */
export function statusTone(status: string): BadgeTone {
  const positive = ["ACTIVE", "COMPLETED", "CONFIRMED", "DELIVERED", "PAID"];
  const warning = ["SCHEDULED", "PENDING", "IN_TRANSIT", "RECEIVED", "MAINTENANCE"];
  const negative = ["CANCELLED", "INACTIVE", "REFUNDED", "RETURNED"];

  if (positive.includes(status)) return "success";
  if (warning.includes(status)) return "warning";
  if (negative.includes(status)) return "danger";
  return "default";
}
