"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { AuthUser, UserProfile } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: () => {},
  showAuthModal: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const MOCK_USER: UserProfile = {
  address: "0xf1234567890abcde",
  displayName: "Alex Rivera",
  avatarUrl: null,
  email: "alex@example.com",
  rafflesEntered: 12,
  rafflesWon: 1,
  rafflesListed: 2,
  rafflesCompleted: 1,
  joinedAt: "2025-06-01T00:00:00Z",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const signIn = useCallback(async (email: string) => {
    // Mock sign-in: simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setUser({
      profile: { ...MOCK_USER, email },
      isAuthenticated: true,
    });
    setShowAuthModal(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signOut,
        showAuthModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
