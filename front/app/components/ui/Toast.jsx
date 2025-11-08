"use client";

import { useEffect } from "react";

/**
 * Componente Toast para notificações
 * @param {Object} props
 * @param {string} props.message - Mensagem a ser exibida
 * @param {string} props.type - Tipo do toast: 'success', 'error', 'info'
 * @param {function} props.onClose - Callback para fechar o toast
 * @param {number} props.duration - Duração em ms (padrão: 3000)
 */
export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-600 border-green-700",
    error: "bg-red-600 border-red-700",
    info: "bg-purple-600 border-purple-700",
  };

  const typeIcons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className={`
        fixed
        bottom-6
        right-6
        ${typeStyles[type] || typeStyles.info}
        text-white
        px-6
        py-4
        rounded-lg
        shadow-2xl
        border-2
        flex
        items-center
        gap-3
        z-50
        animate-slide-in-right
        min-w-[280px]
        max-w-md
      `}
      role="alert"
    >
      <span className="text-2xl font-bold">{typeIcons[type]}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="
          text-white
          hover:text-gray-200
          font-bold
          text-xl
          transition-colors
          ml-2
        "
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  );
}
