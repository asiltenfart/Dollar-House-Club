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

type Step = "email" | "otp" | "success";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setEmailError("");
    setOtpError("");
    setIsLoading(false);
    onClose();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsLoading(true);
    // Simulate sending OTP
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setOtpError("Please enter the 6-digit code from your email.");
      return;
    }
    setOtpError("");
    setIsLoading(true);
    // Mock verification: any code works
    await signIn(email);
    setIsLoading(false);
    setStep("success");
    showToast("Welcome to Dollar House Club!", "success");
    setTimeout(handleClose, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="400px">
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
              Enter your email and we&apos;ll send you a secure sign-in link. No password needed.
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
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
              {isLoading ? "" : "Send Sign-In Code"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-[#717171] text-center">
            By continuing, you agree to our{" "}
            <a href="/" className="underline hover:text-[#222222]">Terms of Service</a>
            {" "}and{" "}
            <a href="/" className="underline hover:text-[#222222]">Privacy Policy</a>.
          </p>
        </div>
      )}

      {step === "otp" && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setStep("email")}
              className="flex items-center gap-1 text-sm text-[#717171] hover:text-[#222222] transition-colors mb-4"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <h2 className="text-2xl font-bold text-[#222222] mb-2">Check your email</h2>
            <p className="text-sm text-[#717171]">
              We sent a 6-digit code to <strong className="text-[#222222]">{email}</strong>. Enter it below to sign in.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <Input
              label="Sign-in code"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              error={otpError}
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <Button type="submit" fullWidth isLoading={isLoading}>
              {isLoading ? "" : "Verify Code"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-[#717171] text-center">
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => setStep("email")}
              className="underline hover:text-[#222222] cursor-pointer"
            >
              Resend code
            </button>
          </p>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-[#E6F9E7] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M7 14l5 5L21 9" stroke="#008A05" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#222222]">You&apos;re in!</h2>
          <p className="text-sm text-[#717171] text-center">Signed in as {email}.</p>
        </div>
      )}
    </Modal>
  );
}
