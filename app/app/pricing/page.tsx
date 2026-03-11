import React from "react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "64px 24px 80px" }}>
      <Link
        href="/"
        className="text-sm text-[#FF385C] hover:underline inline-flex items-center gap-1 mb-8"
      >
        ← Back to home
      </Link>

      <h1
        className="font-bold text-[#222222] mb-2"
        style={{ fontSize: "36px", letterSpacing: "-0.02em" }}
      >
        Pricing
      </h1>
      <p className="text-sm text-[#717171] mb-10">
        Transparent, simple pricing. No hidden fees.
      </p>

      <div className="flex flex-col gap-10 text-[#484848] text-[15px] leading-relaxed">
        {/* For Depositors */}
        <div>
          <h2 className="font-bold text-[#222222] mb-4" style={{ fontSize: "20px" }}>
            For Depositors (Raffle Participants)
          </h2>
          <div className="border border-[#05CE78] rounded-2xl overflow-hidden bg-[#F0FFF7]">
            <div className="p-6 text-center">
              <p
                className="font-extrabold text-[#05CE78]"
                style={{ fontSize: "48px", letterSpacing: "-0.03em" }}
              >
                Free
              </p>
              <p className="text-sm text-[#717171] mt-2">No fees to deposit or withdraw</p>
            </div>
            <div className="border-t border-[#05CE78]/20 p-6">
              <ul className="flex flex-col gap-3">
                <PricingItem included>Deposit any amount of USDC</PricingItem>
                <PricingItem included>Withdraw your full principal at any time</PricingItem>
                <PricingItem included>Yield is automatically allocated to the prize pool</PricingItem>
                <PricingItem included>Skill-question entry at no cost</PricingItem>
                <PricingItem>Blockchain gas fees apply (typically &lt; $0.01 on Flow)</PricingItem>
              </ul>
            </div>
          </div>
          <p className="text-sm text-[#717171] mt-3">
            Dollar House Club never takes a cut of your deposit or yield as a participant. Your
            principal is always 100% yours.
          </p>
        </div>

        {/* For Sellers */}
        <div>
          <h2 className="font-bold text-[#222222] mb-4" style={{ fontSize: "20px" }}>
            For Sellers (Property Listers)
          </h2>
          <div className="border border-[#EBEBEB] rounded-2xl overflow-hidden">
            <div className="p-6 text-center bg-[#F7F7F7]">
              <p
                className="font-extrabold text-[#222222]"
                style={{ fontSize: "48px", letterSpacing: "-0.03em" }}
              >
                2.5%
              </p>
              <p className="text-sm text-[#717171] mt-2">Success fee on funded raffles only</p>
            </div>
            <div className="border-t border-[#EBEBEB] p-6">
              <ul className="flex flex-col gap-3">
                <PricingItem included>Free to list your property</PricingItem>
                <PricingItem included>Free relisting if raffle is unfunded</PricingItem>
                <PricingItem included>Title company coordination included</PricingItem>
                <PricingItem included>Property verification and review</PricingItem>
                <PricingItem included>Seller dashboard with real-time analytics</PricingItem>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div>
          <h2 className="font-bold text-[#222222] mb-4" style={{ fontSize: "20px" }}>
            Compared to Traditional Selling
          </h2>
          <div className="border border-[#EBEBEB] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 border-b border-[#EBEBEB] bg-[#F7F7F7]">
              <div className="p-4 text-sm font-semibold text-[#222222]">Fee Type</div>
              <div className="p-4 text-sm font-semibold text-[#222222] text-center">Traditional</div>
              <div className="p-4 text-sm font-semibold text-[#FF385C] text-center">Dollar House Club</div>
            </div>
            <CompRow label="Agent commission" traditional="5–6%" dhc="0%" />
            <CompRow label="Listing fee" traditional="$500–$2,000" dhc="Free" />
            <CompRow label="Success fee" traditional="—" dhc="2.5%" />
            <CompRow label="Closing costs (seller)" traditional="1–3%" dhc="Included" />
            <CompRow label="Average time to sell" traditional="60–120 days" dhc="30 days" last />
          </div>
        </div>

        {/* Platform Fee */}
        <div>
          <h2 className="font-bold text-[#222222] mb-4" style={{ fontSize: "20px" }}>
            Platform Yield Fee
          </h2>
          <p>
            Dollar House Club retains 5% of the total yield generated per raffle to cover protocol
            operating costs, smart contract maintenance, insurance reserves, and ongoing development.
            This fee is taken from the yield pool — it does not affect participant deposits or the
            seller&apos;s target payout.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-[#F7F7F7] rounded-2xl p-8 text-center">
          <h2 className="font-bold text-[#222222] text-xl mb-2">No risk for participants</h2>
          <p className="text-sm text-[#717171] mb-6 max-w-md mx-auto">
            Deposit USDC, let the yield work, and keep your full principal. The only thing you
            &quot;spend&quot; is the yield — and that goes to fund someone&apos;s dream home.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center h-12 px-8 text-sm font-semibold rounded-[8px] bg-[#FF385C] text-white hover:bg-[#E0314F] transition-colors"
          >
            Browse Raffles
          </Link>
        </div>
      </div>
    </div>
  );
}

function PricingItem({ children, included }: { children: React.ReactNode; included?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {included ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="flex-shrink-0 mt-0.5"
        >
          <circle cx="9" cy="9" r="9" fill="#05CE78" />
          <path d="M5.5 9.5l2 2L12.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="flex-shrink-0 mt-0.5"
        >
          <circle cx="9" cy="9" r="9" fill="#F0F0F0" />
          <path d="M6 9h6" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      <span className={included ? "text-[#222222]" : "text-[#717171]"}>{children}</span>
    </li>
  );
}

function CompRow({
  label,
  traditional,
  dhc,
  last,
}: {
  label: string;
  traditional: string;
  dhc: string;
  last?: boolean;
}) {
  return (
    <div className={`grid grid-cols-3 ${last ? "" : "border-b border-[#EBEBEB]"}`}>
      <div className="p-4 text-sm text-[#484848]">{label}</div>
      <div className="p-4 text-sm text-[#717171] text-center">{traditional}</div>
      <div className="p-4 text-sm font-semibold text-[#FF385C] text-center">{dhc}</div>
    </div>
  );
}
