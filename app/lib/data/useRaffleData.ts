"use client";

import { useMemo, useState, useEffect } from "react";
import { useDataSource } from "./DataSourceContext";
import { chainRaffleToFrontend, type ChainRaffleData } from "./adapter";
import { MOCK_RAFFLES, getRaffle as getMockRaffle, getMockDepositsForRaffle } from "@/lib/api/mock";
import { GET_ALL_RAFFLES, GET_RAFFLE } from "@/lib/flow/cadence";
import type { Raffle, Deposit } from "@/types";

// ── Fetch all raffles (mock or on-chain) ────────────────────────────────────

export function useRaffles(): { raffles: Raffle[]; isLoading: boolean } {
  const { isMock, isHydrated } = useDataSource();
  const [chainRaffles, setChainRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  }, [isMock]);

  if (isMock) {
    return { raffles: MOCK_RAFFLES, isLoading: false };
  }

  return { raffles: chainRaffles, isLoading };
}

// ── Fetch single raffle by ID (mock or on-chain) ────────────────────────────

export function useRaffleById(id: string): { raffle: Raffle | null; isLoading: boolean } {
  const { isMock } = useDataSource();
  const [chainRaffle, setChainRaffle] = useState<Raffle | null>(null);
  const [isLoading, setIsLoading] = useState(!isMock);

  const raffleId = parseRaffleId(id);

  useEffect(() => {
    if (isMock || isNaN(raffleId)) return;

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
  }, [isMock, raffleId]);

  if (isMock) {
    return { raffle: getMockRaffle(id) ?? null, isLoading: false };
  }

  return { raffle: chainRaffle, isLoading };
}

// ── Fetch deposits for a raffle (mock or on-chain) ──────────────────────────

export function useRaffleDeposits(id: string): { deposits: Deposit[]; isLoading: boolean } {
  const { isMock } = useDataSource();

  if (isMock) {
    return { deposits: getMockDepositsForRaffle(id), isLoading: false };
  }

  // On-chain deposits are handled by DepositCard's own hooks
  return { deposits: [], isLoading: false };
}

// ── Get the numeric raffle ID for on-chain operations ───────────────────────

export function parseRaffleId(id: string): number {
  return parseInt(id.replace("raffle-", ""), 10) || parseInt(id, 10);
}
