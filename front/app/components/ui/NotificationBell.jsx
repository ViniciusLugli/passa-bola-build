"use client";

import { useNotifications } from "@/app/context/NotificationContext";
import { Bell } from "lucide-react";

/**
 * NotificationBell Component
 *
 * Displays notification bell icon with unread count badge.
 * Shows connection status. Designed to be wrapped in a Link by parent.
 */
export default function NotificationBell() {
  const { unreadCount, isConnected } = useNotifications();

  return (
    <div
      className="relative inline-flex items-center justify-center"
      aria-label={`Notificações${
        unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""
      }`}
    >
      {/* Bell Icon */}
      <Bell
        className={`w-6 h-6 ${unreadCount > 0 ? "text-accent" : "text-white"}`}
        strokeWidth={2}
      />

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-surface"
          aria-hidden="true"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Connection Status Indicator (only visible when disconnected) */}
      {!isConnected && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-surface rounded-full"
          title="Desconectado - reconectando..."
          aria-label="Desconectado"
        />
      )}

      {/* Screen Reader Text */}
      <span className="sr-only">
        {unreadCount > 0
          ? `Você tem ${unreadCount} notificações não lidas`
          : "Sem notificações não lidas"}
      </span>
    </div>
  );
}
