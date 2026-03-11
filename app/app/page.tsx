import React from "react";
import Link from "next/link";
import { getActiveRaffles, getFeaturedRaffles, getPlatformStats } from "@/lib/api/mock";
import RaffleCard from "@/components/raffle/RaffleCard";
import HeroSection from "@/components/layout/HeroSection";
import { formatUSD } from "@/lib/utils/format";

export default function HomePage() {
  const activeRaffles = getActiveRaffles();
  const featured = getFeaturedRaffles();
  const stats = getPlatformStats();

  return (
    <div>
      {/* HERO */}
      <HeroSection raffles={activeRaffles} />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#F7F7F7]" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            className="text-center font-bold text-[#222222] mb-12"
            style={{ fontSize: "32px", letterSpacing: "-0.01em" }}
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HowItWorksStep
              number={1}
              title="Deposit stablecoins"
              description="Choose any active property raffle and deposit USDC. Your principal is safe and fully withdrawable at any time, no questions asked."
              icon={
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke="#FF385C" strokeWidth="1.5" />
                  <path d="M10 14h8M14 10v8" stroke="#FF385C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
            <HowItWorksStep
              number={2}
              title="Yield funds the prize"
              description="Your USDC earns yield through lending protocols. All yield from all depositors goes into the raffle prize pool over 30 days."
              icon={
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="9" width="20" height="4" rx="2" stroke="#FF385C" strokeWidth="1.5" />
                  <rect x="4" y="9" width="13" height="4" rx="2" fill="#FF385C" />
                  <path d="M7 17h14M7 21h10" stroke="#FF385C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
            <HowItWorksStep
              number={3}
              title="Winner gets the property"
              description="After 30 days, a winner is selected proportional to their yield contribution. If the target is met — they win the property deed."
              icon={
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4L24 13V24H18V17H10V24H4V13L14 4Z" stroke="#FF385C" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* FEATURED RAFFLES */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2
                className="font-bold text-[#222222]"
                style={{ fontSize: "32px", letterSpacing: "-0.01em" }}
              >
                Featured raffles
              </h2>
              <p className="text-[#717171] mt-1 text-sm">Active property raffles accepting deposits now</p>
            </div>
            <Link href="/explore" className="text-sm font-semibold text-[#FF385C] hover:underline">
              View all raffles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-[#222222]" style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <TrustStat value={formatUSD(stats.totalDeposited)} label="Total deposited" />
            <TrustStat value={String(stats.completed)} label="Raffles completed" />
            <TrustStat value={String(stats.winners)} label="Life-changing wins" />
          </div>
        </div>
      </section>
    </div>
  );
}

function HowItWorksStep({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#EBEBEB] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs font-bold text-[#717171] uppercase tracking-widest">Step {number}</span>
      </div>
      <h3 className="text-lg font-bold text-[#222222]">{title}</h3>
      <p className="text-sm text-[#717171] leading-relaxed">{description}</p>
    </div>
  );
}

function TrustStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="font-extrabold text-white"
        style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em" }}
      >
        {value}
      </span>
      <span className="text-xs text-white/60 uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}
