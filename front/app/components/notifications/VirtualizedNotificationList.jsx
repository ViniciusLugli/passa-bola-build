/**
 * VirtualizedNotificationList Component
 *
 * Lista virtualizada para renderizar grandes quantidades de notificações
 * de forma performática, renderizando apenas os itens visíveis.
 */

import React, { useMemo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";

const ITEM_HEIGHT = 120; // Altura estimada de cada notificação em pixels
const OVERSCAN_COUNT = 5; // Número de itens extras para renderizar fora da viewport

const VirtualizedNotificationList = ({
  notifications,
  onNotificationClick,
  onNotificationAction,
  renderNotification,
  height = 600,
  className = "",
  emptyMessage = "Nenhuma notificação encontrada",
}) => {
  // Memoiza as notificações para evitar re-renders desnecessários
  const memoizedNotifications = useMemo(() => notifications, [notifications]);

  // Renderiza um item individual da lista
  const renderItem = useCallback(
    ({ index, style }) => {
      const notification = memoizedNotifications[index];

      if (!notification) {
        return (
          <div style={style} className="flex items-center justify-center p-4">
            <div className="text-gray-500">Carregando...</div>
          </div>
        );
      }

      return (
        <div style={style} className="px-4 py-2">
          {renderNotification ? (
            renderNotification(notification, {
              onClick: onNotificationClick,
              onAction: onNotificationAction,
            })
          ) : (
            <DefaultNotificationItem
              notification={notification}
              onClick={onNotificationClick}
              onAction={onNotificationAction}
            />
          )}
        </div>
      );
    },
    [
      memoizedNotifications,
      renderNotification,
      onNotificationClick,
      onNotificationAction,
    ]
  );

  // Se não há notificações, renderiza mensagem vazia
  if (!notifications || notifications.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2">📬</div>
          <div>{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={notifications.length}
        itemSize={ITEM_HEIGHT}
        overscanCount={OVERSCAN_COUNT}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {renderItem}
      </List>
    </div>
  );
};

/**
 * Componente padrão para renderizar notificações
 */
const DefaultNotificationItem = ({ notification, onClick, onAction }) => {
  const handleClick = useCallback(() => {
    onClick?.(notification);
  }, [notification, onClick]);

  const handleAction = useCallback(
    (e) => {
      e.stopPropagation();
      onAction?.(notification);
    },
    [notification, onAction]
  );

  return (
    <div
      className={`
        border rounded-lg p-4 cursor-pointer transition-all duration-200
        hover:shadow-md hover:scale-[1.02]
        ${notification.isRead ? "bg-gray-50" : "bg-white border-blue-200"}
        ${notification.colors || "border-gray-200"}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Ícone da notificação */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-lg">{notification.icon || "🔔"}</span>
        </div>

        {/* Conteúdo da notificação */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Nome do remetente */}
              {notification.senderName && (
                <p className="text-sm font-medium text-gray-900 truncate">
                  {notification.senderName}
                </p>
              )}

              {/* Mensagem */}
              <p
                className={`text-sm mt-1 ${
                  notification.isRead ? "text-gray-600" : "text-gray-900"
                }`}
              >
                {notification.message}
              </p>

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-2">
                {notification.formattedDate ||
                  new Date(notification.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Badge não lida e ações */}
            <div className="flex flex-col items-end space-y-2">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}

              {notification.isActionable && (
                <button
                  onClick={handleAction}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Ver
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedNotificationList;

/**
 * Hook para calcular altura dinâmica baseada no container
 */
export const useVirtualListHeight = (
  containerRef,
  maxHeight = 600,
  padding = 20
) => {
  const [height, setHeight] = React.useState(maxHeight);

  React.useEffect(() => {
    if (!containerRef?.current) return;

    const updateHeight = () => {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - padding;
      const calculatedHeight = Math.min(availableHeight, maxHeight);
      setHeight(Math.max(calculatedHeight, 200)); // Altura mínima de 200px
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [containerRef, maxHeight, padding]);

  return height;
};
