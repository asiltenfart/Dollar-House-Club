import React from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export default function Skeleton({ width = "100%", height = "16px", className = "", rounded = false }: SkeletonProps) {
  return (
    <div
      className={`shimmer ${rounded ? "rounded-full" : "rounded-[8px]"} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function RaffleCardSkeleton() {
  return (
    <div className="rounded-[16px] border border-[#DDDDDD] overflow-hidden">
      <Skeleton height="240px" className="rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton height="20px" width="80%" />
        <Skeleton height="16px" width="60%" />
        <div className="border-t border-[#DDDDDD] pt-3 flex flex-col gap-2">
          <Skeleton height="14px" width="50%" />
          <Skeleton height="4px" />
          <Skeleton height="12px" width="70%" />
        </div>
      </div>
    </div>
  );
}

export function DepositCardSkeleton() {
  return (
    <div className="p-6 border border-[#DDDDDD] rounded-[12px] flex flex-col gap-4">
      <Skeleton height="32px" width="60%" />
      <Skeleton height="8px" />
      <Skeleton height="16px" width="50%" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton height="12px" width="60%" />
            <Skeleton height="20px" width="80%" />
          </div>
        ))}
      </div>
      <Skeleton height="56px" />
      <Skeleton height="44px" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Skeleton width="80px" height="80px" rounded />
      <Skeleton height="28px" width="200px" />
      <Skeleton height="16px" width="160px" />
      <div className="flex gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton height="24px" width="40px" />
            <Skeleton height="14px" width="60px" />
          </div>
        ))}
      </div>
    </div>
  );
}
