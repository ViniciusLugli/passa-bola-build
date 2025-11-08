import MessageBubble from "@/app/components/chat/MessageBubble";
import MessageInput from "@/app/components/chat/MessageInput";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";
import EmptyState from "@/app/components/ui/EmptyState";
import { MessageCircle } from "lucide-react";

/**
 * Main chat window displaying messages and input
 */
export default function ChatWindow({
  conversation,
  messages,
  isUserOnline,
  loadingMessages,
  sending,
  messagesEndRef,
  onSendMessage,
  onBack,
}) {
  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-surface">
      {/* Fixed Header - doesn't scroll */}
      <ChatHeader
        conversation={conversation}
        isUserOnline={isUserOnline}
        onBack={onBack}
      />

      {/* Scrollable Messages Area - independent scroll, fills available space */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto chat-scroll">
          <div className="p-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <LoadingSkeleton count={3} variant="list" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <EmptyState
                  icon={<MessageCircle />}
                  title="Nenhuma mensagem ainda"
                  description="Envie a primeira mensagem para começar a conversa!"
                  variant="default"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2 min-h-full">
                {messages.map((message, index) => (
                  <MessageBubble key={message.id || index} message={message} />
                ))}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input - doesn't scroll, stays at bottom */}
      <div className="shrink-0 border-t border-default bg-surface">
        <MessageInput
          onSend={onSendMessage}
          disabled={sending || loadingMessages}
        />
      </div>
    </div>
  );
}

function ChatHeader({ conversation, isUserOnline, onBack }) {
  const isOnline = isUserOnline(conversation.otherUserId);

  return (
    <div className="shrink-0 p-4 border-b border-default bg-surface-muted">
      <div className="flex items-center gap-3">
        {/* Back Button - Mobile Only */}
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-surface rounded-lg transition-all duration-200 min-w-11 min-h-11 flex items-center justify-center active:scale-95 touch-optimized"
          aria-label="Voltar para conversas"
          type="button"
        >
          <svg
            className="w-5 h-5 text-primary transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-accent font-semibold">
              {(conversation.otherName || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-muted animate-pulse" />
          )}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-primary truncate">
            {conversation.otherName || "Usuário"}
          </h3>
          {conversation.otherUsername && (
            <p className="text-sm text-secondary truncate">
              @{conversation.otherUsername}
            </p>
          )}
          {isOnline && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              Ativo agora
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
