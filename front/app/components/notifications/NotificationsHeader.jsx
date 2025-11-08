/**
 * Componente de cabeçalho da página de notificações
 * Inclui botão voltar, título, contador, status de conexão e helpers de dev
 *
 * @param {Function} onBack - Callback para voltar à página anterior
 * @param {number} unreadCount - Quantidade de notificações não lidas
 * @param {boolean} isConnected - Status da conexão WebSocket
 * @param {Function} onAddMocks - Callback para adicionar notificações mock (dev only)
 */
export default function NotificationsHeader({
  onBack,
  unreadCount,
  isConnected,
  onAddMocks,
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="absolute top-4 md:top-8 right-4 md:right-8 text-tertiary hover:text-secondary transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 md:w-7 md:h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Notificações
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-secondary mt-1">
              {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
            </p>
          )}
        </div>

        {/* Dev helpers: adicionar mocks */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-3 md:mt-0">
            <button
              onClick={onAddMocks}
              className="px-3 py-1.5 text-sm font-medium bg-surface-muted border border-default rounded-md hover:bg-surface-elevated"
            >
              Adicionar mocks
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div
            className={`
              w-2 h-2 rounded-full
              ${isConnected ? "bg-green-500" : "bg-red-500"}
            `}
            title={isConnected ? "Conectado" : "Desconectado"}
          ></div>
          <span className="text-xs text-secondary">
            {isConnected ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </>
  );
}
