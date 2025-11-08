/**
 * Componente de abas de filtro para notificações
 * Exibe abas "Todas", "Não Lidas" e "Lidas" com contadores
 *
 * @param {string} activeFilter - Filtro ativo ("all" | "unread" | "read")
 * @param {Function} onFilterChange - Callback quando o filtro muda
 * @param {Object} counts - Contadores de notificações { all, unread, read }
 * @param {Function} onMarkAllAsRead - Callback para marcar todas como lidas
 * @param {Function} onDeleteAllRead - Callback para deletar todas lidas
 * @param {number} unreadCount - Quantidade de notificações não lidas
 * @param {boolean} hasReadNotifications - Se existem notificações lidas
 * @param {boolean} deleteAllLoading - Loading ao deletar todas lidas
 */
export default function NotificationsTabs({
  activeFilter,
  onFilterChange,
  counts,
  onMarkAllAsRead,
  onDeleteAllRead,
  unreadCount,
  hasReadNotifications,
  deleteAllLoading,
}) {
  const tabs = [
    { key: "all", label: "Todas" },
    { key: "unread", label: "Não Lidas" },
    { key: "read", label: "Lidas" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <div
        role="tablist"
        aria-label="Filtros de notificações"
        className="flex gap-2 flex-wrap border-b border-default pb-3"
      >
        {tabs.map(({ key, label }) => {
          const count = counts[key];
          const isActive = activeFilter === key;

          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-label={`${label} (${count} notificações)`}
              onClick={() => onFilterChange(key)}
              className={`
                relative px-4 py-2.5 text-sm font-medium transition-all
                ${
                  isActive
                    ? "text-accent"
                    : "text-secondary hover:text-primary"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span>{label}</span>
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold
                    ${
                      isActive
                        ? "bg-accent text-on-brand"
                        : "bg-surface-muted text-tertiary"
                    }
                  `}
                >
                  {count}
                </span>
              </span>
              {/* Borda inferior para tab ativa */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent transition-all" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="px-3 py-1.5 text-sm font-medium text-accent hover:text-accent-strong transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
        {hasReadNotifications && (
          <button
            onClick={onDeleteAllRead}
            disabled={deleteAllLoading}
            className="px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteAllLoading ? "Deletando..." : "Limpar lidas"}
          </button>
        )}
      </div>
    </div>
  );
}
