import React from "react";
import { getCompletedRaffles } from "@/lib/api/mock";
import RaffleCard from "@/components/raffle/RaffleCard";

export default function WinnersPage() {
  const completed = getCompletedRaffles();

  return (
    <div style={{ padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="mb-8">
          <h1
            className="font-bold text-[#222222] mb-2"
            style={{ fontSize: "32px", letterSpacing: "-0.01em" }}
          >
            Raffle winners
          </h1>
          <p className="text-sm text-[#717171]">
            Browse completed raffles and their lucky winners.
          </p>
        </div>

        {completed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-6">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="14" r="8" stroke="#DDDDDD" strokeWidth="2" />
                <path d="M10 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#DDDDDD" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#222222] mb-2">No completed raffles yet</h3>
            <p className="text-sm text-[#717171]">Check back soon — the first winners will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
