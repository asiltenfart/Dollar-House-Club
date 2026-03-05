"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const base =
    "inline-flex items-center justify-center font-semibold tracking-wide select-none cursor-pointer transition-all duration-150 ease-out focus-visible:outline-none";

  const sizeMap = {
    sm: "h-9 px-4 text-sm rounded-[8px]",
    md: "h-14 px-6 text-base rounded-[8px]",
    lg: "h-14 px-8 text-base rounded-[8px]",
  };

  const variantMap = {
    primary: isDisabled && !isLoading
      ? "bg-[#EBEBEB] text-[#B0B0B0] cursor-not-allowed"
      : "bg-[#FF385C] text-white hover:bg-[#E0294A] hover:-translate-y-px hover:shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:translate-y-0 active:scale-[0.98]",
    secondary: isDisabled
      ? "bg-[#EBEBEB] text-[#B0B0B0] cursor-not-allowed"
      : "bg-[#F7F7F7] text-[#222222] hover:bg-[#EBEBEB] active:scale-[0.98]",
    outline: isDisabled
      ? "border border-[#B0B0B0] text-[#B0B0B0] cursor-not-allowed"
      : "border border-[#222222] text-[#222222] bg-transparent hover:bg-[#F7F7F7] active:bg-[#EBEBEB] active:scale-[0.98]",
  };

  const loadingOpacity = isLoading ? "opacity-70" : "";

  return (
    <button
      className={`${base} ${sizeMap[size]} ${variantMap[variant]} ${loadingOpacity} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner />
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
