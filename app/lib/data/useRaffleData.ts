"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useDataSource } from "./DataSourceContext";
import { chainRaffleToFrontend, type ChainRaffleData } from "./adapter";
import { MOCK_RAFFLES, getRaffle as getMockRaffle, getMockDepositsForRaffle } from "@/lib/api/mock";
import { GET_ALL_RAFFLES, GET_RAFFLE, GET_DEPOSIT, GET_PENDING_YIELD } from "@/lib/flow/cadence";
import type { Raffle, Deposit } from "@/types";

// ── Fetch all raffles (mock or on-chain) ────────────────────────────────────

export function useRaffles(): { raffles: Raffle[]; isLoading: boolean; refetch: () => void } {
  const { isMock, isHydrated } = useDataSource();
  const [chainRaffles, setChainRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isHydrated || isMock) return;

    let cancelled = false;
    setIsLoading(true);

    import("@onflow/fcl").then(async (fcl) => {
      try {
        const data = await fcl.query({ cadence: GET_ALL_RAFFLES });
        if (!cancelled && Array.isArray(data)) {
          setChainRaffles((data as ChainRaffleData[]).map(chainRaffleToFrontend));
        }
      } catch (err) {
        console.error("Failed to fetch on-chain raffles:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [isMock, isHydrated, fetchKey]);

  if (!isHydrated) {
    return { raffles: [], isLoading: true, refetch };
  }

  if (isMock) {
    return { raffles: MOCK_RAFFLES, isLoading: false, refetch };
  }

  return { raffles: chainRaffles, isLoading, refetch };
}

// ── Fetch single raffle by ID (mock or on-chain) ────────────────────────────

export function useRaffleById(id: string): { raffle: Raffle | null; isLoading: boolean; refetch: () => void } {
  const { isMock, isHydrated } = useDataSource();
  const [chainRaffle, setChainRaffle] = useState<Raffle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  const raffleId = parseRaffleId(id);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (isMock || isNaN(raffleId)) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    import("@onflow/fcl").then(async (fcl) => {
      try {
        const data = await fcl.query({
          cadence: GET_RAFFLE,
          args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
            arg(String(raffleId), t.UInt64),
          ],
        });
        if (!cancelled && data) {
          setChainRaffle(chainRaffleToFrontend(data as ChainRaffleData));
        }
      } catch (err) {
        console.error("Failed to fetch on-chain raffle:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [isMock, isHydrated, raffleId, fetchKey]);

  if (!isHydrated) {
    return { raffle: null, isLoading: true, refetch };
  }

  if (isMock) {
    return { raffle: getMockRaffle(id) ?? null, isLoading: false, refetch };
  }

  return { raffle: chainRaffle, isLoading, refetch };
}

// ── Fetch deposits for a raffle (mock or on-chain) ──────────────────────────

export function useRaffleDeposits(id: string, currentUser?: { profile: { address: string; displayName: string } } | null): { deposits: Deposit[]; isLoading: boolean } {
  const { isMock } = useDataSource();

  if (isMock) {
    // Pass current user profile so mock data includes them as a depositor
    const userProfile = currentUser ? {
      address: currentUser.profile.address,
      displayName: currentUser.profile.displayName,
      avatarUrl: null,
      email: "",
      rafflesEntered: 0,
      rafflesWon: 0,
      rafflesListed: 0,
      rafflesCompleted: 0,
      joinedAt: new Date().toISOString(),
    } : null;
    return { deposits: getMockDepositsForRaffle(id, userProfile), isLoading: false };
  }

  // On-chain deposits are handled by DepositCard's own hooks
  return { deposits: [], isLoading: false };
}

// ── Fetch current user's on-chain deposit for a raffle ──────────────────────

export function useOnChainUserDeposit(
  raffleId: string,
  userAddress: string | null
): { userDeposit: Deposit | null; isLoading: boolean; refetch: () => void } {
  const { isMock, isHydrated } = useDataSource();
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const numericId = parseRaffleId(raffleId);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isHydrated || isMock || !userAddress || isNaN(numericId)) return;

    let cancelled = false;
    setIsLoading(true);

    import("@onflow/fcl").then(async (fcl) => {
      try {
        // Fetch deposit and raffle in parallel
        const [depositResult, raffleResult] = await Promise.all([
          fcl.query({
            cadence: GET_DEPOSIT,
            args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
              arg(String(numericId), t.UInt64),
              arg(userAddress, t.Address),
            ],
          }),
          fcl.query({
            cadence: GET_RAFFLE,
            args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
              arg(String(numericId), t.UInt64),
            ],
          }),
        ]);

        if (!cancelled && depositResult) {
          const userAmount = parseFloat(depositResult.amount);
          const userYieldWeight = parseFloat(depositResult.yieldWeight ?? "0");
          const totalYieldWeight = raffleResult ? parseFloat(raffleResult.totalYieldWeight ?? "0") : 0;
          const winChance = totalYieldWeight > 0 ? (userYieldWeight / totalYieldWeight) * 100 : 0;

          setDeposit({
            id: `dep-${raffleId}-${userAddress}`,
            raffleId,
            user: {
              address: depositResult.depositor ?? userAddress,
              displayName: userAddress,
              avatarUrl: null,
              email: "",
              rafflesEntered: 0,
              rafflesWon: 0,
              rafflesListed: 0,
              rafflesCompleted: 0,
              joinedAt: "",
            },
            principalAmount: userAmount,
            yieldGenerated: 0,
            winChance,
            depositedAt: new Date(parseFloat(depositResult.depositedAt) * 1000).toISOString(),
            isWithdrawn: false,
          });
        } else if (!cancelled) {
          setDeposit(null);
        }
      } catch {
        if (!cancelled) setDeposit(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [isMock, isHydrated, numericId, userAddress, raffleId, fetchKey]);

  return { userDeposit: deposit, isLoading, refetch };
}

// ── Get raffle IDs where the current user has deposited ─────────────────────

export function useUserDepositedRaffleIds(
  raffles: Raffle[],
  userAddress: string | null
): Set<string> {
  const { isMock } = useDataSource();

  return useMemo(() => {
    if (!userAddress || !isMock) return new Set<string>();

    const mockUser = {
      address: userAddress,
      displayName: "",
      avatarUrl: null,
      email: "",
      rafflesEntered: 0,
      rafflesWon: 0,
      rafflesListed: 0,
      rafflesCompleted: 0,
      joinedAt: new Date().toISOString(),
    };

    const ids = new Set<string>();
    for (const raffle of raffles) {
      const deposits = getMockDepositsForRaffle(raffle.id, mockUser);
      if (deposits.some((d) => d.user.address === userAddress)) {
        ids.add(raffle.id);
      }
    }
    return ids;
  }, [raffles, userAddress, isMock]);
}

// ── Get the numeric raffle ID for on-chain operations ───────────────────────

export function parseRaffleId(id: string): number {
  return parseInt(id.replace("raffle-", ""), 10) || parseInt(id, 10);
}
