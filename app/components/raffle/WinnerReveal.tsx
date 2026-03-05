import React from "react";
import type { Raffle } from "@/types";
import { formatUSD } from "@/lib/utils/format";

interface WinnerRevealProps {
  raffle: Raffle;
}

export default function WinnerReveal({ raffle }: WinnerRevealProps) {
  if (!raffle.winner) return null;

  const isFunded = raffle.status === "completed_funded";
  const transferNotConfirmed = isFunded && !raffle.transferConfirmed && raffle.phase === "completed";

  if (transferNotConfirmed) {
    return (
      <div className="mb-6 rounded-[12px] border border-[#E07912] bg-[#FFF4E5] p-4 flex items-start gap-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
          <path d="M10 3L18 17H2L10 3z" stroke="#E07912" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 9v4M10 14.5v.5" stroke="#E07912" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-[#E07912]">Transfer not confirmed</p>
          <p className="text-xs text-[#717171] mt-1">
            The winner has not confirmed property receipt within 30 days. Yield will be allocated to the platform.
          </p>
        </div>
      </div>
    );
  }

  if (isFunded) {
    return (
      <div className="mb-6 rounded-[12px] border border-[#008A05] bg-[#E6F9E7] p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl" role="img" aria-label="House">🏠</span>
          <div>
            <p className="text-base font-bold text-[#008A05]">
              {raffle.winner.displayName} won the property!
            </p>
            <p className="text-xs text-[#717171]">
              {raffle.transferConfirmed ? "Transfer confirmed. Congratulations!" : "Winner selected — awaiting transfer confirmation."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unfunded — yield raffle
  return (
    <div className="mb-6 rounded-[12px] border border-[#DDDDDD] bg-[#F7F7F7] p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl" role="img" aria-label="Celebration">🎉</span>
        <div>
          <p className="text-base font-bold text-[#222222]">
            {raffle.winner.displayName} won {formatUSD(raffle.totalYieldEarned)} in yield!
          </p>
          <p className="text-xs text-[#717171] mt-1">
            This raffle did not reach its target. Yield was raffled among depositors. All principals have been returned.
          </p>
        </div>
      </div>
    </div>
  );
}
