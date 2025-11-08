"use client";

import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  label = "Carregando",
  size = 20,
  className = "",
  iconClassName = "text-current",
  strokeWidth = 2.5,
  labelClassName = "text-sm font-medium text-secondary",
  srOnly = false, // when true, render label as screen-reader-only; when false, label is visually shown but aria-hidden by default
}) => {
  const shouldRenderLabel = Boolean(label);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Loader2
        className={`animate-spin ${iconClassName}`}
        style={{ width: size, height: size }}
        strokeWidth={strokeWidth}
        aria-hidden="true"
      />
      {shouldRenderLabel && (
        <span
          className={srOnly ? `sr-only ${labelClassName}` : labelClassName}
          // by default keep the visible label aria-hidden so it doesn't double-announce;
          // if srOnly is provided, make it accessible to screen readers
          {...(srOnly ? {} : { "aria-hidden": "true" })}
        >
          {label}
        </span>
      )}
    </span>
  );
};

export default LoadingSpinner;
