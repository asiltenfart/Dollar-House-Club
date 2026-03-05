"use client";

import React from "react";

export type ProfileTab = "deposits" | "wins" | "listings";

interface TabBarProps {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "deposits", label: "Deposits" },
  { id: "wins", label: "Wins" },
  { id: "listings", label: "Listed Properties" },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div
      className="sticky bg-white border-b border-[#EBEBEB] z-40"
      style={{ top: "64px" }}
    >
      <div
        className="flex items-center"
        style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 24px" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative h-12 px-4 text-sm transition-all duration-200 whitespace-nowrap"
            style={{
              fontWeight: active === tab.id ? 600 : 400,
              color: active === tab.id ? "#222222" : "#717171",
            }}
          >
            {tab.label}
            {active === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "#FF385C", transition: "transform 200ms ease" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
