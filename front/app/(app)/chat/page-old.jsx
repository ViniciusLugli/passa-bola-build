"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/context/AuthContext";
import { useChat } from "@/app/context/ChatContext";
import { useChatPreferences } from "@/app/hooks/useChatPreferences";
import { useConversations } from "./hooks/useConversations";
import { useChatMessages } from "./hooks/useChatMessages";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import EmptyChatState from "./components/EmptyChatState";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { preferences, updatePreferences, isLoaded } = useChatPreferences();

  // Simple boolean state for mobile view
  const [showMobileChat, setShowMobileChat] = useState(false);
  const {
    setConversations,
    activeConversation,
    setActiveConversation,
    messages,
    isConnected,
    isUserOnline,
    subscribeToChat,
    unsubscribeFromChat,
    sendMessageViaWebSocket,
    addMessageLocally,
    setConversationMessages,
  } = useChat();

  // Stable callbacks to prevent infinite loops
  const handleError = useCallback(
    (message) => {
      showToast(message, "error");
    },
    [showToast]
  );

  const handleSessionExpired = useCallback(() => {
    showToast("Sessão expirada. Faça login novamente.", "error");
    setTimeout(() => router.push("/login"), 2000);
  }, [showToast, router]);

  // Custom hooks for conversations and messages management
  const {
    conversations,
    loading,
    fetchConversations,
    updateConversationOptimistically,
  } = useConversations({
    onError: handleError,
    onSessionExpired: handleSessionExpired,
  });

  const {
    activeMessages,
    loadingMessages,
    sending,
    messagesEndRef,
    fetchMessages,
    sendMessage,
  } = useChatMessages({
    activeConversation,
    user,
    messages,
    setConversationMessages,
    addMessageLocally,
    sendMessageViaWebSocket,
    onUpdateConversation: updateConversationOptimistically,
    onError: handleError,
  });

  // Auth check and initial data fetch
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only run on user change or mount

  // Sync conversations with ChatContext (only when conversations actually change)
  useEffect(() => {
    if (conversations.length >= 0) {
      setConversations(conversations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(conversations.map((c) => c.otherUserId))]); // Only update when conversation IDs change

  // WebSocket subscription management
  useEffect(() => {
    if (activeConversation?.otherUserId && isConnected) {
      subscribeToChat(activeConversation.otherUserId);

      return () => {
        unsubscribeFromChat(activeConversation.otherUserId);
      };
    }
  }, [
    activeConversation?.otherUserId,
    isConnected,
    subscribeToChat,
    unsubscribeFromChat,
  ]);

  // Memoize handleSelectConversation to prevent recreation on every render
  const handleSelectConversation = useCallback(
    (conversation) => {
      // Prevent rapid clicking
      if (isTransitioning) return;

      setIsTransitioning(true);

      // Set conversation in ChatContext immediately
      setActiveConversation(conversation);

      // Fetch messages
      fetchMessages(conversation.otherUserId);

      // Update preferences
      updatePreferences({ lastActiveConversation: conversation.otherUserId });

      // Switch to chat view
      setMobileView(MOBILE_VIEWS.CHAT);

      // Reset transition state
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [fetchMessages, setActiveConversation, updatePreferences, isTransitioning]
  );

  // Restore last active conversation from preferences
  useEffect(() => {
    if (
      isLoaded &&
      preferences.lastActiveConversation &&
      conversations.length > 0 &&
      !activeConversation
    ) {
      const lastConversation = conversations.find(
        (c) =>
          String(c.otherUserId) === String(preferences.lastActiveConversation)
      );

      if (lastConversation) {
        handleSelectConversation(lastConversation);
      }
    }
  }, [
    isLoaded,
    conversations,
    preferences.lastActiveConversation,
    activeConversation,
    handleSelectConversation,
  ]);

  const handleBackToConversations = useCallback(() => {
    // Prevent rapid clicking
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Clear active conversation and return to list
    setActiveConversation(null);
    setMobileView(MOBILE_VIEWS.CONVERSATIONS);

    // Reset transition state
    setTimeout(() => setIsTransitioning(false), 300);
  }, [setActiveConversation, isTransitioning]);

  if (loading) {
    return (
      <div className="fixed inset-0 top-[72px] flex items-center justify-center bg-background">
        <div className="bg-surface rounded-2xl border border-default shadow-elevated p-8 max-w-md w-full mx-4">
          <LoadingSkeleton count={5} variant="list" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-[72px] bg-background">
      {/* Full-screen chat layout - WhatsApp Web style */}
      <div className="h-full w-full bg-surface flex">
        {/* Conversation List - Mobile: show/hide based on view, Desktop: always visible sidebar */}
        <div
          className={`
            ${mobileView === MOBILE_VIEWS.CONVERSATIONS ? "flex" : "hidden"} 
            md:flex 
            ${mobileView === MOBILE_VIEWS.CONVERSATIONS ? "w-full" : "w-0"} 
            md:w-[380px]
            border-r 
            border-default 
            transition-all 
            duration-300 
            ease-in-out 
            shrink-0 
            bg-surface-muted
            ${isTransitioning ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            isConnected={isConnected}
            onSelectConversation={handleSelectConversation}
            className="w-full h-full"
          />
        </div>

        {/* Chat Window - Mobile: show/hide based on view, Desktop: always visible main area */}
        <div
          className={`
            ${mobileView === MOBILE_VIEWS.CHAT ? "flex" : "hidden"} 
            md:flex 
            flex-col 
            ${mobileView === MOBILE_VIEWS.CHAT ? "w-full" : "w-0"} 
            md:w-full
            transition-all 
            duration-300 
            ease-in-out 
            h-full 
            min-w-0
            ${isTransitioning ? "pointer-events-none opacity-50" : ""}
          `}
        >
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={activeMessages}
              isUserOnline={isUserOnline}
              loadingMessages={loadingMessages}
              sending={sending}
              messagesEndRef={messagesEndRef}
              onSendMessage={sendMessage}
              onBack={handleBackToConversations}
            />
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>
    </div>
  );
}
