"use client";

import React, { useState, use } from "react";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/api/mock";
import { useRaffles } from "@/lib/data/useRaffleData";
import { useAuth } from "@/lib/auth/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import TabBar, { type ProfileTab } from "@/components/profile/TabBar";
import RaffleCard from "@/components/raffle/RaffleCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const { address } = use(params);
  const { user: authUser } = useAuth();
  const mockUser = getUserProfile(address);

  // Use mock user if address matches mock data, otherwise fall back to
  // the currently authenticated user (whose Flow address is in the URL).
  const user =
    mockUser ?? (authUser?.profile.address === address ? authUser.profile : null);

  const { raffles } = useRaffles();
  const [activeTab, setActiveTab] = useState<ProfileTab>("deposits");

  if (!user) {
    notFound();
  }

  const listedRaffles = raffles.filter((r) => r.seller.address === address);
  const wonRaffles = raffles.filter((r) => r.winner?.address === address);
  const depositedRaffles = raffles.filter((r) => r.status === "active").slice(0, 2);

  const tabContent = {
    deposits: depositedRaffles,
    wins: wonRaffles,
    listings: listedRaffles,
  };

  const emptyMessages = {
    deposits: { title: "No deposits yet", body: "Start depositing into active raffles to see them here." },
    wins: { title: "No wins yet", body: "Win a raffle and the property or yield will appear here." },
    listings: { title: "No listings yet", body: "List a property to start your first raffle." },
  };

  const current = tabContent[activeTab];
  const empty = emptyMessages[activeTab];

  return (
    <div>
      <ProfileHeader user={user} />

      <TabBar active={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}
        >
          {current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4L24 13V24H18V17H10V24H4V13L14 4Z" fill="#EBEBEB" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#222222] mb-2">{empty.title}</h3>
              <p className="text-sm text-[#717171] max-w-xs">{empty.body}</p>
              {activeTab === "listings" && (
                <Link
                  href={`/profile/${address}/create`}
                  className="mt-4 inline-flex items-center justify-center h-10 px-6 text-sm font-semibold bg-[#FF385C] text-white rounded-[8px] hover:bg-[#E0294A] transition-colors"
                >
                  List a Property
                </Link>
              )}
              {activeTab === "deposits" && (
                <Link
                  href="/explore"
                  className="mt-4 inline-flex items-center justify-center h-10 px-6 text-sm font-semibold bg-[#FF385C] text-white rounded-[8px] hover:bg-[#E0294A] transition-colors"
                >
                  Explore Raffles
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {current.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
