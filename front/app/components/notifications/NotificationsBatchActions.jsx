import { Check, Trash2 } from "lucide-react";

/**
 * Componente de ações em lote para notificações selecionadas
 * Exibe contador de selecionadas e botões de ação
 *
 * @param {number} selectedCount - Quantidade de notificações selecionadas
 * @param {Function} onMarkAsRead - Callback para marcar selecionadas como lidas
 * @param {Function} onDelete - Callback para deletar selecionadas
 * @param {Function} onClearSelection - Callback para limpar seleção
 * @param {boolean} loading - Loading state das ações
 */
export default function NotificationsBatchActions({
  selectedCount,
  onMarkAsRead,
  onDelete,
  onClearSelection,
  loading,
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Ações de notificações selecionadas"
      className="transform transition-all duration-200 ease-out flex flex-col md:flex-row items-center justify-between gap-3 p-3 md:p-4 bg-surface-muted border border-default rounded-md shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="text-sm text-secondary font-medium" aria-hidden>
          {selectedCount}
        </div>
        <div className="text-sm text-secondary">
          selecionada{selectedCount > 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={onMarkAsRead}
          disabled={loading}
          className="px-4 py-3 text-sm md:px-3 md:py-2 bg-accent text-on-brand rounded inline-flex items-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          <span>Marcar</span>
        </button>
        <button
          onClick={onDelete}
          disabled={loading}
          className="px-4 py-3 text-sm md:px-3 md:py-2 bg-red-500 text-white rounded inline-flex items-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span>Deletar</span>
        </button>
        <button
          onClick={onClearSelection}
          disabled={loading}
          className="px-2.5 py-1 text-sm text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpar seleção
        </button>
      </div>
    </div>
  );
}
