import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-[#EBEBEB] bg-white" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 24px" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Dollar House Club" width={32} height={32} className="w-8 h-8 rounded-[8px] shrink-0" />
              <span className="text-base font-bold text-[#222222]">Dollar House Club</span>
            </Link>
            <p className="text-sm text-[#717171] leading-relaxed">
              Win a home through yield-powered property raffles. Deposit stablecoins. Keep your principal. Let the yield do the work.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold text-[#222222] uppercase tracking-widest mb-4">Platform</h3>
            <ul className="flex flex-col gap-3">
              <li><FooterLink href="/explore">Browse Raffles</FooterLink></li>
              <li><FooterLink href="/winners">Winners</FooterLink></li>
              <li><FooterLink href="/#how-it-works">How It Works</FooterLink></li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="text-xs font-semibold text-[#222222] uppercase tracking-widest mb-4">Sellers</h3>
            <ul className="flex flex-col gap-3">
              <li><FooterLink href="/seller-guide">List Your Property</FooterLink></li>
              <li><FooterLink href="/seller-guide">Seller Guide</FooterLink></li>
              <li><FooterLink href="/pricing">Pricing</FooterLink></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-[#222222] uppercase tracking-widest mb-4">Legal</h3>
            <ul className="flex flex-col gap-3">
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/rules">Skill-Based Rules</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#EBEBEB] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#B0B0B0]">
            &copy; {new Date().getFullYear()} Dollar House Club. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <SocialLink href="https://twitter.com" label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://discord.com" label="Discord">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
              </svg>
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-[#717171] hover:text-[#222222] transition-colors duration-150"
    >
      {children}
    </Link>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] transition-all duration-150"
    >
      {children}
    </a>
  );
}
