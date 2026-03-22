"use client";

// NO top-level @onflow imports — all FCL usage is lazy to prevent SSR stalls.

import { useState, useEffect, useCallback } from "react";
import {
  MINT_PYUSD,
  CREATE_RAFFLE,
  DEPOSIT_TO_RAFFLE,
  WITHDRAW_FROM_RAFFLE,
  COMMIT_RAFFLE,
  REVEAL_WINNER,
  SIMULATE_YIELD,
  CLAIM_PRINCIPAL,
  CLAIM_PRIZE,
  GET_PYUSD_BALANCE,
  GET_RAFFLE,
  GET_ALL_RAFFLE_IDS,
  GET_DEPOSIT,
  GET_ALL_DEPOSITS,
  IS_RAFFLE_EXPIRED,
  IS_RAFFLE_COMMITTED,
  HARVEST_YIELD,
  GET_PENDING_YIELD,
} from "./cadence";

// ── Lazy FCL accessor ──────────────────────────────────────────────────────

async function getFcl() {
  return await import("@onflow/fcl");
}

// ── Lightweight client-only query hook ──────────────────────────────────────

function useClientQuery<T>(opts: {
  cadence: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: (arg: any, t: any) => any[];
  enabled?: boolean;
}) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const enabled = opts.enabled ?? true;
  const argsKey = JSON.stringify(opts.args?.toString());

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const fcl = await getFcl();
      const result = await fcl.query({
        cadence: opts.cadence,
        args: opts.args,
      });
      setData(result as T);
    } catch (err) {
      console.error("Query error:", err);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.cadence, argsKey, enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, refetch };
}

// ── Lightweight client-only mutate helper ───────────────────────────────────

function useClientMutate() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (opts: {
    cadence: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: (arg: any, t: any) => any[];
    limit?: number;
  }) => {
    setIsPending(true);
    try {
      const fcl = await getFcl();
      const txId = await fcl.mutate({
        cadence: opts.cadence,
        args: opts.args,
        limit: opts.limit ?? 1000,
      });
      await fcl.tx(txId).onceSealed();
      return txId;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutateAsync, isPending };
}

// ── Current user hook ───────────────────────────────────────────────────────

export function useFlowCurrentUser() {
  const [currentUser, setCurrentUser] = useState<{
    addr?: string | null;
    loggedIn?: boolean;
  } | null>(null);

  useEffect(() => {
    getFcl().then((fcl) => {
      fcl.currentUser.subscribe(setCurrentUser);
    });
  }, []);

  return currentUser;
}

// ── Query Hooks ─────────────────────────────────────────────────────────────

export function usePYUSDBalance(address: string | null) {
  return useClientQuery<string>({
    cadence: GET_PYUSD_BALANCE,
    args: (arg, t) => [arg(address ?? "", t.Address)],
    enabled: !!address,
  });
}

export function useRaffle(raffleId: number | null) {
  return useClientQuery({
    cadence: GET_RAFFLE,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    enabled: raffleId != null,
  });
}

export function useAllRaffleIds() {
  return useClientQuery<string[]>({ cadence: GET_ALL_RAFFLE_IDS });
}

export function useDeposit(raffleId: number | null, depositor: string | null) {
  return useClientQuery({
    cadence: GET_DEPOSIT,
    args: (arg, t) => [
      arg(String(raffleId ?? 0), t.UInt64),
      arg(depositor ?? "", t.Address),
    ],
    enabled: raffleId != null && !!depositor,
  });
}

export function useAllDeposits(raffleId: number | null) {
  return useClientQuery({
    cadence: GET_ALL_DEPOSITS,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    enabled: raffleId != null,
  });
}

export function useIsRaffleExpired(raffleId: number | null) {
  return useClientQuery<boolean>({
    cadence: IS_RAFFLE_EXPIRED,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    enabled: raffleId != null,
  });
}

export function useIsRaffleCommitted(raffleId: number | null) {
  return useClientQuery<boolean>({
    cadence: IS_RAFFLE_COMMITTED,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    enabled: raffleId != null,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useMintPYUSD() {
  const { mutateAsync, isPending } = useClientMutate();
  const mintPYUSD = async (amount: number) => {
    return await mutateAsync({
      cadence: MINT_PYUSD,
      args: (arg, t) => [arg(amount.toFixed(8), t.UFix64)],
    });
  };
  return { mintPYUSD, isPending };
}

export function useCreateRaffle() {
  const { mutateAsync, isPending } = useClientMutate();
  const createRaffle = async (title: string, description: string, targetValue: number) => {
    return await mutateAsync({
      cadence: CREATE_RAFFLE,
      args: (arg, t) => [
        arg(title, t.String),
        arg(description, t.String),
        arg(targetValue.toFixed(8), t.UFix64),
      ],
    });
  };
  return { createRaffle, isPending };
}

export function useDepositToRaffle() {
  const { mutateAsync, isPending } = useClientMutate();
  const depositToRaffle = async (raffleId: number, amount: number) => {
    return await mutateAsync({
      cadence: DEPOSIT_TO_RAFFLE,
      args: (arg, t) => [
        arg(String(raffleId), t.UInt64),
        arg(amount.toFixed(8), t.UFix64),
      ],
    });
  };
  return { depositToRaffle, isPending };
}

export function useWithdrawFromRaffle() {
  const { mutateAsync, isPending } = useClientMutate();
  const withdrawFromRaffle = async (raffleId: number) => {
    return await mutateAsync({
      cadence: WITHDRAW_FROM_RAFFLE,
      args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    });
  };
  return { withdrawFromRaffle, isPending };
}

export function useCommitRaffle() {
  const { mutateAsync, isPending } = useClientMutate();
  const commitRaffle = async (raffleId: number) => {
    return await mutateAsync({
      cadence: COMMIT_RAFFLE,
      args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    });
  };
  return { commitRaffle, isPending };
}

export function useRevealWinner() {
  const { mutateAsync, isPending } = useClientMutate();
  const revealWinner = async (raffleId: number) => {
    return await mutateAsync({
      cadence: REVEAL_WINNER,
      args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    });
  };
  return { revealWinner, isPending };
}

export function useClaimPrincipal() {
  const { mutateAsync, isPending } = useClientMutate();
  const claimPrincipal = async (raffleId: number) => {
    return await mutateAsync({
      cadence: CLAIM_PRINCIPAL,
      args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    });
  };
  return { claimPrincipal, isPending };
}

export function useClaimPrize() {
  const { mutateAsync, isPending } = useClientMutate();
  const claimPrize = async (raffleId: number) => {
    return await mutateAsync({
      cadence: CLAIM_PRIZE,
      args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    });
  };
  return { claimPrize, isPending };
}

export function useSimulateYield() {
  const { mutateAsync, isPending } = useClientMutate();
  const simulateYield = async (raffleId: number, yieldAmount: number) => {
    return await mutateAsync({
      cadence: SIMULATE_YIELD,
      args: (arg, t) => [
        arg(String(raffleId), t.UInt64),
        arg(yieldAmount.toFixed(8), t.UFix64),
      ],
    });
  };
  return { simulateYield, isPending };
}

export function useHarvestYield() {
  const { mutateAsync, isPending } = useClientMutate();
  const harvestYield = async (raffleId: number) => {
    return await mutateAsync({
      cadence: HARVEST_YIELD,
      args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    });
  };
  return { harvestYield, isPending };
}

export function usePendingYield(raffleId: number | null) {
  return useClientQuery<string>({
    cadence: GET_PENDING_YIELD,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    enabled: raffleId != null,
  });
}
