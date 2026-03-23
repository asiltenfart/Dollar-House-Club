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

const NETWORK = process.env.NEXT_PUBLIC_FLOW_NETWORK || "testnet";
const ACCESS_NODE =
  process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "https://rest-testnet.onflow.org";
const DISCOVERY_WALLET =
  process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET ||
  "https://fcl-discovery.onflow.org/testnet/authn";

// Contract addresses per network
const CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  emulator: {
    DummyPYUSD: "0xf8d6e0586b0a20c7",
    DollarHouseRaffle: "0xf8d6e0586b0a20c7",
    SimpleYieldSource: "0xf8d6e0586b0a20c7",
    Xorshift128plus: "0xf8d6e0586b0a20c7",
    RandomConsumer: "0xf8d6e0586b0a20c7",
    RaffleScheduler: "0xf8d6e0586b0a20c7",
    FungibleToken: "0xee82856bf20e2aa6",
    FungibleTokenMetadataViews: "0xee82856bf20e2aa6",
    MetadataViews: "0xf8d6e0586b0a20c7",
    ViewResolver: "0xf8d6e0586b0a20c7",
    Burner: "0xf8d6e0586b0a20c7",
    RandomBeaconHistory: "0xf8d6e0586b0a20c7",
    FlowToken: "0x0ae53cb6e3f42a79",
    FlowTransactionScheduler: "0xf8d6e0586b0a20c7",
  },
  testnet: {
    DummyPYUSD: "0x152be59c81feab79",
    DollarHouseRaffle: "0x152be59c81feab79",
    SimpleYieldSource: "0x152be59c81feab79",
    Xorshift128plus: "0x152be59c81feab79",
    RandomConsumer: "0x152be59c81feab79",
    RaffleScheduler: "0x152be59c81feab79",
    FungibleToken: "0x9a0766d93b6608b7",
    FungibleTokenMetadataViews: "0x9a0766d93b6608b7",
    MetadataViews: "0x631e88ae7f1d7c20",
    ViewResolver: "0x631e88ae7f1d7c20",
    Burner: "0x9a0766d93b6608b7",
    RandomBeaconHistory: "0x8c5303eaa26202d6",
    FlowToken: "0x7e60df042a9c0868",
    FlowTransactionScheduler: "0x8c5303eaa26202d6",
  },
};

let fclConfigured = false;

async function getFcl() {
  const fcl = await import("@onflow/fcl");
  if (!fclConfigured) {
    fclConfigured = true;
    const cfg: Record<string, string> = {
      "app.detail.title": "Dollar House Club",
      "app.detail.icon": "https://dollarhouseclub.com/favicon.ico",
      "flow.network": NETWORK,
      "accessNode.api": ACCESS_NODE,
      "discovery.wallet": DISCOVERY_WALLET,
    };
    const addrs = CONTRACT_ADDRESSES[NETWORK] ?? CONTRACT_ADDRESSES.testnet;
    for (const [name, addr] of Object.entries(addrs)) {
      cfg[`0x${name}`] = addr;
    }
    fcl.config(cfg);
  }
  return fcl;
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
