"use client";

import { useChat } from "@/app/context/ChatContext";

export default function ConversationItem({ conversation, isActive, onClick }) {
  const { isUserOnline } = useChat();
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Agora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getParticipantName = () => {
    return conversation.otherName || conversation.participantName || "Usuário";
  };

  // Check real-time online status from WebSocket presence
  const isOnline = isUserOnline(conversation.otherUserId);

  const getOnlineStatus = () => {
    if (isOnline) {
      return "Ativo agora";
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        p-4
        min-h-20
        cursor-pointer
        transition-all
        duration-200
        hover:bg-surface
        active:scale-[0.98]
        touch-manipulation
        ${
          isActive
            ? "bg-accent-soft border-l-4 border-l-accent shadow-elevated"
            : "bg-surface-muted hover:bg-surface"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar with online indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-accent font-semibold text-lg">
                {getParticipantName().charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Online indicator dot */}
            {isOnline && (
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-surface-muted animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary truncate">
                {getParticipantName()}
              </h3>
              <span className="text-xs text-tertiary shrink-0 ml-2">
                {formatDate(conversation.lastMessageTime)}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex-1 min-w-0">
                {/* Online status text */}
                {getOnlineStatus() ? (
                  <p className="text-xs text-accent font-medium">
                    {getOnlineStatus()}
                  </p>
                ) : conversation.lastMessage ? (
                  <p className="text-sm text-secondary truncate">
                    {conversation.lastMessage}
                  </p>
                ) : (
                  <p className="text-sm text-tertiary italic">
                    Nenhuma mensagem
                  </p>
                )}
              </div>

              {conversation.unreadCount > 0 && (
                <span className="bg-accent text-on-brand text-xs rounded-full px-2.5 py-1 min-w-6 h-6 text-center font-bold shrink-0 ml-2 flex items-center justify-center">
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
