"use client";

import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function Button({
  children,
  type = "button",
  onClick,
  loading = false,
  disabled = false,
  variant = "primary", // primary | secondary | ghost
  size = "medium", // small | medium | large
  fullWidth = true, // controls w-full behavior
  className = "",
  ariaLabel,
  ...props
}) {
  const isDisabled = disabled || loading;

  const base = `inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`;

  // Size variants - independent of button variant
  const sizes = {
    small: "px-3 py-2 text-sm",
    medium: "px-5 py-3 sm:py-4",
    large: "px-6 py-4 sm:py-5 text-lg",
  };

  const sizeClass = sizes[size] ?? sizes.medium;
  const widthClass = fullWidth ? "w-full" : "";

  const variants = {
    primary: `text-white shadow-elevated bg-gradient-to-br from-purple-600 to-indigo-700 ${
      isDisabled
        ? "opacity-70 cursor-not-allowed"
        : "hover:from-purple-700 hover:to-indigo-800 transition-colors hover:scale-105 active:scale-95"
    }`,
    secondary: `bg-surface border border-default text-primary ${
      isDisabled
        ? "opacity-70 cursor-not-allowed"
        : "hover:border-accent hover:text-accent"
    }`,
    ghost: `bg-transparent text-accent ${
      isDisabled ? "opacity-70 cursor-not-allowed" : "hover:underline"
    }`,
  };

  const variantClass = variants[variant] ?? variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={ariaLabel}
      className={`${base} ${sizeClass} ${widthClass} ${variantClass} ${className}`}
      {...props}
    >
      {loading ? (
        // when children (text) present, keep visible text and make spinner srOnly to avoid double announce
        <span className="flex items-center justify-center gap-3">
          <LoadingSpinner
            label={typeof children === "string" ? children : "Carregando"}
            srOnly={true}
            size={20}
            iconClassName="text-on-brand"
          />
          {children && <span className="font-semibold">{children}</span>}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
