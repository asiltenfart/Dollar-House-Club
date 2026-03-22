"use client";

import { useState, useEffect } from "react";
import { formatTimeLeft } from "@/lib/utils/format";

interface LiveCountdownProps {
  expiresAt: string;
  isActive: boolean;
  className?: string;
  suffix?: string;
}

/**
 * Real-time countdown that updates every second.
 * Shows "Expired" when time runs out.
 */
export default function LiveCountdown({ expiresAt, isActive, className = "", suffix = "" }: LiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(expiresAt));

  useEffect(() => {
    if (!isActive) return;
    // Update immediately in case of stale initial render
    setTimeLeft(formatTimeLeft(expiresAt));
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, isActive]);

  if (!isActive) return <span className={className}>Ended</span>;

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {timeLeft === "Expired" ? timeLeft : `${timeLeft}${suffix}`}
    </span>
  );
}
