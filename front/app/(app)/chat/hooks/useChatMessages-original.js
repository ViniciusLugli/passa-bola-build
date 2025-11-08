import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/app/lib/api";

/**
 * Custom hook for managing chat messages and sending logic
 * Handles message fetching, optimistic updates, and WebSocket fallback
 */
export function useChatMessages({
  activeConversation,
  user,
  messages,
  setConversationMessages,
  addMessageLocally,
  sendMessageViaWebSocket,
  onUpdateConversation,
  onError,
}) {
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const hasScrolledRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (!hasScrolledRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      hasScrolledRef.current = true;
      setTimeout(() => {
        hasScrolledRef.current = false;
      }, 100);
    }
  }, []);

  const activeMessages = activeConversation
    ? messages[activeConversation.otherUserId] || []
    : [];

  // Auto-scroll on new messages
  useEffect(() => {
    if (activeConversation && activeMessages.length > 0) {
      scrollToBottom();
    }
  }, [activeConversation, activeMessages.length, scrollToBottom]);

  const fetchMessages = useCallback(
    async (otherUserId) => {
      setLoadingMessages(true);

      try {
        const fetchedMessages = await api.chats.getConversation(otherUserId);
        setConversationMessages(
          otherUserId,
          Array.isArray(fetchedMessages) ? fetchedMessages : []
        );

        // Mark messages as read
        await api.chats.markAsRead(otherUserId);
      } catch (err) {
        console.error("[useChatMessages] Error fetching messages:", err);
        onError?.("Erro ao carregar mensagens.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [setConversationMessages, onError]
  );

  const sendMessage = useCallback(
    async (content) => {
      if (!activeConversation || !user) return;

      setSending(true);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content,
        senderId: user.userId,
        senderName: user.name,
        senderUsername: user.username,
        recipientId: activeConversation.otherUserId,
        recipientName: activeConversation.otherName,
        recipientUsername: activeConversation.otherUsername,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Optimistic UI updates
      addMessageLocally(activeConversation.otherUserId, optimisticMessage);
      onUpdateConversation?.(
        activeConversation.otherUserId,
        content,
        optimisticMessage.createdAt
      );

      try {
        // Try WebSocket first, fallback to HTTP
        const sentViaWS = sendMessageViaWebSocket(
          activeConversation.otherUserId,
          content
        );

        if (!sentViaWS) {
          await api.chats.sendMessage(activeConversation.otherUserId, content);
        }
      } catch (err) {
        console.error("[useChatMessages] Error sending message:", err);
        onError?.("Erro ao enviar mensagem.");

        // TODO: Implement retry logic or mark message as failed
      } finally {
        setSending(false);
      }
    },
    [
      activeConversation,
      user,
      addMessageLocally,
      sendMessageViaWebSocket,
      onUpdateConversation,
      onError,
    ]
  );

  return {
    activeMessages,
    loadingMessages,
    sending,
    messagesEndRef,
    fetchMessages,
    sendMessage,
  };
}
