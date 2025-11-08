"use client";

export default function CalendarHeader({
  viewYear,
  viewMonth,
  onPrev,
  onNext,
  onClear,
  hasFilters,
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm sm:text-lg font-semibold text-primary">
        Calendário
      </h3>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-md bg-surface text-primary border border-default"
          aria-label="Mês anterior"
        >
          ◀
        </button>
        <div className="text-xs sm:text-sm font-medium">
          {new Date(viewYear, viewMonth, 1).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          onClick={onNext}
          className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-md bg-surface text-primary border border-default"
          aria-label="Próximo mês"
        >
          ▶
        </button>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs sm:text-sm text-secondary underline ml-3"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
