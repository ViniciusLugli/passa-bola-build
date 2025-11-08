"use client";

import { useAuth } from "@/app/context/AuthContext";

export default function MessageBubble({ message }) {
  const { user } = useAuth();

  // Normalize IDs for comparison (handle both string and number types)
  const normalizeId = (id) => {
    if (id === null || id === undefined) return null;
    return String(id);
  };

  const messageSenderId = normalizeId(message.senderId);
  const currentUserId = normalizeId(user?.userId || user?.id);

  const isOwnMessage = messageSenderId === currentUserId;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`
          max-w-[70%]
          min-h-[48px]
          rounded-2xl
          px-4
          py-3
          transition-all
          duration-200
          ${
            isOwnMessage
              ? "bg-accent text-on-brand shadow-md hover:shadow-lg"
              : "bg-surface-muted border border-default text-primary hover:border-accent/30"
          }
        `}
      >
        {!isOwnMessage && message.senderName && (
          <p className="text-xs font-semibold mb-1 text-secondary">
            {message.senderName}
          </p>
        )}

        <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>

        <div className="flex items-center justify-between gap-2 mt-2">
          <p
            className={`text-xs ${
              isOwnMessage
                ? "text-on-brand opacity-80"
                : "text-secondary opacity-80"
            }`}
          >
            {formatTime(message.createdAt || message.sentAt)}
          </p>

          {/* Message delivery status - only for own messages */}
          {isOwnMessage && (
            <div className="flex items-center gap-1">
              {message.isRead ? (
                // Read - double check marks
                <svg
                  className="w-4 h-4 text-on-brand opacity-90"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M14.707 5.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L8 10.586l5.293-5.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                // Sent - single check mark
                <svg
                  className="w-4 h-4 text-on-brand opacity-70"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
