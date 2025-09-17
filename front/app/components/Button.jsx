"use client";

import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyle =
    "px-4 py-2 rounded-lg font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${
        disabled ? disabledStyle : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
