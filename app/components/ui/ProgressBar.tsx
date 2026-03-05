"use client";

import React, { useEffect, useState } from "react";

interface ProgressBarProps {
  percent: number;
  height?: 4 | 8;
  animated?: boolean;
  showLabel?: boolean;
}

export default function ProgressBar({
  percent,
  height = 4,
  animated = true,
  showLabel = false,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const clamped = Math.min(100, Math.max(0, percent));
  const isOverfunded = percent > 100;

  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => setWidth(clamped), 50);
    return () => clearTimeout(timer);
  }, [clamped]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div
        className="w-full overflow-hidden"
        style={{
          height: `${height}px`,
          background: "#EBEBEB",
          borderRadius: "9999px",
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: "linear-gradient(90deg, #FF385C 0%, #FF6B81 100%)",
            borderRadius: "9999px",
            transition: animated ? "width 600ms ease-out" : "none",
          }}
        />
      </div>
      {showLabel && isOverfunded && (
        <span className="text-xs font-semibold text-[#FF385C]">
          Overfunded!
        </span>
      )}
    </div>
  );
}
