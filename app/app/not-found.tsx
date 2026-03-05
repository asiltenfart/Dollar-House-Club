import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div
        className="w-20 h-20 rounded-[16px] flex items-center justify-center mb-6"
        style={{ background: "var(--gradient-hero)" }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M18 4L32 16V32H24V22H12V32H4V16L18 4Z" fill="white" />
        </svg>
      </div>
      <h1
        className="font-bold text-[#222222] mb-3"
        style={{ fontSize: "48px", letterSpacing: "-0.02em", lineHeight: "1.1" }}
      >
        404
      </h1>
      <h2 className="text-2xl font-bold text-[#222222] mb-3">Page not found</h2>
      <p className="text-base text-[#717171] max-w-xs mb-8">
        The raffle or page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-12 px-8 bg-[#FF385C] text-white text-base font-semibold rounded-[8px] hover:bg-[#E0294A] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
