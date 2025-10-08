"use client";

import React, { memo, useEffect, useRef, useState } from "react";

const Input = ({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  className = "",
  ...props
}) => {
  const inputId = name;
  const [showPassword, setShowPassword] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (type === "textarea" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, type]);

  const isDateField = type === "date";
  const isTimeField = type === "time";
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  const baseClasses = `
    w-full 
    ${isDateField || isTimeField ? "p-3 sm:p-4" : "p-4 sm:p-5"}
    rounded-xl 
    border-2 
    border-gray-200 
    focus:outline-none 
    focus:ring-2 
    focus:ring-purple-500 
    ${
      isDateField || isTimeField ? "text-base sm:text-lg" : "text-lg sm:text-xl"
    }
    text-gray-800 
    transition-colors duration-200
    ${className}
  `;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 text-base font-medium text-gray-700"
        >
          {label}
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
          className={`${baseClasses} resize-none overflow-hidden`}
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
            className={`${baseClasses} ${isPasswordField ? "pr-14" : ""}`}
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
                text-gray-500
                hover:text-gray-700
                transition-colors
                duration-200
                focus:outline-none
              "
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(Input);
