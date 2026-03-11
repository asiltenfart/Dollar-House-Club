import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
        Privacy Policy
      </h1>
      <p className="text-sm text-[#717171] mb-10">
        Last updated: January 15, 2026
      </p>

      <div className="flex flex-col gap-8 text-[#484848] text-[15px] leading-relaxed">
        <Section title="1. Overview">
          <p>
            Dollar House Club (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) respects your privacy.
            This Privacy Policy explains what information we collect, how we use it, and your rights
            regarding that information when you use our platform at dollarhouseclub.com (the
            &quot;Platform&quot;).
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <h3 className="font-semibold text-[#222222] mt-1">Information You Provide</h3>
          <ul className="list-disc pl-6 flex flex-col gap-1">
            <li>Email address (for account creation and Magic Link authentication)</li>
            <li>Display name and optional profile information</li>
            <li>Wallet address (Flow blockchain public address)</li>
            <li>Property listing information (if you are a seller)</li>
            <li>Skill-question responses</li>
          </ul>

          <h3 className="font-semibold text-[#222222] mt-4">Information Collected Automatically</h3>
          <ul className="list-disc pl-6 flex flex-col gap-1">
            <li>Device information (browser type, operating system, screen resolution)</li>
            <li>IP address and approximate geographic location</li>
            <li>Pages visited, interaction timestamps, and referral sources</li>
            <li>On-chain transaction data (public by nature of blockchain)</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-6 flex flex-col gap-1">
            <li>To provide, maintain, and improve the Platform</li>
            <li>To authenticate your identity and secure your account</li>
            <li>To process raffle entries, deposits, and withdrawals</li>
            <li>To communicate with you about your account, raffles, and platform updates</li>
            <li>To verify property listings and facilitate property transfers</li>
            <li>To detect fraud, abuse, and violations of our Terms of Service</li>
            <li>To comply with legal obligations and respond to lawful requests</li>
          </ul>
        </Section>

        <Section title="4. Information Sharing">
          <p>We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc pl-6 mt-2 flex flex-col gap-1">
            <li>
              <strong>Service providers</strong> — hosting, analytics, email delivery, and identity
              verification partners who process data on our behalf
            </li>
            <li>
              <strong>Title companies and legal entities</strong> — to facilitate property transfers
              for raffle winners
            </li>
            <li>
              <strong>Law enforcement</strong> — when required by law, subpoena, or court order
            </li>
            <li>
              <strong>Blockchain networks</strong> — on-chain transactions are publicly visible by
              design; we do not control this
            </li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain your account information for as long as your account is active or as needed to
            provide you services. Transaction records are retained for a minimum of 7 years to comply
            with financial regulations. You may request deletion of your account and personal data at
            any time, subject to legal retention requirements.
          </p>
        </Section>

        <Section title="6. Security">
          <p>
            We implement industry-standard security measures to protect your information, including
            encrypted connections (TLS), secure authentication flows, and regular security audits.
            However, no method of transmission over the internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="7. Cookies and Tracking">
          <p>
            We use essential cookies to maintain your session and preferences. We may use analytics
            tools to understand how the Platform is used. You can disable cookies in your browser
            settings, though some Platform features may not function properly without them.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 mt-2 flex flex-col gap-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability (receive your data in a structured format)</li>
            <li>Withdraw consent at any time (where processing is based on consent)</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@dollarhouseclub.com" className="text-[#FF385C] underline">
              privacy@dollarhouseclub.com
            </a>.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            The Platform is not intended for anyone under the age of 18. We do not knowingly collect
            information from minors. If we learn that we have collected personal data from a person
            under 18, we will promptly delete it.
          </p>
        </Section>

        <Section title="10. International Users">
          <p>
            The Platform is operated from the United States. If you access the Platform from outside
            the US, your information may be transferred to and processed in the United States. By using
            the Platform, you consent to this transfer.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            by email or by posting a notice on the Platform. Your continued use after changes
            constitutes acceptance.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For privacy-related inquiries, contact us at{" "}
            <a href="mailto:privacy@dollarhouseclub.com" className="text-[#FF385C] underline">
              privacy@dollarhouseclub.com
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
