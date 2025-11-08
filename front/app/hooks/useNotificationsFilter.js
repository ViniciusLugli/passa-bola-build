import { useState, useMemo } from "react";

/**
 * Hook personalizado para gerenciar filtros de notificações
 *
 * @param {Array} notifications - Array de notificações para filtrar
 * @returns {Object} Estado e métodos do filtro
 * @returns {string} filter - Filtro atual ("all" | "unread" | "read")
 * @returns {Function} setFilter - Função para alterar o filtro
 * @returns {Array} filteredNotifications - Notificações filtradas
 * @returns {Object} counts - Contagens de notificações por tipo
 */
export function useNotificationsFilter(notifications) {
  const [filter, setFilter] = useState("all");

  // Filtra notificações baseado no filtro atual
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (filter === "unread") return !notif.read;
      if (filter === "read") return notif.read;
      return true;
    });
  }, [notifications, filter]);

  // Calcula contadores para cada tipo de filtro
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      read: notifications.filter((n) => n.read).length,
    };
  }, [notifications]);

  return {
    filter,
    setFilter,
    filteredNotifications,
    counts,
  };
}
