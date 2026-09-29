import * as React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const variants = {
    primary: "bg-blue-50 text-blue-800 border-blue-200/80 font-semibold",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80 font-medium",
    danger: "bg-rose-50 text-rose-800 border-rose-200/80 font-medium",
    info: "bg-sky-50 text-sky-800 border-sky-200/80 font-medium",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/80 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
