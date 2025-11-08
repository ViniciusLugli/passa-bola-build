"use client";

import React, { memo, useEffect, useRef, useState, useId } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  className = "",
  description,
  hint,
  error,
  success,
  required = false,
  ...props
}) => {
  const generatedId = useId();
  const inputId = props.id ?? name ?? `input-${generatedId}`;
  const [showPassword, setShowPassword] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (type === "textarea" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, type]);

  const baseClasses = `
    w-full
    p-4 sm:p-5
    rounded-xl
    border
    bg-surface
    text-lg sm:text-xl
    text-primary
    placeholder:text-tertiary
    transition-colors duration-200
    focus:outline-none
  `;

  const stateClasses = error
    ? `
        border-danger
        focus:border-danger
        ring-danger
        focus:ring-danger
        focus:ring-2
        `
    : success
    ? `
        border-success
        focus:border-success
        ring-success
        focus:ring-success
        focus:ring-2
      `
    : `
        border-default
        focus:ring-2
        focus:ring-accent
        focus:border-accent
      `;

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;
  const describedByIds = [];

  if (description) describedByIds.push(`${inputId}-description`);
  if (hint) describedByIds.push(`${inputId}-hint`);
  if (error) describedByIds.push(`${inputId}-error`);
  if (!error && success) describedByIds.push(`${inputId}-success`);

  // Adiciona classes para remover controles nativos de senha do navegador
  const passwordFieldClasses = isPasswordField
    ? "[&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-textfield-decoration-container]:hidden"
    : "";

  const mergedClassName = `
    ${baseClasses}
    ${stateClasses}
    ${className}
    ${passwordFieldClasses}
    ${props.disabled ? "opacity-70 cursor-not-allowed" : ""}
  `;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-base font-medium text-secondary flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-danger text-sm leading-none">*</span>
          )}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          ref={textareaRef}
          className={`${mergedClassName} resize-none overflow-hidden`}
          aria-invalid={Boolean(error)}
          aria-describedby={
            describedByIds.length ? describedByIds.join(" ") : undefined
          }
          required={required}
          rows="1"
          {...props}
        />
      ) : (
        <div className="relative w-full">
          <input
            id={inputId}
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${mergedClassName} ${isPasswordField ? "pr-14" : ""}`}
            aria-invalid={Boolean(error)}
            aria-describedby={
              describedByIds.length ? describedByIds.join(" ") : undefined
            }
            required={required}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-800
                dark:text-gray-300
                hover:text-gray-900
                dark:hover:text-white
                transition-colors
                duration-200
                focus:outline-none
                disabled:cursor-not-allowed
              "
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              disabled={props.disabled}
            >
              {showPassword ? (
                <EyeOff className="h-6 w-6" strokeWidth={2} />
              ) : (
                <Eye className="h-6 w-6" strokeWidth={2} />
              )}
            </button>
          )}
        </div>
      )}
      {description && (
        <p
          id={`${inputId}-description`}
          className="text-sm text-secondary"
        >
          {description}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
      {!error && success && (
        <p id={`${inputId}-success`} className="text-sm text-success">
          {success}
        </p>
      )}
    </div>
  );
};

export default memo(Input);
