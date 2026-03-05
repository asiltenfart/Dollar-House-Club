import React from "react";
import type { RaffleStatus } from "@/types";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "error" | "neutral";
  size?: "sm" | "md";
}

export default function Badge({ label, variant = "neutral", size = "sm" }: BadgeProps) {
  const variantMap = {
    primary: "bg-[#FFF0F3] text-[#FF385C]",
    success: "bg-[#E6F9E7] text-[#008A05]",
    warning: "bg-[#FFF4E5] text-[#E07912]",
    error: "bg-[#FFF0ED] text-[#C13515]",
    neutral: "bg-[#EBEBEB] text-[#717171]",
  };

  const sizeMap = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-[9999px] tracking-wide uppercase ${variantMap[variant]} ${sizeMap[size]}`}
    >
      {label}
    </span>
  );
}

export function RaffleStatusBadge({ status }: { status: RaffleStatus }) {
  if (status === "active") {
    return <Badge label="Active" variant="success" />;
  }
  if (status === "completed_funded") {
    return <Badge label="Completed — Winner Selected" variant="primary" />;
  }
  return <Badge label="Completed — Yield Raffle" variant="neutral" />;
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-white rounded-[9999px] px-2 py-0.5 text-[10px] font-semibold text-[#008A05] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4.5" fill="#008A05" />
        <path d="M3 5l1.5 1.5L7 3.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified
    </span>
  );
}
