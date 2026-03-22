"use client";

import { useEffect, useState, useMemo } from "react";
import { useFlowQuery } from "@onflow/kit";
import { useDataSource } from "./DataSourceContext";
import { chainRaffleToFrontend, type ChainRaffleData } from "./adapter";
import { MOCK_RAFFLES, getRaffle as getMockRaffle, getMockDepositsForRaffle } from "@/lib/api/mock";
import { GET_ALL_RAFFLE_IDS, GET_RAFFLE } from "@/lib/flow/cadence";
import type { Raffle, Deposit } from "@/types";

// ── Fetch all raffles (mock or on-chain) ────────────────────────────────────

export function useRaffles(): { raffles: Raffle[]; isLoading: boolean } {
  const { isMock } = useDataSource();

  // On-chain: get all raffle IDs
  const { data: raffleIds, isLoading: idsLoading } = useFlowQuery({
    cadence: GET_ALL_RAFFLE_IDS,
    query: { enabled: !isMock, staleTime: 5000 },
  });

  // On-chain: fetch each raffle's data
  const [chainRaffles, setChainRaffles] = useState<Raffle[]>([]);
  const [chainLoading, setChainLoading] = useState(false);

  useEffect(() => {
    if (isMock || !raffleIds || !Array.isArray(raffleIds)) {
      setChainRaffles([]);
      return;
    }

    let cancelled = false;
    setChainLoading(true);

    // We need to fetch each raffle individually since useFlowQuery can't
    // be called in a loop. Use fcl.query directly.
    import("@onflow/fcl").then(async (fcl) => {
      try {
        const results: Raffle[] = [];
        for (const id of raffleIds as string[]) {
          const data = await fcl.query({
            cadence: GET_RAFFLE,
            args: (arg: typeof fcl.arg, t: typeof fcl.t) => [
              arg(String(id), t.UInt64),
            ],
          });
          if (data && !cancelled) {
            results.push(chainRaffleToFrontend(data as ChainRaffleData));
          }
        }
        if (!cancelled) {
          setChainRaffles(results);
        }
      } catch (err) {
        console.error("Failed to fetch on-chain raffles:", err);
      } finally {
        if (!cancelled) setChainLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [isMock, raffleIds]);

  if (isMock) {
    return { raffles: MOCK_RAFFLES, isLoading: false };
  }

  return {
    raffles: chainRaffles,
    isLoading: idsLoading || chainLoading,
  };
}

// ── Fetch single raffle by ID (mock or on-chain) ────────────────────────────

export function useRaffleById(id: string): { raffle: Raffle | null; isLoading: boolean } {
  const { isMock } = useDataSource();

  // On-chain query
  const raffleId = parseInt(id.replace("raffle-", ""), 10) || parseInt(id, 10);
  const { data, isLoading } = useFlowQuery({
    cadence: GET_RAFFLE,
    args: (arg, t) => [arg(String(raffleId), t.UInt64)],
    query: { enabled: !isMock && !isNaN(raffleId), staleTime: 5000 },
  });

  if (isMock) {
    return { raffle: getMockRaffle(id) ?? null, isLoading: false };
  }

  const raffle = data ? chainRaffleToFrontend(data as ChainRaffleData) : null;
  return { raffle, isLoading };
}

// ── Fetch deposits for a raffle (mock or on-chain) ──────────────────────────

export function useRaffleDeposits(id: string): { deposits: Deposit[]; isLoading: boolean } {
  const { isMock } = useDataSource();

  if (isMock) {
    return { deposits: getMockDepositsForRaffle(id), isLoading: false };
  }

  // On-chain deposits are handled separately by the DepositCard
  // which already uses useDeposit/useAllDeposits hooks directly.
  return { deposits: [], isLoading: false };
}

// ── Get the numeric raffle ID for on-chain operations ───────────────────────

export function parseRaffleId(id: string): number {
  return parseInt(id.replace("raffle-", ""), 10) || parseInt(id, 10);
}
