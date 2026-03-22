"use client";

import React, { useState, useEffect } from "react";
import { useCommitRaffle, useRevealWinner, useIsRaffleExpired, useIsRaffleCommitted, useHarvestYield, useRaffle } from "@/lib/flow/hooks";
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
  const { data: isExpired, refetch: refetchExpired } = useIsRaffleExpired(raffleId);
  const { data: isCommitted, refetch: refetchCommitted } = useIsRaffleCommitted(raffleId);
  // Also check the real on-chain status to detect if scheduler already settled
  const { data: onChainRaffle, refetch: refetchRaffle } = useRaffle(raffleId);

  // Poll expiry status every 10s until expired (emulator needs block advancement)
  useEffect(() => {
    if (status !== "active" || isExpired) return;
    const interval = setInterval(() => {
      refetchExpired();
    }, 10000);
    return () => clearInterval(interval);
  }, [status, isExpired, refetchExpired]);

  // Poll on-chain raffle status every 10s to detect scheduler-driven settlement
  useEffect(() => {
    if (status !== "active") return;
    const interval = setInterval(() => {
      refetchRaffle();
    }, 10000);
    return () => clearInterval(interval);
  }, [status, refetchRaffle]);

  const { commitRaffle } = useCommitRaffle();
  const { revealWinner } = useRevealWinner();
  const { harvestYield } = useHarvestYield();
  const { showToast } = useToast();
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  // Delay showing the banner so auto-settlement has time to resolve first
  const [showDelayPassed, setShowDelayPassed] = useState(false);
  useEffect(() => {
    if (status !== "active" || !isExpired) return;
    const timer = setTimeout(() => setShowDelayPassed(true), 60000);
    return () => clearTimeout(timer);
  }, [status, isExpired]);

  // If the on-chain status is no longer active (rawValue 0), the raffle
  // has been committed or resolved — possibly by the scheduler.
  // Trigger a full page refetch so the parent components update.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChainStatus = (onChainRaffle as any)?.status?.rawValue;
  const hasNotifiedSettled = React.useRef(false);
  useEffect(() => {
    // rawValue "2" = resolved_funded, "3" = resolved_unfunded
    if ((onChainStatus === "2" || onChainStatus === "3") && !hasNotifiedSettled.current) {
      hasNotifiedSettled.current = true;
      onSettled?.();
    }
  }, [onChainStatus, onSettled]);

  // Hide if raffle is already settled on-chain (scheduler did it)
  if (onChainStatus === "2" || onChainStatus === "3") return null;

  // Only show for active raffles that have expired, after a delay
  if (status !== "active" || !isExpired || !showDelayPassed) return null;

  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      // Harvest any pending yield before committing
      try {
        await harvestYield(raffleId);
      } catch {
        // Yield harvest is best-effort — OK if it fails
      }
      await commitRaffle(raffleId);
      showToast("Randomness committed! Now reveal the winner.", "success");
      refetchCommitted();
    } catch (e) {
      // If commit fails because raffle is already committed/resolved, refetch
      refetchRaffle();
      showToast("Failed to commit. The raffle may have been settled automatically.", "error");
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
      refetchRaffle();
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
