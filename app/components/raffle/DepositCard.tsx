"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Raffle, Deposit } from "@/types";
import { formatUSD, formatUSDDecimal, formatPercent, formatTimeLeft, calcPercent } from "@/lib/utils/format";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SkillQuestionModal from "./SkillQuestionModal";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Confetti from "./Confetti";
import { useDepositToRaffle, useWithdrawFromRaffle, usePYUSDBalance } from "@/lib/flow/hooks";

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
  const { data: pyusdBalance } = usePYUSDBalance(user?.profile.address ?? null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [hasPassedSkill, setHasPassedSkill] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const depositCooldown = useRef(false);

  // Real-time ticking yield: 500% APY on totalDeposited
  const APY_RATE = 5.0;
  const SECONDS_PER_YEAR = 31536000;
  const yieldPerSecond = raffle.totalDeposited > 0 ? (raffle.totalDeposited * APY_RATE) / SECONDS_PER_YEAR : 0;

  const [liveYield, setLiveYield] = useState(raffle.totalYieldEarned);

  useEffect(() => {
    setLiveYield(raffle.totalYieldEarned);
  }, [raffle.totalYieldEarned]);

  useEffect(() => {
    if (yieldPerSecond <= 0 || raffle.status !== "active") return;
    const interval = setInterval(() => {
      setLiveYield((prev) => prev + yieldPerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [yieldPerSecond, raffle.status]);

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
        <RaffleStats raffle={raffle} percent={percent} depositorCount={depositorCount} liveYield={liveYield} />
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
          <p className="text-sm text-[#717171] mt-2">
            {formatUSD(liveYield)} raised in yield ({percent}%)
          </p>
        </div>

        <RaffleStats raffle={raffle} percent={percent} depositorCount={depositorCount} liveYield={liveYield} />

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
          <div className="mt-4 pt-4 border-t border-[#EBEBEB] bg-[#E6F9E7] rounded-[8px] p-3 text-center">
            <p className="text-sm font-semibold text-[#008A05]">
              Winner: {raffle.winner.displayName}
            </p>
            <p className="text-xs text-[#717171] mt-1">Raffle completed</p>
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

function RaffleStats({ raffle, percent, depositorCount, liveYield }: { raffle: Raffle; percent: number; depositorCount: number; liveYield: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatBox
        label="Depositors"
        value={depositorCount === 0 ? "Be first!" : depositorCount.toLocaleString()}
        highlight={depositorCount === 0}
      />
      <StatBox
        label="Time Left"
        value={raffle.status === "active" ? formatTimeLeft(raffle.expiresAt) : "Ended"}
      />
      <StatBox
        label="Total Yield"
        value={formatUSDDecimal(liveYield)}
        color="yield"
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
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: "default" | "yield" | "success";
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
        className="text-base font-bold"
        style={{ color: highlight ? "#FF385C" : valueColor }}
      >
        {value}
      </p>
    </div>
  );
}
