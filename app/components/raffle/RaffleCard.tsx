"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Raffle } from "@/types";
import { formatUSD, formatTimeLeft, calcPercent } from "@/lib/utils/format";
import ProgressBar from "@/components/ui/ProgressBar";
import { RaffleStatusBadge, VerifiedBadge } from "@/components/ui/Badge";

interface RaffleCardProps {
  raffle: Raffle;
  isDeposited?: boolean;
}

export default function RaffleCard({ raffle, isDeposited }: RaffleCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const percent = calcPercent(raffle.totalYieldEarned, raffle.targetValueUSD);
  const cover = raffle.property.images[0];

  // Live countdown
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(raffle.expiresAt));
  useEffect(() => {
    if (raffle.status !== "active") return;
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(raffle.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [raffle.expiresAt, raffle.status]);

  return (
    <Link
      href={`/raffle/${raffle.id}`}
      className="group block rounded-[16px] border border-[#DDDDDD] overflow-hidden bg-white cursor-pointer"
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
      }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {/* Fallback placeholder */}
        {(!cover || !imageLoaded) && (
          <div className="absolute inset-0 bg-[#F7F7F7] flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 8L40 22V40H32V28H16V40H8V22L24 8Z" fill="#DDDDDD" />
            </svg>
          </div>
        )}
        {cover && (
          <Image
            src={cover}
            alt={raffle.property.title}
            fill
            className="object-cover"
            style={{
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 300ms ease, transform 200ms ease-out",
              transform: "scale(1)",
            }}
            onLoad={() => setImageLoaded(true)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3">
          <RaffleStatusBadge status={raffle.status} />
        </div>

        {/* Verified badge — top right */}
        <div className="absolute top-3 right-3">
          <VerifiedBadge />
        </div>

        {/* Deposited badge */}
        {isDeposited && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#008A05] rounded-full px-2.5 py-1 shadow-sm">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Deposited
            </span>
          </div>
        )}

        {/* Overfunded label */}
        {raffle.isOverfunded && (
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-semibold text-white bg-[#FF385C] rounded-full px-2 py-0.5">
              Overfunded!
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold text-[#222222] line-clamp-2 mb-1"
          style={{ fontSize: "20px", lineHeight: "1.4" }}
        >
          {raffle.property.title}
        </h3>

        <p className="text-sm text-[#717171] mb-3">
          {raffle.property.location.city}, {raffle.property.location.stateProvince}
          {" · "}
          {raffle.property.bedrooms > 0
            ? `${raffle.property.bedrooms} bed · ${raffle.property.bathrooms} bath`
            : `${raffle.property.bathrooms} bath · Studio`}
        </p>

        <div className="border-t border-[#DDDDDD] pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#222222]">
              Target: {formatUSD(raffle.targetValueUSD)}
            </span>
            <span className="text-xs text-[#717171]">{percent}% yield funded</span>
          </div>

          <ProgressBar percent={percent} height={4} />

          <div className="flex items-center justify-between text-xs text-[#717171]">
            <span>{raffle.depositorCount.toLocaleString()} depositors</span>
            {raffle.status === "active" ? (
              <span className="font-mono tabular-nums">{timeLeft === "Expired" ? timeLeft : `${timeLeft} left`}</span>
            ) : raffle.winner ? (
              <span className="text-[#008A05] font-semibold">Winner: {raffle.winner.displayName}</span>
            ) : (
              <span>Closed</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
