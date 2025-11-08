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
  const { updatePreferences } = useChatPreferences();

  // Simple state for mobile navigation
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

  // Handle conversation selection - CLEAN AND SIMPLE
  const handleSelectConversation = useCallback(
    (conversation) => {
      console.log(
        "[ChatPage] Selecting conversation:",
        conversation.otherUserId
      );

      setActiveConversation(conversation);
      fetchMessages(conversation.otherUserId);
      updatePreferences({ lastActiveConversation: conversation.otherUserId });
      setShowMobileChat(true);
    },
    [setActiveConversation, fetchMessages, updatePreferences]
  );

  // Handle back button - CLEAN AND SIMPLE
  const handleBackToConversations = useCallback(() => {
    console.log("[ChatPage] Going back to conversations");
    setShowMobileChat(false);
    setActiveConversation(null);
  }, [setActiveConversation]);

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
      {/* Full-screen chat layout */}
      <div className="h-full w-full bg-surface flex">
        {/* Conversation List */}
        <div
          className={`
            ${showMobileChat ? "hidden" : "flex"} 
            md:flex 
            w-full
            md:w-[380px]
            border-r 
            border-default 
            shrink-0 
            bg-surface-muted
            transition-all
            duration-300
            ease-in-out
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

        {/* Chat Window */}
        <div
          className={`
            ${showMobileChat ? "flex" : "hidden"} 
            md:flex 
            flex-col 
            w-full
            h-full 
            min-w-0
            transition-all
            duration-300
            ease-in-out
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
