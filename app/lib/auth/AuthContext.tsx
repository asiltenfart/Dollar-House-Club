"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { AuthUser, UserProfile } from "@/types";
import { getMagic, getMagicFlow } from "@/lib/magic";

// ── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: () => {},
  showAuthModal: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ── Helper: build UserProfile from Magic metadata ────────────────────────────

function buildProfile(email: string, flowAddress: string | null): UserProfile {
  return {
    address: flowAddress ?? "0x0000000000000000",
    displayName: email.split("@")[0],
    avatarUrl: null,
    email,
    rafflesEntered: 0,
    rafflesWon: 0,
    rafflesListed: 0,
    rafflesCompleted: 0,
    joinedAt: new Date().toISOString(),
  };
}

// ── Retrieve Flow address from Magic Flow extension ──────────────────────────

async function getFlowAddress(): Promise<string | null> {
  try {
    const magic = getMagicFlow();
    const account = await magic.flow.getAccount();
    return account?.addr ?? account ?? null;
  } catch {
    // Flow address retrieval can fail on first load — non-critical
  }
  return null;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check for existing Magic session on mount
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const magic = getMagic();
        const loggedIn = await magic.user.isLoggedIn();

        if (loggedIn && !cancelled) {
          const metadata = await magic.user.getInfo();
          const email = metadata.email ?? "";
          const flowAddress = await getFlowAddress();

          setUser({
            profile: buildProfile(email, flowAddress),
            isAuthenticated: true,
          });
        }
      } catch {
        // No active session — user stays null
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sign in with Magic Link (email OTP)
  const signIn = useCallback(async (email: string) => {
    const magic = getMagic();

    // Sends email OTP and resolves when user enters the code
    await magic.auth.loginWithEmailOTP({ email });

    // Retrieve user metadata + Flow address after successful auth
    const metadata = await magic.user.getInfo();
    const flowAddress = await getFlowAddress();

    setUser({
      profile: buildProfile(metadata.email ?? email, flowAddress),
      isAuthenticated: true,
    });
    setShowAuthModal(false);
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const magic = getMagic();
      await magic.user.logout();
    } catch {
      // Proceed with local sign-out even if Magic call fails
    }
    setUser(null);
  }, []);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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
