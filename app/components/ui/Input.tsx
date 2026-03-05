"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

export default function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  id,
  className = "",
  disabled,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[#222222] tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-[#717171] text-base select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={`
            w-full h-12 px-4 text-base text-[#222222]
            border rounded-[8px] outline-none
            transition-all duration-150
            placeholder:text-[#B0B0B0]
            ${prefix ? "pl-8" : ""}
            ${suffix ? "pr-10" : ""}
            ${error
              ? "border-2 border-[#C13515] bg-[#FFF0ED]"
              : "border border-[#DDDDDD] bg-white focus:border-2 focus:border-[#222222]"
            }
            ${disabled ? "bg-[#F7F7F7] text-[#B0B0B0] cursor-not-allowed" : ""}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-[#717171] text-sm select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#C13515]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[#717171]">{hint}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxChars?: number;
}

export function Textarea({
  label,
  error,
  hint,
  maxChars,
  id,
  value,
  className = "",
  disabled,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const charCount = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-[#222222] tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        disabled={disabled}
        value={value}
        className={`
          w-full px-4 py-3 text-base text-[#222222]
          border rounded-[8px] outline-none resize-y min-h-[120px]
          transition-all duration-150
          placeholder:text-[#B0B0B0]
          ${error
            ? "border-2 border-[#C13515] bg-[#FFF0ED]"
            : "border border-[#DDDDDD] bg-white focus:border-2 focus:border-[#222222]"
          }
          ${disabled ? "bg-[#F7F7F7] text-[#B0B0B0] cursor-not-allowed" : ""}
          ${className}
        `}
        {...props}
      />
      <div className="flex justify-between items-center">
        {error ? (
          <p className="text-xs text-[#C13515]">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[#717171]">{hint}</p>
        ) : (
          <span />
        )}
        {maxChars && (
          <p className="text-xs text-[#717171]">
            {charCount}/{maxChars}
          </p>
        )}
      </div>
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  id,
  className = "",
  disabled,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-[#222222] tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          className={`
            w-full h-12 px-4 pr-10 text-base text-[#222222]
            border rounded-[8px] outline-none appearance-none bg-white
            transition-all duration-150 cursor-pointer
            ${error
              ? "border-2 border-[#C13515]"
              : "border border-[#DDDDDD] focus:border-2 focus:border-[#222222]"
            }
            ${disabled ? "bg-[#F7F7F7] text-[#B0B0B0] cursor-not-allowed" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 7L11 1" stroke="#717171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-[#C13515]">{error}</p>}
    </div>
  );
}
