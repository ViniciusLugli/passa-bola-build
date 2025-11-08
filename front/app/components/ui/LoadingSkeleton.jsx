import React from "react";

/**
 * LoadingSkeleton - Componente de skeleton loading com shimmer animation
 *
 * @param {number} count - Número de skeletons a exibir (padrão: 3)
 * @param {string} variant - Variante: 'card' | 'list' | 'post' | 'notification'
 * @param {string} className - Classes CSS adicionais
 */
export default function LoadingSkeleton({
  count = 3,
  variant = "card",
  className = "",
}) {
  const variants = {
    card: (
      <div className="bg-surface border border-default rounded-xl p-4 contain-paint">
        <div className="skeleton-text w-1/3 mb-3" />
        <div className="skeleton-text w-full mb-2" />
        <div className="skeleton-text w-5/6" />
      </div>
    ),
    list: (
      <div className="flex items-center gap-3 bg-surface border border-default rounded-xl p-3 contain-paint">
        <div className="skeleton-avatar flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-text w-1/2" />
          <div className="skeleton-text w-3/4" />
        </div>
      </div>
    ),
    post: (
      <div className="bg-surface border border-default rounded-xl p-4 contain-paint">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton-avatar flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-text w-1/3" />
            <div className="skeleton-text w-1/4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton-text w-full" />
          <div className="skeleton-text w-full" />
          <div className="skeleton-text w-4/5" />
        </div>
        <div className="flex gap-4 mt-4">
          <div className="skeleton-button w-20" />
          <div className="skeleton-button w-20" />
        </div>
      </div>
    ),
    notification: (
      <div className="bg-surface border border-default rounded-xl p-4 contain-paint">
        <div className="flex items-start gap-3">
          <div className="skeleton-avatar flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-text w-2/3" />
            <div className="skeleton-text w-full" />
            <div className="skeleton-text w-1/4 mt-3" />
          </div>
        </div>
      </div>
    ),
    game: (
      <div className="bg-surface border border-default rounded-xl p-4 sm:p-5 contain-paint">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="skeleton-text w-2/3 mb-2 h-6" />
            <div className="skeleton-text w-1/3 mb-2" />
            <div className="skeleton-text w-1/2" />
          </div>
          <div className="skeleton-button w-24 h-10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="skeleton-text h-16 rounded-lg" />
          <div className="skeleton-text h-16 rounded-lg" />
          <div className="skeleton-text h-16 rounded-lg" />
          <div className="skeleton-text h-16 rounded-lg" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="skeleton-button w-20 h-8" />
          <div className="skeleton-button w-24 h-8" />
          <div className="skeleton-button w-16 h-8" />
        </div>
      </div>
    ),
  };

  const skeletonTemplate = variants[variant] || variants.card;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando conteúdo"
      className={`space-y-4 ${className}`}
    >
      <span className="sr-only">Carregando conteúdo...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="fade-in">
          {skeletonTemplate}
        </div>
      ))}
    </div>
  );
}
