import React from "react";
import Link from "next/link";

export default function SkillBasedRulesPage() {
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
        Skill-Based Rules
      </h1>
      <p className="text-sm text-[#717171] mb-10">
        Last updated: January 15, 2026
      </p>

      <div className="flex flex-col gap-8 text-[#484848] text-[15px] leading-relaxed">
        <Section title="Why Skill-Based Entry?">
          <p>
            Dollar House Club operates as a skill-based contest platform, not a lottery or game of
            chance. To comply with federal and state regulations, every raffle participant must
            demonstrate knowledge or skill by correctly answering a question before being eligible for
            a drawing. This distinguishes our platform from illegal lotteries and gambling operations.
          </p>
        </Section>

        <Section title="How It Works">
          <div className="flex flex-col gap-4">
            <RuleStep number={1} title="Deposit USDC">
              Deposit any amount of USDC into an active property raffle pool. Your deposit generates
              yield, and your share of the yield determines your proportional weight in the drawing.
            </RuleStep>
            <RuleStep number={2} title="Answer the Skill Question">
              Before the raffle drawing, you must correctly answer a skill-based question. Questions
              cover general knowledge categories including mathematics, geography, and current events.
              Each question has one verifiably correct answer.
            </RuleStep>
            <RuleStep number={3} title="Qualify for the Drawing">
              Only participants who answer correctly are included in the weighted random drawing. If
              you answer incorrectly, you may re-attempt with a different question during the next
              available window. Your deposit remains safe regardless of your answer.
            </RuleStep>
            <RuleStep number={4} title="Winner Selection">
              A verifiable random function (VRF) selects the winner from the qualified pool, weighted
              by each participant&apos;s proportional yield contribution. The randomness is
              cryptographically provable and auditable on-chain.
            </RuleStep>
          </div>
        </Section>

        <Section title="Question Categories">
          <p>Skill questions are drawn from the following categories:</p>
          <ul className="list-disc pl-6 mt-2 flex flex-col gap-1">
            <li>
              <strong>Mathematics</strong> — arithmetic, percentages, basic algebra
            </li>
            <li>
              <strong>Geography</strong> — countries, capitals, landmarks, US states
            </li>
            <li>
              <strong>General Knowledge</strong> — science, history, civics, current events
            </li>
          </ul>
          <p className="mt-2">
            Questions are designed to be answerable by a reasonably informed adult. They are not trick
            questions. The difficulty level is calibrated to ensure genuine skill assessment while
            remaining accessible.
          </p>
        </Section>

        <Section title="Fairness Guarantees">
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>
              Each participant receives a unique, randomly assigned question — no two participants in
              the same raffle receive the same question at the same time.
            </li>
            <li>
              Questions are drawn from a pool of 1,000+ verified questions reviewed by our content
              team.
            </li>
            <li>
              The correct answer for each question is verifiable through publicly available sources.
            </li>
            <li>
              Failed attempts do not penalize your deposit or yield. Only drawing eligibility is
              affected.
            </li>
            <li>
              The VRF seed and selection logic are published on-chain for independent verification.
            </li>
          </ul>
        </Section>

        <Section title="Re-Attempts">
          <p>
            If you answer incorrectly, you may request a new question. There is no limit to
            re-attempts, but each attempt uses a different question. A cooldown period of 60 seconds
            applies between attempts to prevent brute-force guessing.
          </p>
        </Section>

        <Section title="Disqualification">
          <p>The following may result in disqualification from a raffle drawing:</p>
          <ul className="list-disc pl-6 mt-2 flex flex-col gap-1">
            <li>Failure to correctly answer a skill question before the drawing deadline</li>
            <li>Use of automated tools, bots, or scripts to answer questions</li>
            <li>Sharing questions or answers with other participants</li>
            <li>Any form of collusion or manipulation</li>
          </ul>
          <p className="mt-2">
            Disqualified participants retain their full deposit and may withdraw at any time.
          </p>
        </Section>

        <Section title="Legal Basis">
          <p>
            Skill-based contests are legally distinct from lotteries in most US jurisdictions. A
            lottery requires three elements: (1) prize, (2) chance, and (3) consideration. By
            introducing a meaningful skill component, Dollar House Club removes the pure-chance element.
            Additionally, since participant principal is fully refundable, the &quot;consideration&quot;
            element is also mitigated.
          </p>
          <p>
            We work with legal counsel to ensure compliance in each jurisdiction where we operate. If
            you have questions about legality in your area, consult a local attorney or contact us at{" "}
            <a href="mailto:legal@dollarhouseclub.com" className="text-[#FF385C] underline">
              legal@dollarhouseclub.com
            </a>.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-bold text-[#222222] mb-3" style={{ fontSize: "20px" }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function RuleStep({
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
