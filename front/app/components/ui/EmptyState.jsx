"use client";

import React from "react";

/**
 * EmptyState - Componente reutilizável para exibir estados vazios
 *
 * @param {React.ReactNode} icon - Ícone do lucide-react ou qualquer elemento React
 * @param {string} title - Título do estado vazio
 * @param {string} description - Descrição do estado vazio
 * @param {React.ReactNode} action - Elemento de ação opcional (botão, link, etc)
 * @param {string} variant - Variante de estilo: 'default' | 'gradient' | 'bordered'
 * @param {string} className - Classes CSS adicionais
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-surface rounded-xl p-8",
    gradient: "bg-empty-gradient rounded-xl p-8 border border-default",
    bordered: "border-2 border-dashed border-default rounded-xl p-8 bg-surface",
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <div
      className={`
        flex 
        flex-col 
        items-center 
        justify-center 
        text-center
        fade-in
        ${variantClass}
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      {/* Ícone */}
      {icon && (
        <div
          className="mb-4 text-tertiary transition-smooth"
          aria-hidden="true"
        >
          {React.cloneElement(icon, {
            className: "w-16 h-16 md:w-20 md:h-20",
            strokeWidth: 1.5,
          })}
        </div>
      )}

      {/* Título */}
      <h3 className="text-xl md:text-2xl font-semibold text-primary mb-2">
        {title}
      </h3>

      {/* Descrição */}
      {description && (
        <p className="text-sm md:text-base text-secondary max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Ação opcional */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
