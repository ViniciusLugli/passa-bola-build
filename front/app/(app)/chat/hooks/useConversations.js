import { useState, useCallback, useRef } from "react";
import { api } from "@/app/lib/api";

/**
 * Custom hook for managing chat conversations
 * Handles fetching, selection, and state management of conversations
 */
export function useConversations({ onError, onSessionExpired }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use ref to track if initial fetch was done to prevent loops
  const hasFetchedRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (hasFetchedRef.current && loading) {
      console.log("[useConversations] Fetch already in progress, skipping...");
      return conversations; // Return current conversations instead of []
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedConversations = await api.chats.getConversations();
      const conversationArray = Array.isArray(fetchedConversations)
        ? fetchedConversations
        : [];

      // CRITICAL: Normalize Snowflake IDs from backend (they come as NUMBER causing precision loss)
      // Convert all otherUserId to string to preserve 64-bit Snowflake IDs
      const normalizedConversations = conversationArray.map((conv) => ({
        ...conv,
        otherUserId: String(conv.otherUserId), // Prevent precision loss (8271349424307865000 → "8271349424307864352")
      }));

      console.log("[useConversations] Normalized conversations:", {
        original: conversationArray[0]?.otherUserId,
        normalized: normalizedConversations[0]?.otherUserId,
      });

      setConversations(normalizedConversations);
      hasFetchedRef.current = true; // Mark as fetched AFTER successful fetch
      return normalizedConversations;
    } catch (err) {
      console.error("[useConversations] Error fetching conversations:", err);
      setError(err);

      if (err.status === 403) {
        onSessionExpired?.();
      } else {
        onError?.(err.message || "Erro ao carregar conversas.");
      }

      return conversations; // Return current conversations on error
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError, onSessionExpired, conversations]); // Add conversations to deps

  const updateConversationOptimistically = useCallback(
    (otherUserId, lastMessage, timestamp) => {
      // Normalize otherUserId to string for comparison
      const normalizedOtherUserId = String(otherUserId);

      setConversations((prevConversations) => {
        const existingIndex = prevConversations.findIndex(
          (c) => String(c.otherUserId) === normalizedOtherUserId
        );

        if (existingIndex !== -1) {
          const updatedConversations = [...prevConversations];
          updatedConversations[existingIndex] = {
            ...updatedConversations[existingIndex],
            lastMessage,
            lastMessageTime: timestamp,
          };

          // Move to top
          const [updated] = updatedConversations.splice(existingIndex, 1);
          return [updated, ...updatedConversations];
        }

        // If conversation doesn't exist, it will be created on next fetch
        return prevConversations;
      });
    },
    []
  );

  return {
    conversations,
    setConversations,
    loading,
    error,
    fetchConversations,
    updateConversationOptimistically,
  };
}
