"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { UserProfile } from "@/types";
import { formatDate, formatYieldTicker } from "@/lib/utils/format";
import { getAvatar } from "@/lib/utils/avatars";

interface ProfileStats {
  rafflesEntered: number;
  rafflesWon: number;
  rafflesListed: number;
  rafflesCompleted: number;
  yieldWon: number;
}

interface ProfileHeaderProps {
  user: UserProfile;
  stats?: ProfileStats;
}

export default function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const avatar = useMemo(() => getAvatar(user.address), [user.address]);

  return (
    <div
      className="flex flex-col items-center text-center py-10 px-4"
      style={{ minHeight: "200px" }}
    >
      {/* Avatar */}
      <div className="mb-4">
        {user.avatarUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#EBEBEB]">
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#EBEBEB]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={user.displayName} width={80} height={80} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Name */}
      <h1
        className="font-bold text-[#222222] mb-1"
        style={{ fontSize: "32px", lineHeight: "1.2", letterSpacing: "-0.01em" }}
      >
        {user.displayName}
      </h1>

      {/* Reputation / member since */}
      <p className="text-sm text-[#717171] mb-6">
        Member since {formatDate(user.joinedAt)}
        {(stats?.rafflesWon ?? user.rafflesWon) > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 bg-[#FFF4E5] text-[#E07912] text-xs font-semibold px-2 py-0.5 rounded-full">
            ⭐ {stats?.rafflesWon ?? user.rafflesWon} {(stats?.rafflesWon ?? user.rafflesWon) === 1 ? "win" : "wins"}
          </span>
        )}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-8 flex-wrap justify-center">
        <StatItem value={String(stats?.rafflesEntered ?? user.rafflesEntered)} label="Raffles Entered" />
        <div className="w-px h-8 bg-[#EBEBEB]" />
        <StatItem value={String(stats?.rafflesWon ?? user.rafflesWon)} label="Raffles Won" />
        <div className="w-px h-8 bg-[#EBEBEB]" />
        <StatItem value={stats?.yieldWon ? formatYieldTicker(stats.yieldWon) : "$0.00"} label="Yield Won" color="#008A05" />
        <div className="w-px h-8 bg-[#EBEBEB]" />
        <StatItem value={String(stats?.rafflesListed ?? user.rafflesListed)} label="Properties Listed" />
      </div>
    </div>
  );
}

function StatItem({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold" style={{ color: color ?? "#222222" }}>{value}</span>
      <span className="text-xs text-[#717171]">{label}</span>
    </div>
  );
}
