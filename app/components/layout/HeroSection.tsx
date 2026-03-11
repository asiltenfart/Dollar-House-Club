"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Raffle } from "@/types";
import { formatTimeLeft, calcPercent } from "@/lib/utils/format";
import { getAvatar } from "@/lib/utils/avatars";

interface HeroSectionProps {
  raffles: Raffle[];
}

export default function HeroSection({ raffles }: HeroSectionProps) {
  const heroFeatured = raffles[0];
  const heroGrid = raffles.slice(1, 5);

  return (
    <section className="relative overflow-hidden bg-white" style={{ padding: "56px 24px 48px" }}>
      {/* Decorative squiggle — top-left */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width="200"
        height="260"
        viewBox="0 0 200 260"
        fill="none"
      >
        <path
          d="M-20 90C20 40 90 10 80 80C70 150 10 130 30 190C50 250 110 220 140 170"
          stroke="#FF385C"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M-40 50C10 10 60 -10 70 50C80 110 20 110 40 160"
          stroke="#FF385C"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
      </svg>

      {/* Decorative squiggle — top-right */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        width="200"
        height="260"
        viewBox="0 0 200 260"
        fill="none"
      >
        <path
          d="M220 90C180 40 110 10 120 80C130 150 190 130 170 190C150 250 90 220 60 170"
          stroke="#FF385C"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M240 50C190 10 140 -10 130 50C120 110 180 110 160 160"
          stroke="#FF385C"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
      </svg>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {/* Headline */}
        <h1
          className="text-center text-[#1A1A1A]"
          style={{
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: 44,
          }}
        >
          Win a home. Keep your money.
        </h1>

        {/* Two-column card layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
          {/* Left — Featured raffle */}
          {heroFeatured && (
            <div>
              <p
                className="uppercase text-[#717171] mb-3"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}
              >
                Featured Raffle
              </p>
              <FeaturedCard raffle={heroFeatured} />
            </div>
          )}

          {/* Right — 2x2 grid */}
          {heroGrid.length > 0 && (
            <div>
              <p
                className="uppercase text-[#717171] mb-3"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}
              >
                Active Now
              </p>
              <div className="grid grid-cols-2 gap-4">
                {heroGrid.map((r) => (
                  <SmallCard key={r.id} raffle={r} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <span className="text-[#B0B0B0] select-none cursor-pointer hover:text-[#222]">&#8249;</span>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="flex items-center justify-center rounded-full cursor-pointer select-none"
              style={{
                width: 28,
                height: 28,
                fontSize: 13,
                fontWeight: 600,
                background: n === 1 ? "#1A1A1A" : "transparent",
                color: n === 1 ? "#fff" : "#717171",
                border: n === 1 ? "none" : "1px solid #DDDDDD",
              }}
            >
              {n}
            </span>
          ))}
          <span className="text-[#B0B0B0] select-none cursor-pointer hover:text-[#222]">&#8250;</span>
        </div>
      </div>
    </section>
  );
}

/* ── Featured (large) card ─────────────────────────────────────────────── */

function FeaturedCard({ raffle }: { raffle: Raffle }) {
  const percent = calcPercent(raffle.totalYieldEarned, raffle.targetValueUSD);
  const cover = raffle.property.images[0];

  return (
    <Link
      href={`/raffle/${raffle.id}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] hover:shadow-lg transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
        <Image
          src={cover}
          alt={raffle.property.title}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          sizes="(max-width: 1024px) 100vw, 680px"
          priority
        />
        {/* Overfunded badge on image */}
        {raffle.isOverfunded && (
          <div
            className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase px-3 py-1.5 rounded"
            style={{ background: "rgba(0,0,0,0.75)", letterSpacing: "0.04em" }}
          >
            Overfunded
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Title + seller + bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Seller avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E0E0E0] flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getAvatar(raffle.seller.address)} alt={raffle.seller.displayName} width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#1A1A1A] leading-snug line-clamp-2" style={{ fontSize: 17 }}>
                {raffle.property.title}
              </h3>
              <p className="text-sm text-[#717171] mt-0.5">{raffle.seller.displayName}</p>
            </div>
          </div>
          {/* Bookmark */}
          <BookmarkIcon size={18} />
        </div>

        {/* Description snippet */}
        <p className="text-sm text-[#555] mt-3 line-clamp-2 leading-relaxed">
          {raffle.property.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-4 text-sm text-[#717171]">
          <ClockLabel text={(() => { const t = formatTimeLeft(raffle.expiresAt); return t === "Expired" ? t : `${t} left`; })()}  />
          <span className="text-[#D0D0D0]">&bull;</span>
          <span>
            <strong className="text-[#1A1A1A]">{percent}%</strong> funded
          </span>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <TagPill>
            {raffle.property.propertyType.charAt(0).toUpperCase() +
              raffle.property.propertyType.slice(1)}
          </TagPill>
          <TagPill>
            {raffle.property.location.city}, {raffle.property.location.stateProvince}
          </TagPill>
        </div>
      </div>
    </Link>
  );
}

/* ── Small card (grid) ─────────────────────────────────────────────────── */

function SmallCard({ raffle }: { raffle: Raffle }) {
  const percent = calcPercent(raffle.totalYieldEarned, raffle.targetValueUSD);
  const cover = raffle.property.images[0];

  return (
    <Link
      href={`/raffle/${raffle.id}`}
      className="group block rounded-xl overflow-hidden bg-white border border-[#E8E8E8] hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={cover}
          alt={raffle.property.title}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          sizes="260px"
        />
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
            {/* Small avatar */}
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E0E0E0] flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getAvatar(raffle.seller.address)} alt={raffle.seller.displayName} width={24} height={24} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight">
              {raffle.property.title}
            </p>
          </div>
          <BookmarkIcon size={14} />
        </div>

        <p className="text-xs text-[#717171] mt-1 ml-8">{raffle.seller.displayName}</p>

        {/* Stats */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-[#717171] ml-8">
          <ClockLabel text={(() => { const t = formatTimeLeft(raffle.expiresAt); return t === "Expired" ? t : `${t} left`; })()} small />
          <span className="text-[#D0D0D0]">&bull;</span>
          <span>
            <strong className="text-[#1A1A1A]">{percent}%</strong> funded
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Shared tiny components ────────────────────────────────────────────── */

function BookmarkIcon({ size }: { size: number }) {
  return (
    <span className="text-[#BBBBBB] hover:text-[#717171] flex-shrink-0 mt-0.5 transition-colors cursor-pointer">
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <path
          d="M4 2h10a1 1 0 011 1v13l-6-3-6 3V3a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ClockLabel({ text, small }: { text: string; small?: boolean }) {
  const s = small ? 10 : 13;
  return (
    <span className="inline-flex items-center gap-1">
      <svg width={s} height={s} viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6.5 3.5V6.5L8.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {text}
    </span>
  );
}

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs text-[#717171] border border-[#DDDDDD] rounded-full"
      style={{ padding: "3px 10px" }}
    >
      {children}
    </span>
  );
}
