import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/app/lib/api";

/**
 * Custom hook for managing chat messages and sending logic
 * IMPROVED: Prevents duplicate API calls with proper guards
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

  // Track the last conversation we fetched messages for
  const lastFetchedConversationRef = useRef(null);
  const isFetchingRef = useRef(false);

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
      // Prevent duplicate fetches for the same conversation
      if (
        isFetchingRef.current ||
        lastFetchedConversationRef.current === String(otherUserId)
      ) {
        console.log(
          "[useChatMessages] Skipping duplicate fetch for:",
          otherUserId
        );
        return;
      }

      console.log("[useChatMessages] Fetching messages for:", otherUserId);
      isFetchingRef.current = true;
      setLoadingMessages(true);

      try {
        const fetchedMessages = await api.chats.getConversation(otherUserId);
        setConversationMessages(
          otherUserId,
          Array.isArray(fetchedMessages) ? fetchedMessages : []
        );

        // Mark messages as read
        await api.chats.markAsRead(otherUserId);

        // Mark this conversation as fetched
        lastFetchedConversationRef.current = String(otherUserId);
      } catch (err) {
        console.error("[useChatMessages] Error fetching messages:", err);
        onError?.("Erro ao carregar mensagens.");
      } finally {
        setLoadingMessages(false);
        isFetchingRef.current = false;
      }
    },
    [setConversationMessages, onError]
  );

  // Reset fetch guard when active conversation changes
  useEffect(() => {
    if (activeConversation?.otherUserId) {
      const currentUserId = String(activeConversation.otherUserId);
      if (lastFetchedConversationRef.current !== currentUserId) {
        lastFetchedConversationRef.current = null; // Reset guard for new conversation
      }
    }
  }, [activeConversation?.otherUserId]);

  const sendMessage = useCallback(
    async (content) => {
      if (!activeConversation || !user) return;

      setSending(true);

      try {
        // Send message directly without optimistic updates
        const sentViaWS = sendMessageViaWebSocket(
          activeConversation.otherUserId,
          content
        );

        if (!sentViaWS) {
          console.log("[useChatMessages] Sending via HTTP fallback");
          await api.chats.sendMessage(activeConversation.otherUserId, content);
        } else {
          console.log("[useChatMessages] Sent via WebSocket");
        }

        // Update conversation timestamp only (no optimistic message)
        onUpdateConversation?.(
          activeConversation.otherUserId,
          content,
          new Date().toISOString()
        );
      } catch (err) {
        console.error("[useChatMessages] Error sending message:", err);
        onError?.("Erro ao enviar mensagem.");
      } finally {
        setSending(false);
      }
    },
    [
      activeConversation,
      user,
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
