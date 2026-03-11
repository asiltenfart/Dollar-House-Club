"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "./Toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "verifying" | "success" | "error";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [authError, setAuthError] = useState("");

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setEmailError("");
    setAuthError("");
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setAuthError("");
    setIsLoading(true);
    setStep("verifying");

    try {
      // Magic SDK handles the OTP UI in its own iframe.
      // signIn() calls magic.auth.loginWithEmailOTP({ email })
      await signIn(email);
      setStep("success");
      showToast("Welcome to Dollar House Club!", "success");
      setTimeout(handleClose, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      setAuthError(message);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="400px">
      {/* Step 1: Email input */}
      {step === "email" && (
        <div>
          <div className="mb-6">
            <div
              className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-4"
              style={{ background: "var(--gradient-hero)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 2L16 8V16H12V11H6V16H2V8L9 2Z" fill="white" transform="translate(3,0)" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#222222] mb-2">Sign in to participate</h2>
            <p className="text-sm text-[#717171]">
              Enter your email and we&apos;ll send you a one-time code. No password needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              autoFocus
              autoComplete="email"
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              {isLoading ? "" : "Continue with Email"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-[#717171] text-center">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-[#222222]">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-[#222222]">Privacy Policy</a>.
          </p>
        </div>
      )}

      {/* Step 2: Magic is handling OTP verification */}
      {step === "verifying" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-10 h-10 border-3 border-[#FF385C] border-t-transparent rounded-full animate-spin" />
          <h2 className="text-lg font-bold text-[#222222]">Check your email</h2>
          <p className="text-sm text-[#717171] text-center max-w-xs">
            We sent a code to <strong className="text-[#222222]">{email}</strong>.
            Enter it in the Magic prompt to sign in.
          </p>
        </div>
      )}

      {/* Step 3: Success */}
      {step === "success" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-[#E6F9E7] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M7 14l5 5L21 9" stroke="#008A05" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#222222]">You&apos;re in!</h2>
          <p className="text-sm text-[#717171] text-center">
            Signed in as {email}. Your Flow wallet is ready.
          </p>
        </div>
      )}

      {/* Error state */}
      {step === "error" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F0] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M9 9l10 10M19 9L9 19" stroke="#C13515" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#222222]">Sign-in failed</h2>
          <p className="text-sm text-[#717171] text-center max-w-xs">{authError}</p>
          <button
            onClick={() => {
              setStep("email");
              setAuthError("");
            }}
            className="text-sm font-semibold text-[#FF385C] hover:underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}
    </Modal>
  );
}
