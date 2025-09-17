"use client";

import React, { memo, useEffect, useRef } from "react";

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
  const inputId = name; // Usar o name como ID se disponível

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
    border-2 
    border-gray-200 
    focus:outline-none 
    focus:ring-2 
    focus:ring-purple-500 
    text-lg sm:text-xl 
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
        <input
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={baseClasses}
          {...props}
        />
      )}
    </div>
  );
};

export default memo(Input);
