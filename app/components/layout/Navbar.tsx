"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";
import { useDataSource } from "@/lib/data/DataSourceContext";
import AuthModal from "@/components/ui/AuthModal";
import Button from "@/components/ui/Button";
import DemoFaucet from "@/components/ui/DemoFaucet";
import DevCreateRaffle from "@/components/ui/DevCreateRaffle";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut, showAuthModal, openAuthModal, closeAuthModal } = useAuth();
  const { isMock, toggleDataSource } = useDataSource();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Scroll sentinel — sits just below top of page */}
      <div id="scroll-sentinel" className="absolute top-0 left-0 w-px h-px" aria-hidden="true" />

      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-white transition-shadow duration-200"
        style={{ boxShadow: isScrolled ? "0 1px 2px rgba(0,0,0,0.08)" : "none" }}
      >
        <div
          className="h-full flex items-center justify-between"
          style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 24px" }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="Dollar House Club home"
          >
            <Image src="/logo.png" alt="Dollar House Club" width={32} height={32} className="w-8 h-8 rounded-[8px]" />
            <span className="text-base font-bold text-[#222222] hidden sm:block" style={{ letterSpacing: "-0.01em" }}>
              Dollar House Club
            </span>
          </Link>

          {/* Center nav links — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/explore">Explore</NavLink>
            <NavLink href="/winners">Winners</NavLink>
          </nav>

          {/* Data source toggle */}
          <DataSourceToggle isMock={isMock} onToggle={toggleDataSource} />

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <DemoFaucet />
                  <DevCreateRaffle />
                </div>
                <Link
                  href={`/profile/${user.profile.address}/create`}
                  className="hidden md:block text-sm font-semibold text-[#222222] hover:text-[#FF385C] transition-colors duration-150"
                >
                  List Property
                </Link>
                <AvatarMenu
                  displayName={user.profile.displayName}
                  address={user.profile.address}
                  onSignOut={signOut}
                />
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={openAuthModal}>
                Sign In
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-[8px] hover:bg-[#F7F7F7] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                {menuOpen ? (
                  <path d="M2 2L18 14M18 2L2 14" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <>
                    <rect x="0" y="0" width="20" height="2" rx="1" fill="#222222" />
                    <rect x="0" y="7" width="20" height="2" rx="1" fill="#222222" />
                    <rect x="0" y="14" width="20" height="2" rx="1" fill="#222222" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#EBEBEB] px-4 py-4 flex flex-col gap-3">
            <MobileNavLink href="/explore" onClick={() => setMenuOpen(false)}>Explore</MobileNavLink>
            <MobileNavLink href="/winners" onClick={() => setMenuOpen(false)}>Winners</MobileNavLink>
            {isAuthenticated && user && (
              <MobileNavLink href={`/profile/${user.profile.address}/create`} onClick={() => setMenuOpen(false)}>
                List Property
              </MobileNavLink>
            )}
          </div>
        )}
      </header>

      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-[#717171] hover:text-[#222222] transition-colors duration-150"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-base font-semibold text-[#222222] hover:text-[#FF385C] transition-colors"
    >
      {children}
    </Link>
  );
}

function DataSourceToggle({ isMock, onToggle }: { isMock: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="hidden md:flex items-center gap-2 h-8 px-3 rounded-full border transition-all duration-200 cursor-pointer text-xs font-semibold shrink-0"
      style={{
        borderColor: isMock ? "#DDDDDD" : "#00EF8B",
        background: isMock ? "#F7F7F7" : "#F0FFF4",
        color: isMock ? "#717171" : "#008A05",
      }}
      title={isMock ? "Showing mock data — click to switch to on-chain" : "Showing on-chain data — click to switch to mock"}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: isMock ? "#B0B0B0" : "#00EF8B" }}
      />
      {isMock ? "Mock Data" : "On-Chain"}
    </button>
  );
}

function AvatarMenu({ displayName, address, onSignOut }: { displayName: string; address: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const avatar = React.useMemo(() => {
    // Lazy-load to avoid SSR issues (localStorage)
    const { getAvatar } = require("@/lib/utils/avatars");
    return getAvatar(address) as string;
  }, [address]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full overflow-hidden transition-opacity hover:opacity-90"
        aria-label="Account menu"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={displayName} width={40} height={40} className="w-full h-full object-cover" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 bg-white rounded-[12px] border border-[#DDDDDD] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-2 min-w-[200px]">
            <div className="px-4 py-3 border-b border-[#EBEBEB]">
              <p className="text-sm font-semibold text-[#222222]">{displayName}</p>
            </div>
            <Link
              href={`/profile/${address}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
            >
              My Profile
            </Link>
            <Link
              href={`/profile/${address}/create`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
            >
              List a Property
            </Link>
            <div className="border-t border-[#EBEBEB] mt-1 pt-1">
              <button
                onClick={() => { onSignOut(); setOpen(false); }}
                className="block w-full text-left px-4 py-2.5 text-sm text-[#C13515] hover:bg-[#FFF0ED] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
