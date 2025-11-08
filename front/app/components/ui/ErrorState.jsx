"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

/**
 * ErrorState - Componente reutilizável para exibir estados de erro
 *
 * @param {string} title - Título do erro
 * @param {string} message - Mensagem de erro detalhada
 * @param {function} onRetry - Função callback para tentar novamente
 * @param {string} retryLabel - Label do botão de retry (padrão: "Tentar Novamente")
 * @param {React.ReactNode} icon - Ícone customizado (padrão: AlertCircle)
 * @param {string} variant - Variante de estilo: 'error' | 'warning' | 'danger'
 */
export default function ErrorState({
  title = "Algo deu errado",
  message = "Ocorreu um erro ao carregar as informações. Por favor, tente novamente.",
  onRetry,
  retryLabel = "Tentar Novamente",
  icon,
  variant = "error",
}) {
  const variants = {
    error: {
      bg: "bg-danger-soft dark:bg-surface-muted",
      border: "border-danger",
      text: "text-danger",
      iconColor: "text-danger",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-surface-muted",
      border: "border-yellow-400",
      text: "text-yellow-700 dark:text-yellow-400",
      iconColor: "text-yellow-500",
    },
    danger: {
      bg: "bg-red-50 dark:bg-surface-muted",
      border: "border-red-400",
      text: "text-red-700 dark:text-red-400",
      iconColor: "text-red-500",
    },
  };

  const style = variants[variant] || variants.error;
  const IconComponent = icon || AlertCircle;

  return (
    <div
      className={`
        ${style.bg} 
        border-2 
        ${style.border} 
        rounded-xl 
        p-6 
        text-center 
        max-w-md 
        mx-auto
        fade-in
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Ícone */}
      <div className="flex justify-center mb-4" aria-hidden="true">
        <IconComponent
          className={`w-12 h-12 ${style.iconColor}`}
          strokeWidth={1.5}
        />
      </div>

      {/* Título */}
      <h3 className={`text-lg font-semibold mb-2 ${style.text}`}>{title}</h3>

      {/* Mensagem */}
      {message && (
        <p className="text-sm text-secondary mb-4 max-w-sm mx-auto">
          {message}
        </p>
      )}

      {/* Botão de retry */}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          className="mt-4 inline-flex items-center gap-2"
          ariaLabel={retryLabel}
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
