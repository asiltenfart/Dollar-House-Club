"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { AuthUser, UserProfile } from "@/types";

// ── Mode detection ──────────────────────────────────────────────────────────
const FLOW_NETWORK = process.env.NEXT_PUBLIC_FLOW_NETWORK || "emulator";
export const isEmulatorMode = FLOW_NETWORK === "emulator";

// ── Context shape ───────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email?: string) => Promise<void>;
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

// ── Helper: build UserProfile ───────────────────────────────────────────────

function buildProfile(
  flowAddress: string,
  displayName?: string,
  email?: string
): UserProfile {
  return {
    address: flowAddress,
    displayName: displayName || flowAddress.slice(0, 8),
    avatarUrl: null,
    email: email || "",
    rafflesEntered: 0,
    rafflesWon: 0,
    rafflesListed: 0,
    rafflesCompleted: 0,
    joinedAt: new Date().toISOString(),
  };
}

// ── Lazy loaders (avoid top-level imports that stall SSR) ───────────────────

async function getFcl() {
  const fcl = await import("@onflow/fcl");
  return fcl;
}

async function getMagicModules() {
  const { getMagic, getMagicFlow } = await import("@/lib/magic");
  return { getMagic, getMagicFlow };
}

// ── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Emulator mode: subscribe to FCL current user ──────────────────────
  useEffect(() => {
    if (!isEmulatorMode) return;

    let unsub: (() => void) | undefined;

    getFcl().then((fcl) => {
      unsub = fcl.currentUser.subscribe((currentUser: { addr?: string | null; loggedIn?: boolean }) => {
        if (currentUser?.loggedIn && currentUser.addr) {
          setUser({
            profile: buildProfile(currentUser.addr, currentUser.addr),
            isAuthenticated: true,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
    });

    return () => { unsub?.(); };
  }, []);

  // ── Testnet mode: check existing Magic session on mount ───────────────
  useEffect(() => {
    if (isEmulatorMode) return;
    let cancelled = false;

    async function checkSession() {
      try {
        const { getMagic, getMagicFlow } = await getMagicModules();
        const magic = getMagic();
        const loggedIn = await magic.user.isLoggedIn();

        if (loggedIn && !cancelled) {
          const metadata = await magic.user.getInfo();
          const email = metadata.email ?? "";
          let flowAddress = "0x0000000000000000";
          try {
            const magicFlow = getMagicFlow();
            const account = await magicFlow.flow.getAccount();
            flowAddress = account?.addr ?? account ?? flowAddress;
          } catch {
            // Flow address retrieval can fail on first load
          }
          setUser({
            profile: buildProfile(flowAddress, email.split("@")[0], email),
            isAuthenticated: true,
          });
        }
      } catch {
        // No active session
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Sign in ───────────────────────────────────────────────────────────
  const signIn = useCallback(async (email?: string) => {
    if (isEmulatorMode) {
      const fcl = await getFcl();
      await fcl.authenticate();
      setShowAuthModal(false);
    } else {
      if (!email) throw new Error("Email required for testnet sign-in");
      const { getMagic, getMagicFlow } = await getMagicModules();
      const magic = getMagic();
      await magic.auth.loginWithEmailOTP({ email });
      const metadata = await magic.user.getInfo();
      let flowAddress = "0x0000000000000000";
      try {
        const magicFlow = getMagicFlow();
        const account = await magicFlow.flow.getAccount();
        flowAddress = account?.addr ?? account ?? flowAddress;
      } catch {
        // non-critical
      }
      setUser({
        profile: buildProfile(
          flowAddress,
          (metadata.email ?? email).split("@")[0],
          metadata.email ?? email
        ),
        isAuthenticated: true,
      });
      setShowAuthModal(false);
    }
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (isEmulatorMode) {
      const fcl = await getFcl();
      await fcl.unauthenticate();
    } else {
      try {
        const { getMagic } = await getMagicModules();
        const magic = getMagic();
        await magic.user.logout();
      } catch {
        // Proceed with local sign-out
      }
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
