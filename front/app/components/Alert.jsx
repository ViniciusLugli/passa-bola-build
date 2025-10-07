"use client";

import React, { useEffect, useState } from "react";

export default function Alert({
  isOpen: isOpenProp,
  onClose,
  message,
  type = "error",
  duration = 3000,
}) {
  const [isOpen, setIsOpen] = useState(Boolean(isOpenProp));

  useEffect(() => {
    setIsOpen(Boolean(isOpenProp));
  }, [isOpenProp]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      setIsOpen(false);
      if (typeof onClose === "function") onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const alertStyles = {
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  const borderStyles = {
    error: "border-red-500",
    success: "border-green-500",
    warning: "border-yellow-500",
    info: "border-blue-500",
  };

  const title = {
    error: "Erro!",
    success: "Sucesso!",
    warning: "Atenção!",
    info: "Informação!",
  };

  return (
    <div className="fixed top-4 right-4 z-50 p-4">
      <div
        className={`relative ${alertStyles[type]} border-t-4 ${borderStyles[type]} rounded-b text-gray-900 px-4 py-3 shadow-md max-w-sm w-full`}
        role="alert"
      >
        <div className="flex items-center">
          <div className="py-1">
            {type === "error" && (
              <svg
                className="fill-current h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V7h2v2h-2zm0 4v-2h2v2h-2z" />
              </svg>
            )}
            {type === "success" && (
              <svg
                className="fill-current h-6 w-6 text-green-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1117.07 2.93 10 10 0 012.93 17.07zm12.73-1.41A8 8 0 104.34 4.34a8 8 0 0011.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            )}
            {type === "warning" && (
              <svg
                className="fill-current h-6 w-6 text-yellow-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1117.07 2.93 10 10 0 012.93 17.07zm12.73-1.41A8 8 0 104.34 4.34a8 8 0 0011.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            )}
            {type === "info" && (
              <svg
                className="fill-current h-6 w-6 text-blue-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V7h2v2h-2zm0 4v-2h2v2h-2z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-bold">{title[type]}</p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          <svg
            className="fill-current h-6 w-6 text-gray-500 hover:text-gray-700"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
