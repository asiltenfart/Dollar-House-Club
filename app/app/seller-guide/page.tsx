import React from "react";
import Link from "next/link";

export default function SellerGuidePage() {
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
        Seller Guide
      </h1>
      <p className="text-sm text-[#717171] mb-10">
        Everything you need to know about listing your property on Dollar House Club.
      </p>

      <div className="flex flex-col gap-10 text-[#484848] text-[15px] leading-relaxed">
        {/* Overview */}
        <Section title="Why List on Dollar House Club?">
          <p>
            Dollar House Club gives property owners a new way to sell. Instead of waiting months for a
            traditional buyer, you list your property as a raffle. Thousands of participants deposit
            stablecoins, the yield funds your sale price, and one winner receives the deed. You get
            paid the full property value — participants get a shot at homeownership for a fraction of
            the cost.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <HighlightBox title="Full Value" description="Receive 100% of your target sale price upon successful transfer." />
            <HighlightBox title="Fast Timeline" description="Raffles run for 30 days — no months of showings, negotiations, or inspections." />
            <HighlightBox title="Global Reach" description="Your property is marketed to thousands of depositors worldwide." />
          </div>
        </Section>

        {/* Steps */}
        <Section title="How to List Your Property">
          <div className="flex flex-col gap-5">
            <Step number={1} title="Create Your Account">
              Sign up with your email. Connect a Flow-compatible wallet to receive your payout.
            </Step>
            <Step number={2} title="Submit Your Listing">
              Navigate to your profile and click &quot;List a Property.&quot; Fill out the property
              details: address, type, bedrooms, bathrooms, square footage, year built, and a detailed
              description. Upload high-quality photos (at least 3, recommended 6+).
            </Step>
            <Step number={3} title="Provide Proof of Ownership">
              Upload your property deed or title documentation. This is reviewed by our verification
              team before your listing goes live. We may request additional documents such as a recent
              appraisal, tax records, or HOA documentation.
            </Step>
            <Step number={4} title="Set Your Target Price">
              Enter the target sale price in USD. This is the amount you will receive if the raffle is
              fully funded. Pricing should reflect fair market value — our team may request an
              independent appraisal if the target seems inconsistent with comparable sales.
            </Step>
            <Step number={5} title="Review and Publish">
              Our team reviews your listing within 3–5 business days. Once approved, your raffle goes
              live and begins accepting deposits. You will receive an email notification when your
              listing is published.
            </Step>
            <Step number={6} title="Raffle Runs (30 Days)">
              Depositors contribute PYUSD to your raffle pool. You can monitor progress from your
              seller dashboard in real time — total deposited, yield generated, number of depositors,
              and time remaining.
            </Step>
            <Step number={7} title="Outcome and Payout">
              If the raffle is fully funded, a winner is selected. You coordinate the property
              transfer through our partner title company. You receive your payout in PYUSD upon
              confirmed transfer. If the raffle is not fully funded, all deposits are returned to
              participants and you may relist.
            </Step>
          </div>
        </Section>

        {/* Requirements */}
        <Section title="Listing Requirements">
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>You must be the legal owner of the property (or an authorized representative)</li>
            <li>The property must be free of liens, encumbrances, and active legal disputes</li>
            <li>Minimum 3 high-quality property photos (exterior + interior)</li>
            <li>Proof of ownership documentation (deed, title, or equivalent)</li>
            <li>Properties must be located in the United States (international coming soon)</li>
            <li>Target price must reflect fair market value</li>
          </ul>
        </Section>

        {/* Fees */}
        <Section title="Seller Fees">
          <div className="border border-[#EBEBEB] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-[#EBEBEB] bg-[#F7F7F7]">
              <div className="p-4 font-semibold text-[#222222] text-sm">Fee</div>
              <div className="p-4 font-semibold text-[#222222] text-sm">Amount</div>
            </div>
            <FeeRow label="Listing fee" value="Free" />
            <FeeRow label="Success fee (on funded raffle)" value="2.5% of target price" />
            <FeeRow label="Relisting (if unfunded)" value="Free" />
            <FeeRow label="Title & transfer coordination" value="Included" last />
          </div>
          <p className="text-sm text-[#717171] mt-3">
            The success fee is deducted from your payout upon confirmed property transfer. There are
            no upfront costs to list.
          </p>
        </Section>

        {/* FAQ */}
        <Section title="Frequently Asked Questions">
          <FAQ question="What happens if my raffle doesn't reach the target?">
            All deposits are returned to participants. You keep your property and may choose to relist
            at the same or adjusted price at no additional cost.
          </FAQ>
          <FAQ question="Can I cancel my listing after it goes live?">
            You may request cancellation within the first 48 hours if no deposits have been made.
            After deposits begin, the raffle must run its full course.
          </FAQ>
          <FAQ question="How long does the property transfer take?">
            Typically 30–90 days after winner confirmation, depending on your jurisdiction and title
            company processing times.
          </FAQ>
          <FAQ question="Do I need to vacate before listing?">
            No. You can remain in the property during the raffle period. A move-out timeline is agreed
            upon with the winner after the raffle concludes.
          </FAQ>
          <FAQ question="What types of properties are eligible?">
            Single-family homes, condos, townhouses, apartments, and vacant land. Commercial
            properties and multi-family units (5+ units) are not currently supported.
          </FAQ>
        </Section>

        {/* CTA */}
        <div className="bg-[#F7F7F7] rounded-2xl p-8 text-center">
          <h2 className="font-bold text-[#222222] text-xl mb-2">Ready to list your property?</h2>
          <p className="text-sm text-[#717171] mb-6">
            Create your account and submit your first listing in under 10 minutes.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center h-12 px-8 text-sm font-semibold rounded-[8px] bg-[#FF385C] text-white hover:bg-[#E0314F] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-bold text-[#222222] mb-4" style={{ fontSize: "20px" }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
        style={{ background: "#FF385C" }}
      >
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-[#222222] mb-1">{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}

function HighlightBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-[#EBEBEB] rounded-xl p-4 bg-white">
      <h3 className="font-semibold text-[#222222] text-sm mb-1">{title}</h3>
      <p className="text-xs text-[#717171] leading-relaxed">{description}</p>
    </div>
  );
}

function FeeRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`grid grid-cols-2 ${last ? "" : "border-b border-[#EBEBEB]"}`}>
      <div className="p-4 text-sm text-[#484848]">{label}</div>
      <div className="p-4 text-sm font-semibold text-[#222222]">{value}</div>
    </div>
  );
}

function FAQ({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#EBEBEB] pb-4">
      <h3 className="font-semibold text-[#222222] mb-2">{question}</h3>
      <p>{children}</p>
    </div>
  );
}
