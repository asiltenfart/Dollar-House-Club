"use client";

import { useFlowQuery, useFlowMutate, useFlowCurrentUser } from "@onflow/kit";
import * as fcl from "@onflow/fcl";
import {
  MINT_PYUSD,
  CREATE_RAFFLE,
  DEPOSIT_TO_RAFFLE,
  WITHDRAW_FROM_RAFFLE,
  COMMIT_RAFFLE,
  REVEAL_WINNER,
  SIMULATE_YIELD,
  GET_PYUSD_BALANCE,
  GET_RAFFLE,
  GET_ALL_RAFFLE_IDS,
  GET_DEPOSIT,
  GET_ALL_DEPOSITS,
  IS_RAFFLE_EXPIRED,
  IS_RAFFLE_COMMITTED,
} from "./cadence";

// ── Re-export auth hook ──────────────────────────────────────────────────────

export { useFlowCurrentUser } from "@onflow/kit";

// ── Query Hooks ──────────────────────────────────────────────────────────────

export function usePYUSDBalance(address: string | null) {
  return useFlowQuery({
    cadence: GET_PYUSD_BALANCE,
    args: (arg, t) => [arg(address ?? "", t.Address)],
    query: {
      enabled: !!address,
      staleTime: 5000,
    },
  });
}

export function useRaffle(raffleId: number | null) {
  return useFlowQuery({
    cadence: GET_RAFFLE,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    query: {
      enabled: raffleId != null,
      staleTime: 5000,
    },
  });
}

export function useAllRaffleIds() {
  return useFlowQuery({
    cadence: GET_ALL_RAFFLE_IDS,
    query: { staleTime: 5000 },
  });
}

export function useDeposit(raffleId: number | null, depositor: string | null) {
  return useFlowQuery({
    cadence: GET_DEPOSIT,
    args: (arg, t) => [
      arg(String(raffleId ?? 0), t.UInt64),
      arg(depositor ?? "", t.Address),
    ],
    query: {
      enabled: raffleId != null && !!depositor,
      staleTime: 5000,
    },
  });
}

export function useAllDeposits(raffleId: number | null) {
  return useFlowQuery({
    cadence: GET_ALL_DEPOSITS,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    query: {
      enabled: raffleId != null,
      staleTime: 5000,
    },
  });
}

export function useIsRaffleExpired(raffleId: number | null) {
  return useFlowQuery({
    cadence: IS_RAFFLE_EXPIRED,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    query: {
      enabled: raffleId != null,
      staleTime: 10000,
    },
  });
}

export function useIsRaffleCommitted(raffleId: number | null) {
  return useFlowQuery({
    cadence: IS_RAFFLE_COMMITTED,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    query: {
      enabled: raffleId != null,
      staleTime: 5000,
    },
  });
}

// ── Mutation Hooks ───────────────────────────────────────────────────────────

export function useMintPYUSD() {
  const { mutateAsync, ...rest } = useFlowMutate();

  const mintPYUSD = async (amount: number) => {
    const txId = await mutateAsync({
      cadence: MINT_PYUSD,
      args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
        arg(amount.toFixed(8), t.UFix64),
      ],
      limit: 1000,
    });
    await fcl.tx(txId).onceSealed();
    return txId;
  };

  return { mintPYUSD, ...rest };
}

export function useCreateRaffle() {
  const { mutateAsync, ...rest } = useFlowMutate();

  const createRaffle = async (
    title: string,
    description: string,
    targetValue: number
  ) => {
    const txId = await mutateAsync({
      cadence: CREATE_RAFFLE,
      args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
        arg(title, t.String),
        arg(description, t.String),
        arg(targetValue.toFixed(8), t.UFix64),
      ],
      limit: 1000,
    });
    await fcl.tx(txId).onceSealed();
    return txId;
  };

  return { createRaffle, ...rest };
}

export function useDepositToRaffle() {
  const { mutateAsync, ...rest } = useFlowMutate();

  const depositToRaffle = async (raffleId: number, amount: number) => {
    const txId = await mutateAsync({
      cadence: DEPOSIT_TO_RAFFLE,
      args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
        arg(String(raffleId), t.UInt64),
        arg(amount.toFixed(8), t.UFix64),
      ],
      limit: 1000,
    });
    await fcl.tx(txId).onceSealed();
    return txId;
  };

  return { depositToRaffle, ...rest };
}

export function useWithdrawFromRaffle() {
  const { mutateAsync, ...rest } = useFlowMutate();

  const withdrawFromRaffle = async (raffleId: number) => {
    const txId = await mutateAsync({
      cadence: WITHDRAW_FROM_RAFFLE,
      args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
        arg(String(raffleId), t.UInt64),
      ],
      limit: 1000,
    });
    await fcl.tx(txId).onceSealed();
    return txId;
  };

  return { withdrawFromRaffle, ...rest };
}

export function useCommitRaffle() {
  const { mutateAsync, ...rest } = useFlowMutate();

  const commitRaffle = async (raffleId: number) => {
    const txId = await mutateAsync({
      cadence: COMMIT_RAFFLE,
      args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
        arg(String(raffleId), t.UInt64),
      ],
      limit: 1000,
    });
    await fcl.tx(txId).onceSealed();
    return txId;
  };

  return { commitRaffle, ...rest };
}

export function useRevealWinner() {
  const { mutateAsync, ...rest } = useFlowMutate();

  const revealWinner = async (raffleId: number) => {
    const txId = await mutateAsync({
      cadence: REVEAL_WINNER,
      args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
        arg(String(raffleId), t.UInt64),
      ],
      limit: 1000,
    });
    await fcl.tx(txId).onceSealed();
    return txId;
  };

  return { revealWinner, ...rest };
}

export function useSimulateYield() {
  const { mutateAsync, ...rest } = useFlowMutate();

  const simulateYield = async (raffleId: number, yieldAmount: number) => {
    const txId = await mutateAsync({
      cadence: SIMULATE_YIELD,
      args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
        arg(String(raffleId), t.UInt64),
        arg(yieldAmount.toFixed(8), t.UFix64),
      ],
      limit: 1000,
    });
    await fcl.tx(txId).onceSealed();
    return txId;
  };

  return { simulateYield, ...rest };
}
