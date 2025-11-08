/**
 * Rotas de Chat baseadas na documentação oficial da API
 *
 * IMPORTANTE:
 * - recipientId e senderId são SEMPRE userId global (snowflake)
 * - otherUserId também é userId global
 * - Não existem IDs de "chat" ou "conversa" - apenas userId dos participantes
 *
 * Documentação: /api/chat/*
 */
export default function createChatRoutes(fetchApi) {
  return {
    // Listar todas as conversas do usuário autenticado
    // GET /api/chat/conversations
    getConversations: () => fetchApi("/chat/conversations"),

    // Buscar histórico de conversa com outro usuário
    // GET /api/chat/conversation/{otherUserId}
    // IMPORTANTE: otherUserId é o userId global (snowflake) do outro usuário
    getConversation: (otherUserId) =>
      fetchApi(`/chat/conversation/${otherUserId}`),

    // Buscar histórico paginado
    // GET /api/chat/conversation/{otherUserId}/paginated?page=0&size=50
    getConversationPaginated: (otherUserId, params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page);
      if (params.size !== undefined) queryParams.append("size", params.size);

      const queryString = queryParams.toString();
      return fetchApi(
        `/chat/conversation/${otherUserId}/paginated${
          queryString ? `?${queryString}` : ""
        }`
      );
    },

    // Enviar mensagem via REST (fallback do WebSocket)
    // POST /api/chat/send
    // Body: { recipientId: userId_global, content: "mensagem" }
    sendMessage: (recipientId, content) =>
      fetchApi("/chat/send", {
        method: "POST",
        body: { recipientId, content },
      }),

    // Marcar todas as mensagens de um remetente como lidas
    // PUT /api/chat/read/{senderId}
    // IMPORTANTE: senderId é o userId global (snowflake) do remetente
    markAsRead: (senderId) =>
      fetchApi(`/chat/read/${senderId}`, { method: "PUT" }),

    // Contar mensagens não lidas
    // GET /api/chat/unread/count
    getUnreadCount: () => fetchApi("/chat/unread/count"),

    // Listar mensagens não lidas
    // GET /api/chat/unread
    getUnreadMessages: () => fetchApi("/chat/unread"),
  };
}
