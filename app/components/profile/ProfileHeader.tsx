import React from "react";
import Image from "next/image";
import type { UserProfile } from "@/types";
import { formatDate } from "@/lib/utils/format";

interface ProfileHeaderProps {
  user: UserProfile;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: "var(--gradient-hero)" }}
          >
            {initials}
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
        {user.rafflesWon > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 bg-[#FFF4E5] text-[#E07912] text-xs font-semibold px-2 py-0.5 rounded-full">
            ⭐ {user.rafflesWon} {user.rafflesWon === 1 ? "win" : "wins"}
          </span>
        )}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-8">
        <StatItem value={user.rafflesEntered} label="Raffles Entered" />
        <div className="w-px h-8 bg-[#EBEBEB]" />
        <StatItem value={user.rafflesWon} label="Raffles Won" />
        <div className="w-px h-8 bg-[#EBEBEB]" />
        <StatItem value={user.rafflesListed} label="Properties Listed" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-[#222222]">{value}</span>
      <span className="text-xs text-[#717171]">{label}</span>
    </div>
  );
}
