"use client";

import React, { useState, useMemo } from "react";
import { useRaffles, useUserDepositedRaffleIds } from "@/lib/data/useRaffleData";
import { useAuth } from "@/lib/auth/AuthContext";
import RaffleCard from "@/components/raffle/RaffleCard";
import { RaffleCardSkeleton } from "@/components/ui/Skeleton";
import type { ExploreFilters } from "@/types";

const PER_PAGE = 12;

export default function ExplorePage() {
  const [filters, setFilters] = useState<ExploreFilters>({
    status: "all",
    sortBy: "newest",
    search: "",
    page: 1,
    perPage: 12,
  });
  const { raffles, isLoading: loading } = useRaffles();
  const { user } = useAuth();
  const depositedIds = useUserDepositedRaffleIds(raffles, user?.profile.address ?? null);

  const filtered = useMemo(() => {
    let result = [...raffles];

    if (filters.status === "active") {
      result = result.filter((r) => r.status === "active");
    } else if (filters.status === "completed") {
      result = result.filter((r) => r.status !== "active");
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.property.title.toLowerCase().includes(q) ||
          r.property.location.city.toLowerCase().includes(q) ||
          r.property.location.stateProvince.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sortBy === "ending_soon") {
      result.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
    } else if (filters.sortBy === "most_funded") {
      result.sort((a, b) => (b.totalYieldEarned / b.targetValueUSD) - (a.totalYieldEarned / a.targetValueUSD));
    } else if (filters.sortBy === "highest_value") {
      result.sort((a, b) => b.targetValueUSD - a.targetValueUSD);
    }

    return result;
  }, [filters, raffles]);

  const paged = filtered.slice(0, filters.page * PER_PAGE);
  const hasMore = paged.length < filtered.length;

  const updateFilter = <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ padding: "32px 24px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1
            className="font-bold text-[#222222] mb-1"
            style={{ fontSize: "32px", letterSpacing: "-0.01em" }}
          >
            Browse property raffles
          </h1>
          <p className="text-sm text-[#717171]">
            {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "raffle" : "raffles"} available`}
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div
        className="sticky bg-white border-b border-[#EBEBEB] z-40"
        style={{ top: "64px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
      >
        <div
          className="flex items-center gap-3 overflow-x-auto"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "56px" }}
        >
          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value as ExploreFilters["sortBy"])}
            className="h-9 px-3 pr-8 text-sm text-[#222222] border border-[#DDDDDD] rounded-[8px] bg-white cursor-pointer outline-none focus:border-[#222222] appearance-none shrink-0"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%23717171' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="newest">Newest first</option>
            <option value="ending_soon">Ending soon</option>
            <option value="most_funded">Most funded</option>
            <option value="highest_value">Highest value</option>
          </select>

          {/* Status filter */}
          <div className="flex items-center gap-1 shrink-0">
            {(["all", "active", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => updateFilter("status", s)}
                className="h-9 px-3 text-sm font-medium rounded-[8px] transition-all duration-150 whitespace-nowrap capitalize"
                style={{
                  background: filters.status === s ? "#222222" : "transparent",
                  color: filters.status === s ? "white" : "#717171",
                  border: filters.status === s ? "none" : "1px solid #DDDDDD",
                }}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717171]"
            >
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search city, state..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-9 pl-9 pr-3 text-sm border border-[#DDDDDD] rounded-[8px] outline-none focus:border-[#222222] w-52"
            />
          </div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RaffleCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={filters.search} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} isDeposited={depositedIds.has(raffle.id)} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="h-12 px-8 text-sm font-semibold border border-[#DDDDDD] rounded-[8px] text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-6">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M18 4L31 15V32H24V22H12V32H5V15L18 4Z" fill="#EBEBEB" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[#222222] mb-2">
        {search ? `No results for "${search}"` : "No active raffles yet"}
      </h3>
      <p className="text-sm text-[#717171] max-w-xs mb-6">
        {search
          ? "Try a different search term or browse all raffles."
          : "Be the first to list your property and start a raffle."}
      </p>
    </div>
  );
}
