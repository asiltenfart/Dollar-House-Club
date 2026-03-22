"use client";

import React, { useState, use } from "react";
import { notFound } from "next/navigation";
import { useRaffleById, useRaffleDeposits, parseRaffleId } from "@/lib/data/useRaffleData";
import { useAuth } from "@/lib/auth/AuthContext";
import PropertyGallery from "@/components/raffle/PropertyGallery";
import DepositCard from "@/components/raffle/DepositCard";
import WinnerReveal from "@/components/raffle/WinnerReveal";
import { RaffleStatusBadge } from "@/components/ui/Badge";
import { formatUSD, formatDate, formatTimeLeft } from "@/lib/utils/format";
import Link from "next/link";
import RaffleSettlement from "@/components/raffle/RaffleSettlement";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RaffleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { raffle, isLoading } = useRaffleById(id);
  const { deposits } = useRaffleDeposits(id);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-[#FF385C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!raffle) {
    notFound();
  }

  const isSeller = user?.profile.address === raffle.seller.address;

  const userDeposit = user
    ? deposits.find((d) => d.user.address === user.profile.address) ?? null
    : null;

  const sellerInitials = raffle.seller.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ padding: "0 0 80px" }}>
      {/* Breadcrumb */}
      <div
        className="border-b border-[#EBEBEB] py-3"
        style={{ padding: "12px 24px" }}
      >
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <nav className="flex items-center gap-2 text-sm text-[#717171]">
            <Link href="/" className="hover:text-[#222222] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-[#222222] transition-colors">Explore</Link>
            <span>/</span>
            <span className="text-[#222222] font-medium line-clamp-1">{raffle.property.title}</span>
          </nav>
        </div>
      </div>

      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 24px" }}>
        {/* Settlement UI for expired raffles */}
        <div className="pt-6">
          <RaffleSettlement
            raffleId={parseRaffleId(id)}
            status={raffle.status}
          />
        </div>

        {/* Winner reveal banner */}
        {raffle.winner && (
          <div className="pt-6">
            <WinnerReveal raffle={raffle} />
          </div>
        )}

        {/* Desktop layout */}
        <div className="hidden lg:grid" style={{ gridTemplateColumns: "60% 40%", gap: "40px", paddingTop: "24px" }}>
          {/* LEFT COL */}
          <div>
            <PropertyGallery images={raffle.property.images} title={raffle.property.title} />

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <RaffleStatusBadge status={raffle.status} />
                <span className="text-sm text-[#717171]">
                  Listed {formatDate(raffle.createdAt)}
                </span>
                {raffle.status === "active" && (
                  <span className="text-sm font-semibold text-[#E07912]">
                    Ends in {formatTimeLeft(raffle.expiresAt)}
                  </span>
                )}
              </div>

              <h1
                className="font-bold text-[#222222] mb-2 line-clamp-3"
                style={{ fontSize: "32px", lineHeight: "1.2", letterSpacing: "-0.01em" }}
              >
                {raffle.property.title}
              </h1>

              <p className="text-base text-[#717171] mb-6">
                {raffle.property.location.street},{" "}
                {raffle.property.location.city},{" "}
                {raffle.property.location.stateProvince}{" "}
                {raffle.property.location.postalCode},{" "}
                {raffle.property.location.country}
              </p>

              {/* Property details */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <DetailBox label="Bedrooms" value={raffle.property.bedrooms > 0 ? String(raffle.property.bedrooms) : "Studio"} />
                <DetailBox label="Bathrooms" value={String(raffle.property.bathrooms)} />
                <DetailBox label="Sq. Footage" value={`${raffle.property.squareFootage.toLocaleString()} ft²`} />
                <DetailBox label="Property Type" value={capitalize(raffle.property.propertyType)} />
                <DetailBox label="Year Built" value={String(raffle.property.yearBuilt)} />
                <DetailBox label="Target Value" value={formatUSD(raffle.targetValueUSD)} />
              </div>

              {/* Description */}
              <div className="border-t border-[#EBEBEB] pt-8 mb-8">
                <h2 className="text-xl font-bold text-[#222222] mb-4">About this property</h2>
                <p className="text-base text-[#717171] leading-relaxed">
                  {raffle.property.description}
                </p>
              </div>

              {/* Location placeholder */}
              <div className="border-t border-[#EBEBEB] pt-8 mb-8">
                <h2 className="text-xl font-bold text-[#222222] mb-4">Location</h2>
                <div className="h-48 bg-[#F7F7F7] rounded-[12px] flex items-center justify-center text-sm text-[#717171]">
                  {raffle.property.location.city}, {raffle.property.location.stateProvince}
                </div>
              </div>

              {/* Seller card */}
              <div className="border-t border-[#EBEBEB] pt-8">
                <h2 className="text-xl font-bold text-[#222222] mb-4">Listed by</h2>
                <Link
                  href={`/profile/${raffle.seller.address}`}
                  className="flex items-center gap-4 p-4 border border-[#EBEBEB] rounded-[12px] hover:bg-[#F7F7F7] transition-colors group"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                    style={{ background: "var(--gradient-hero)" }}
                  >
                    {sellerInitials}
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222] group-hover:text-[#FF385C] transition-colors">
                      {raffle.seller.displayName}
                    </p>
                    <p className="text-sm text-[#717171]">
                      {raffle.seller.rafflesListed} {raffle.seller.rafflesListed === 1 ? "listing" : "listings"}{" "}
                      · {raffle.seller.rafflesCompleted} completed
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto text-[#717171]">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COL — sticky deposit card */}
          <div>
            <div className="sticky" style={{ top: "88px" }}>
              <DepositCard
                raffle={raffle}
                userDeposit={userDeposit}
                isSeller={isSeller}
              />
            </div>
          </div>
        </div>

        {/* MOBILE layout */}
        <div className="lg:hidden">
          {/* Full-bleed gallery */}
          <div className="mx-[-24px]" style={{ marginTop: "0" }}>
            <div style={{ height: "280px", overflow: "hidden" }}>
              <PropertyGallery images={raffle.property.images} title={raffle.property.title} />
            </div>
          </div>

          {/* Content */}
          <div className="pt-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <RaffleStatusBadge status={raffle.status} />
              {raffle.status === "active" && (
                <span className="text-xs font-semibold text-[#E07912]">
                  {(() => { const t = formatTimeLeft(raffle.expiresAt); return t === "Expired" ? t : `${t} left`; })()}
                </span>
              )}
            </div>

            <h1
              className="font-bold text-[#222222] mb-2 line-clamp-3"
              style={{ fontSize: "24px", lineHeight: "1.3", letterSpacing: "-0.01em" }}
            >
              {raffle.property.title}
            </h1>

            <p className="text-sm text-[#717171] mb-5">
              {raffle.property.location.city}, {raffle.property.location.stateProvince}
            </p>

            {/* Property details */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <DetailBox label="Bedrooms" value={raffle.property.bedrooms > 0 ? String(raffle.property.bedrooms) : "Studio"} />
              <DetailBox label="Bathrooms" value={String(raffle.property.bathrooms)} />
              <DetailBox label="Sq. Footage" value={`${raffle.property.squareFootage.toLocaleString()} ft²`} />
              <DetailBox label="Year Built" value={String(raffle.property.yearBuilt)} />
            </div>

            <p className="text-sm text-[#717171] leading-relaxed mb-6">
              {raffle.property.description}
            </p>

            {/* Deposit card */}
            <DepositCard
              raffle={raffle}
              userDeposit={userDeposit}
              isSeller={isSeller}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F7F7F7] rounded-[8px] p-3">
      <p className="text-xs text-[#717171] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#222222]">{value}</p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
