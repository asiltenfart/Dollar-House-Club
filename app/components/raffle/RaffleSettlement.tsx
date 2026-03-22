"use client";

import React, { useState } from "react";
import { useCommitRaffle, useRevealWinner, useIsRaffleExpired, useIsRaffleCommitted } from "@/lib/flow/hooks";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

interface RaffleSettlementProps {
  raffleId: number;
  status: string;
  onSettled?: () => void;
}

export default function RaffleSettlement({
  raffleId,
  status,
  onSettled,
}: RaffleSettlementProps) {
  const { data: isExpired } = useIsRaffleExpired(raffleId);
  const { data: isCommitted } = useIsRaffleCommitted(raffleId);
  const { commitRaffle } = useCommitRaffle();
  const { revealWinner } = useRevealWinner();
  const { showToast } = useToast();
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // Only show for active raffles that have expired
  if (status !== "active" || !isExpired) return null;

  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      await commitRaffle(raffleId);
      showToast("Randomness committed! Now reveal the winner.", "success");
    } catch (e) {
      showToast("Failed to commit. Please try again.", "error");
      console.error("Commit error:", e);
    }
    setIsCommitting(false);
  };

  const handleReveal = async () => {
    setIsRevealing(true);
    try {
      await revealWinner(raffleId);
      showToast("Winner revealed!", "success");
      onSettled?.();
    } catch (e) {
      showToast("Failed to reveal. Wait a moment and try again.", "error");
      console.error("Reveal error:", e);
    }
    setIsRevealing(false);
  };

  return (
    <div className="bg-[#FFF4E5] border border-[#E07912] rounded-[12px] p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#E07912] text-white flex items-center justify-center shrink-0 text-sm font-bold">
          !
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#222222] mb-1">
            This raffle has expired
          </p>
          <p className="text-xs text-[#717171] mb-3">
            Settlement requires two steps for secure onchain randomness.
            Anyone can trigger settlement — no special permissions needed.
          </p>

          {!isCommitted ? (
            <div>
              <p className="text-xs font-semibold text-[#222222] mb-2">
                Step 1 of 2: Commit randomness
              </p>
              <Button
                size="sm"
                onClick={handleCommit}
                isLoading={isCommitting}
                disabled={isCommitting}
              >
                {isCommitting ? "" : "Commit Randomness"}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-[#222222] mb-2">
                Step 2 of 2: Reveal winner
              </p>
              <p className="text-xs text-[#717171] mb-2">
                Randomness is committed. Reveal the winner using the secure random beacon.
              </p>
              <Button
                size="sm"
                onClick={handleReveal}
                isLoading={isRevealing}
                disabled={isRevealing}
              >
                {isRevealing ? "" : "Reveal Winner"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
