"use client";

import React, { useState } from "react";
import { useMintPYUSD, usePYUSDBalance } from "@/lib/flow/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Button from "./Button";
import { formatUSDDecimal } from "@/lib/utils/format";

export default function DemoFaucet() {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { mintPYUSD } = useMintPYUSD();
  const { data: balance, refetch } = usePYUSDBalance(user?.profile.address ?? null);
  const { showToast } = useToast();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsMinting(true);
    try {
      await mintPYUSD(1000);
      await refetch();
      showToast("1,000 demo PYUSD added to your wallet!", "success");
    } catch (e) {
      showToast("Failed to mint demo funds. Please try again.", "error");
      console.error("Mint error:", e);
    }
    setIsMinting(false);
  };

  return (
    <div className="flex items-center gap-3 bg-[#FFF0F3] rounded-[12px] px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#FF385C] mb-0.5">Demo Wallet</p>
        <p className="text-sm font-bold text-[#222222]">
          {balance != null ? formatUSDDecimal(Number(balance)) : "$0.00"}
          <span className="text-xs font-normal text-[#717171] ml-1">PYUSD</span>
        </p>
      </div>
      <Button
        size="sm"
        onClick={handleMint}
        isLoading={isMinting}
        disabled={isMinting}
      >
        {isMinting ? "" : "Get $1,000"}
      </Button>
    </div>
  );
}
