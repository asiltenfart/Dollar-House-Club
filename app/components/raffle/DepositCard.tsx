"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Raffle, Deposit } from "@/types";
import { formatUSD, formatUSDDecimal, formatPercent, formatTimeLeft, formatYieldTicker, calcPercent } from "@/lib/utils/format";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SkillQuestionModal from "./SkillQuestionModal";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Confetti from "./Confetti";
import { useDepositToRaffle, useWithdrawFromRaffle, useClaimPrincipal, useClaimPrize, usePYUSDBalance, usePendingYield } from "@/lib/flow/hooks";

interface DepositCardProps {
  raffle: Raffle;
  userDeposit: Deposit | null;
  isSeller: boolean;
  onDepositSuccess?: (amount: number) => void;
  onWithdrawSuccess?: () => void;
}

export default function DepositCard({
  raffle,
  userDeposit,
  isSeller,
  onDepositSuccess,
  onWithdrawSuccess,
}: DepositCardProps) {
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const { showToast } = useToast();
  const { depositToRaffle } = useDepositToRaffle();
  const { withdrawFromRaffle } = useWithdrawFromRaffle();
  const { claimPrincipal } = useClaimPrincipal();
  const { claimPrize } = useClaimPrize();
  const { data: pyusdBalance, refetch: refetchBalance } = usePYUSDBalance(user?.profile.address ?? null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaimingPrincipal, setIsClaimingPrincipal] = useState(false);
  const [isClaimingPrize, setIsClaimingPrize] = useState(false);
  const [principalClaimed, setPrincipalClaimed] = useState(false);
  const [prizeClaimed, setPrizeClaimed] = useState(raffle.prizeClaimed);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [hasPassedSkill, setHasPassedSkill] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const depositCooldown = useRef(false);

  // ── Real on-chain yield with client-side interpolation ──────────────────
  //
  // 1. Poll SimpleYieldSource.getPendingYield() every 10s for the real value
  // 2. Between polls, interpolate locally using the APY rate so the ticker
  //    visibly ticks up without waiting for the next on-chain read
  // 3. Whenever a fresh on-chain value arrives, snap to it (no drift)
  //
  const raffleIdNum = parseInt(raffle.id.replace("raffle-", ""), 10) || parseInt(raffle.id, 10);
  const { data: onChainPendingYield, refetch: refetchYield } = usePendingYield(
    raffle.status === "active" ? raffleIdNum : null
  );

  const APY_RATE = 5.0;
  const SECONDS_PER_YEAR = 31536000;
  const TICK_MS = 100;
  const yieldPerTick = raffle.totalDeposited > 0
    ? (raffle.totalDeposited * APY_RATE * TICK_MS) / (SECONDS_PER_YEAR * 1000)
    : 0;

  // Total yield = already-harvested (on-chain totalYield) + pending (unharvested)
  const pendingYield = onChainPendingYield != null ? Number(onChainPendingYield) : 0;
  const baseYield = raffle.totalYieldEarned + pendingYield;

  const [liveYield, setLiveYield] = useState(baseYield);

  // Snap to on-chain value whenever it updates
  useEffect(() => {
    setLiveYield(raffle.totalYieldEarned + (onChainPendingYield != null ? Number(onChainPendingYield) : 0));
  }, [raffle.totalYieldEarned, onChainPendingYield]);

  // Interpolate between on-chain polls
  useEffect(() => {
    if (yieldPerTick <= 0 || raffle.status !== "active") return;
    const interval = setInterval(() => {
      setLiveYield((prev) => prev + yieldPerTick);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [yieldPerTick, raffle.status]);

  // Poll on-chain yield every 10s
  useEffect(() => {
    if (raffle.status !== "active") return;
    const interval = setInterval(() => { refetchYield(); }, 10000);
    return () => clearInterval(interval);
  }, [raffle.status, refetchYield]);

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(raffle.expiresAt));

  useEffect(() => {
    if (raffle.status !== "active") return;
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(raffle.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [raffle.expiresAt, raffle.status]);

  const percent = calcPercent(liveYield, raffle.targetValueUSD);
  const isActive = raffle.status === "active";
  const depositorCount = raffle.depositorCount;

  const handleDepositClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val < 10) {
      setAmountError("Minimum deposit is $10.");
      return;
    }
    if (pyusdBalance != null && val > Number(pyusdBalance)) {
      setAmountError(`Insufficient balance. You have ${formatUSDDecimal(Number(pyusdBalance))}.`);
      return;
    }
    setAmountError("");

    if (!hasPassedSkill && !userDeposit) {
      setShowSkillModal(true);
    } else {
      setShowDepositConfirm(true);
    }
  };

  const handleSkillSuccess = () => {
    setShowSkillModal(false);
    setHasPassedSkill(true);
    setShowDepositConfirm(true);
  };

  const handleConfirmDeposit = async () => {
    if (depositCooldown.current) return;
    setShowDepositConfirm(false);
    setIsDepositing(true);
    depositCooldown.current = true;

    try {
      const raffleIdNum = parseInt(raffle.id.replace("raffle-", ""), 10) || parseInt(raffle.id, 10);
      await depositToRaffle(raffleIdNum, parseFloat(amount));
      setIsDepositing(false);
      setAmount("");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      refetchBalance();
      onDepositSuccess?.(parseFloat(amount));
      showToast(`Deposited ${formatUSDDecimal(parseFloat(amount))} successfully!`, "success");
    } catch (e) {
      setIsDepositing(false);
      showToast("Transaction failed. Please try again.", "error");
      console.error("Deposit error:", e);
    }

    setTimeout(() => {
      depositCooldown.current = false;
    }, 2000);
  };

  const handleConfirmWithdraw = async () => {
    setShowWithdrawConfirm(false);
    setIsWithdrawing(true);
    try {
      const raffleIdNum = parseInt(raffle.id.replace("raffle-", ""), 10) || parseInt(raffle.id, 10);
      await withdrawFromRaffle(raffleIdNum);
      setIsWithdrawing(false);
      refetchBalance();
      onWithdrawSuccess?.();
      showToast("Principal withdrawn successfully.", "success");
    } catch (e) {
      setIsWithdrawing(false);
      showToast("Withdrawal failed. Please try again.", "error");
      console.error("Withdraw error:", e);
    }
  };

  if (isSeller) {
    return (
      <div
        className="p-6 border border-[#DDDDDD] rounded-[12px]"
        style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.15)" }}
      >
        <div className="inline-flex items-center gap-2 bg-[#FFF0F3] text-[#FF385C] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12 5V13H9V8H5V13H2V5L7 1Z" fill="currentColor" />
          </svg>
          Your Listing
        </div>
        <RaffleStats raffle={raffle} percent={percent} depositorCount={depositorCount} liveYield={liveYield} timeLeft={timeLeft} />
      </div>
    );
  }

  return (
    <>
      <div
        className="p-6 border border-[#DDDDDD] rounded-[12px] bg-white"
        style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.15)" }}
      >
        {/* User position — prominent banner at top */}
        {userDeposit && (
          <div className={`${userDeposit.isWithdrawn ? "bg-[#FFFBF0] border-[#F0DCA0]" : "bg-[#F0FFF4] border-[#B7EBC9]"} border rounded-[10px] p-4 mb-5`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-full ${userDeposit.isWithdrawn ? "bg-[#B08D2C]" : "bg-[#008A05]"} flex items-center justify-center`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={`text-sm font-bold ${userDeposit.isWithdrawn ? "text-[#B08D2C]" : "text-[#008A05]"}`}>
                {userDeposit.isWithdrawn ? "Principal withdrawn — yield still earning" : "You\u0027re in this raffle"}
              </span>
            </div>
            {!userDeposit.isWithdrawn && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#4A7C59]">Your deposit</span>
                <span className="text-sm font-bold text-[#222222]">
                  {formatUSD(userDeposit.principalAmount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className={`text-sm ${userDeposit.isWithdrawn ? "text-[#8A7430]" : "text-[#4A7C59]"}`}>Win chance</span>
              <span className="text-sm font-bold text-[#FF385C]">
                {formatPercent(userDeposit.winChance)}
              </span>
            </div>
          </div>
        )}

        {/* Target + Progress */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-1">Property Value</p>
          <p className="font-bold text-[#222222] mb-3" style={{ fontSize: "24px" }}>
            {formatUSD(raffle.targetValueUSD)}
          </p>
          <ProgressBar percent={percent} height={8} showLabel />
          <p className="text-sm text-[#717171] mt-2 font-mono tabular-nums">
            {formatYieldTicker(liveYield)} raised in yield ({percent}%)
          </p>
        </div>

        <RaffleStats raffle={raffle} percent={percent} depositorCount={depositorCount} liveYield={liveYield} timeLeft={timeLeft} />

        {isActive && (
          <>
            <div className="my-5 border-t border-[#EBEBEB]" />

            {/* Amount input */}
            <div className="mb-3">
              <Input
                label="Deposit amount"
                type="number"
                placeholder="100"
                prefix="$"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError("");
                }}
                error={amountError}
                hint={`Min $10 · Balance: ${pyusdBalance != null ? formatUSDDecimal(Number(pyusdBalance)) : "—"}`}
                min={10}
                step={1}
              />
            </div>

            <Button
              fullWidth
              isLoading={isDepositing}
              onClick={handleDepositClick}
              disabled={isDepositing}
            >
              {isDepositing ? "" : isAuthenticated ? "Deposit" : "Sign In to Deposit"}
            </Button>

            {/* Withdraw button — hide if already withdrawn */}
            {userDeposit && !userDeposit.isWithdrawn && (
              <div className="mt-4 pt-4 border-t border-[#EBEBEB]">
                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                  isLoading={isWithdrawing}
                  onClick={() => setShowWithdrawConfirm(true)}
                >
                  Withdraw Principal
                </Button>
              </div>
            )}
          </>
        )}

        {!isActive && raffle.winner && (
          <div className="mt-4 pt-4 border-t border-[#EBEBEB]">
            <div className="bg-[#E6F9E7] rounded-[8px] p-3 text-center mb-4">
              <p className="text-sm font-semibold text-[#008A05]">
                Winner: {raffle.winner.displayName}
              </p>
              <p className="text-xs text-[#717171] mt-1">Raffle completed</p>
            </div>

            {/* Claim buttons — show for authenticated users with a deposit */}
            {isAuthenticated && userDeposit && (
              <div className="space-y-3">
                {/* Claim Principal — available to depositors who haven't withdrawn */}
                {!principalClaimed && !userDeposit.isWithdrawn && userDeposit.principalAmount > 0 && (
                  <Button
                    variant="outline"
                    fullWidth
                    isLoading={isClaimingPrincipal}
                    onClick={async () => {
                      setIsClaimingPrincipal(true);
                      try {
                        await claimPrincipal(raffleIdNum);
                        setPrincipalClaimed(true);
                        showToast("Principal claimed successfully!", "success");
                        refetchBalance();
                        onWithdrawSuccess?.();
                      } catch (e) {
                        showToast("Failed to claim principal. It may have already been claimed.", "error");
                        console.error("Claim principal error:", e);
                      }
                      setIsClaimingPrincipal(false);
                    }}
                  >
                    {isClaimingPrincipal ? "" : `Claim Principal (${formatUSD(userDeposit.principalAmount)})`}
                  </Button>
                )}

                {/* Claim Prize — only for the winner */}
                {user?.profile.address === raffle.winner?.address && !prizeClaimed && (
                  <Button
                    fullWidth
                    isLoading={isClaimingPrize}
                    onClick={async () => {
                      setIsClaimingPrize(true);
                      try {
                        await claimPrize(raffleIdNum);
                        setPrizeClaimed(true);
                        showToast(`Prize of ${formatYieldTicker(raffle.totalYieldEarned)} claimed!`, "success");
                        refetchBalance();
                        onDepositSuccess?.(0);
                      } catch (e) {
                        showToast("Failed to claim prize. It may have already been claimed.", "error");
                        console.error("Claim prize error:", e);
                      }
                      setIsClaimingPrize(false);
                    }}
                  >
                    {isClaimingPrize ? "" : `Claim Yield Prize (${formatYieldTicker(raffle.totalYieldEarned)})`}
                  </Button>
                )}

                {/* Already claimed states */}
                {principalClaimed && (
                  <p className="text-xs text-[#008A05] text-center font-medium">✓ Principal claimed</p>
                )}
                {user?.profile.address === raffle.winner?.address && prizeClaimed && (
                  <p className="text-xs text-[#008A05] text-center font-medium">✓ Prize claimed</p>
                )}

                {/* Nothing to claim */}
                {(principalClaimed || userDeposit.isWithdrawn || userDeposit.principalAmount === 0) &&
                  (user?.profile.address !== raffle.winner?.address || prizeClaimed) && (
                  <p className="text-xs text-[#717171] text-center">All funds have been claimed or withdrawn.</p>
                )}
              </div>
            )}

            {/* Prompt non-depositors or signed-out users */}
            {!isAuthenticated && (
              <Button fullWidth onClick={openAuthModal}>
                Sign In to Check Claims
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Skill question modal */}
      <SkillQuestionModal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        onSuccess={handleSkillSuccess}
      />

      {/* Deposit confirm modal */}
      <Modal isOpen={showDepositConfirm} onClose={() => setShowDepositConfirm(false)} maxWidth="400px">
        <h2 className="text-xl font-bold text-[#222222] mb-2">Confirm Deposit</h2>
        <p className="text-sm text-[#717171] mb-6">
          Deposit <strong className="text-[#222222]">{amount ? formatUSDDecimal(parseFloat(amount)) : "$0.00"}</strong> into{" "}
          <strong className="text-[#222222]">{raffle.property.title}</strong>?
          Your principal is always withdrawable. The yield stays in the raffle pool to fund the prize.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setShowDepositConfirm(false)}>
            Cancel
          </Button>
          <Button fullWidth onClick={handleConfirmDeposit}>
            Confirm
          </Button>
        </div>
      </Modal>

      {/* Withdraw confirm modal */}
      <Modal isOpen={showWithdrawConfirm} onClose={() => setShowWithdrawConfirm(false)} maxWidth="400px">
        <h2 className="text-xl font-bold text-[#222222] mb-2">Withdraw Principal</h2>
        <p className="text-sm text-[#717171] mb-6">
          Withdraw your <strong className="text-[#222222]">{userDeposit ? formatUSD(userDeposit.principalAmount) : ""}</strong> principal?
          Your yield remains in the pool and continues to contribute to the prize. Your win chance will drop to 0%.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setShowWithdrawConfirm(false)}>
            Cancel
          </Button>
          <Button fullWidth onClick={handleConfirmWithdraw} isLoading={isWithdrawing}>
            {isWithdrawing ? "" : "Withdraw"}
          </Button>
        </div>
      </Modal>

      {showConfetti && <Confetti />}
    </>
  );
}

function RaffleStats({ raffle, percent, depositorCount, liveYield, timeLeft }: { raffle: Raffle; percent: number; depositorCount: number; liveYield: number; timeLeft: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatBox
        label="Depositors"
        value={depositorCount === 0 ? "Be first!" : depositorCount.toLocaleString()}
        highlight={depositorCount === 0}
      />
      <StatBox
        label="Time Left"
        value={raffle.status === "active" ? timeLeft : "Ended"}
        mono={raffle.status === "active"}
      />
      <StatBox
        label="Total Yield"
        value={formatYieldTicker(liveYield)}
        color="yield"
        mono
      />
      <StatBox
        label="% Funded"
        value={`${percent}%`}
        color={percent >= 100 ? "success" : "default"}
      />
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight = false,
  color = "default",
  mono = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: "default" | "yield" | "success";
  mono?: boolean;
}) {
  const valueColor = {
    default: "#222222",
    yield: "#00A67E",
    success: "#008A05",
  }[color];

  return (
    <div className="bg-[#F7F7F7] rounded-[8px] p-3">
      <p className="text-xs text-[#717171] mb-1">{label}</p>
      <p
        className={`text-base font-bold ${mono ? "font-mono tabular-nums" : ""}`}
        style={{ color: highlight ? "#FF385C" : valueColor, fontSize: mono ? "14px" : undefined }}
      >
        {value}
      </p>
    </div>
  );
}
