import React from "react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
        Terms of Service
      </h1>
      <p className="text-sm text-[#717171] mb-10">
        Last updated: January 15, 2026
      </p>

      <div className="flex flex-col gap-8 text-[#484848] text-[15px] leading-relaxed">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Dollar House Club (&quot;the Platform&quot;), you agree to be bound by
            these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the
            Platform. We reserve the right to update these Terms at any time. Continued use of the
            Platform after changes constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years of age and legally able to enter into contracts in your
            jurisdiction. Dollar House Club is a skill-based platform and is not available in
            jurisdictions where participation in skill-based property acquisition contests is
            prohibited. You are responsible for determining whether your use of the Platform complies
            with applicable law.
          </p>
        </Section>

        <Section title="3. How the Platform Works">
          <p>
            Dollar House Club allows property sellers to list verified real estate assets. Participants
            deposit USDC stablecoins into raffle pools. The deposited principal generates yield through
            DeFi lending protocols. All yield is directed to the prize pool. At the conclusion of each
            raffle period, a winner is selected through a weighted, verifiable random process
            proportional to each participant&apos;s yield contribution — subject to the completion of a
            mandatory skill-based question.
          </p>
          <p>
            Your principal deposit is never at risk. You may withdraw your full deposit at any time
            before the raffle concludes, forfeiting only your share of the yield generated.
          </p>
        </Section>

        <Section title="4. Skill-Based Entry Requirement">
          <p>
            To be eligible for any raffle drawing, participants must correctly answer a skill-based
            question prior to the drawing. This requirement ensures compliance with regulations
            distinguishing skill-based contests from games of chance. Failure to answer correctly
            disqualifies the entry for that drawing cycle; the participant may re-attempt in subsequent
            cycles while their deposit remains active.
          </p>
        </Section>

        <Section title="5. Deposits and Withdrawals">
          <p>
            All deposits are made in USDC on the Flow blockchain. There is no minimum deposit amount,
            though the Platform may set practical minimums for gas efficiency. You may withdraw your
            principal at any time during an active raffle. Upon withdrawal, your yield contribution is
            forfeited, and you will no longer be eligible for that raffle&apos;s drawing.
          </p>
          <p>
            Dollar House Club does not custody your funds. All deposits interact directly with audited
            smart contracts deployed on the Flow blockchain.
          </p>
        </Section>

        <Section title="6. Property Listings and Verification">
          <p>
            Sellers are required to provide proof of ownership, property appraisals, and relevant legal
            documentation before a listing goes live. Dollar House Club reviews each submission but does
            not guarantee the accuracy of seller-provided information. Participants are encouraged to
            review property details and perform their own due diligence.
          </p>
        </Section>

        <Section title="7. Winner Selection and Property Transfer">
          <p>
            Winners are selected via a verifiable random function (VRF) weighted by yield contribution
            and conditioned on skill-question completion. Once a winner is confirmed, the property
            transfer is facilitated through a licensed title company. Dollar House Club coordinates the
            transfer but is not a party to the real estate transaction. Transfer timelines vary by
            jurisdiction, typically 30–90 days.
          </p>
        </Section>

        <Section title="8. Fees">
          <p>
            Dollar House Club charges a platform fee equal to 5% of the total yield generated per
            raffle. Sellers may be subject to a listing fee and/or a success fee upon completed
            transfer. All fees are disclosed prior to listing and participation. There are no hidden
            charges. Blockchain gas fees are the responsibility of the user.
          </p>
        </Section>

        <Section title="9. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 flex flex-col gap-1">
            <li>Use the Platform for money laundering or any illegal activity</li>
            <li>Submit fraudulent property listings or forged documents</li>
            <li>Use bots, scripts, or automated tools to gain unfair advantage</li>
            <li>Attempt to manipulate the random selection process</li>
            <li>Create multiple accounts to circumvent rules or limits</li>
            <li>Interfere with the Platform&apos;s infrastructure or smart contracts</li>
          </ul>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            Dollar House Club is provided &quot;as is&quot; without warranties of any kind. To the
            maximum extent permitted by law, Dollar House Club, its founders, and its affiliates shall
            not be liable for any indirect, incidental, or consequential damages arising from your use
            of the Platform, including but not limited to loss of funds due to smart contract
            vulnerabilities, blockchain network issues, or property transfer complications.
          </p>
        </Section>

        <Section title="11. Dispute Resolution">
          <p>
            Any disputes arising from these Terms or your use of the Platform shall be resolved through
            binding arbitration under the rules of the American Arbitration Association, conducted in
            Delaware, United States. You waive any right to a jury trial or to participate in a class
            action.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            We may suspend or terminate your access to the Platform at our discretion if we believe you
            have violated these Terms or applicable law. Upon termination, you retain the right to
            withdraw any remaining principal deposits.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            If you have questions about these Terms, contact us at{" "}
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
