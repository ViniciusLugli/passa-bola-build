/**
 * Rotas de Notificações baseadas na documentação oficial da API
 *
 * Endpoints disponíveis:
 * - GET /api/notifications - Listar todas (paginado)
 * - GET /api/notifications/unread - Listar não lidas (paginado)
 * - GET /api/notifications/unread/count - Contar não lidas
 * - GET /api/notifications/recent - Notificações recentes (24h)
 * - PATCH /api/notifications/{id}/read - Marcar como lida
 * - PATCH /api/notifications/read-all - Marcar todas como lidas
 * - DELETE /api/notifications/{id} - Deletar notificação
 *
 * Documentação: /api/notifications/*
 */
export default function createNotificationRoutes(fetchApi) {
  return {
    // GET /api/notifications?page=0&size=20
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);

      const queryString = queryParams.toString();
      return fetchApi(`/notifications${queryString ? `?${queryString}` : ""}`);
    },

    // GET /api/notifications/unread?page=0&size=20
    getUnread: (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);

      const queryString = queryParams.toString();
      return fetchApi(
        `/notifications/unread${queryString ? `?${queryString}` : ""}`
      );
    },

    // GET /api/notifications/unread/count
    getUnreadCount: () => fetchApi("/notifications/unread/count"),

    // GET /api/notifications/recent
    getRecent: () => fetchApi("/notifications/recent"),

    // PATCH /api/notifications/{id}/read
    markAsRead: (id) =>
      fetchApi(`/notifications/${id}/read`, { method: "PATCH" }),

    // PATCH /api/notifications/read-all
    markAllAsRead: () =>
      fetchApi("/notifications/read-all", { method: "PATCH" }),

    // DELETE /api/notifications/{id}
    delete: (id) => fetchApi(`/notifications/${id}`, { method: "DELETE" }),
  };
}
