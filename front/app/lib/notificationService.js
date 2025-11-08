/**
 * Notification Service
 *
 * Serviço centralizado para gerenciar notificações push em tempo real.
 * Integra com o backend via WebSocket (STOMP) e fornece métodos para
 * gerenciar notificações localmente.
 */

import { api } from "./api";
import {
  generateNotificationMessage,
  generateNotificationActionUrl,
  getNotificationConfig,
  sortNotificationsByPriority,
  NOTIFICATION_TYPES,
} from "./notificationTypes";

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.isInitialized = false;
  }

  /**
   * Initialize notification service
   */
  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log("[NotificationService] Initialized");
  }

  /**
   * Add listener for notification events
   * @param {Function} callback - Callback to receive notifications
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   * @param {Object} notification - Notification object
   */
  notifyListeners(notification) {
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("[NotificationService] Error in listener:", error);
      }
    });
  }

  /**
   * Handle incoming notification from WebSocket
   * @param {Object} notification - Notification from server
   */
  handleIncomingNotification(notification) {
    console.log("[NotificationService] Received notification:", notification);

    // Show browser notification if permitted
    this.showBrowserNotification(notification);

    // Notify listeners
    this.notifyListeners(notification);
  }

  /**
   * Show browser native notification
   * @param {Object} notification - Notification object
   */
  showBrowserNotification(notification) {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      const title = notification.title || "Nova notificação";
      const body = notification.message || notification.content || "";
      const icon = this.getIconForType(notification.type);

      try {
        const browserNotif = new Notification(title, {
          body,
          icon: icon || "/icons/logo.svg",
          badge: "/icons/badge.svg",
          tag: notification.id?.toString() || `notif-${Date.now()}`,
          requireInteraction: false,
          silent: false,
        });

        // Navigate to link on click
        browserNotif.onclick = () => {
          if (notification.link) {
            window.focus();
            window.location.href = notification.link;
          }
          browserNotif.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => browserNotif.close(), 5000);
      } catch (error) {
        console.error(
          "[NotificationService] Error showing browser notification:",
          error
        );
      }
    } else if (Notification.permission === "default") {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          this.showBrowserNotification(notification);
        }
      });
    }
  }

  /**
   * Get icon for notification type
   * @param {string} type - Notification type
   * @returns {string} Icon URL
   */
  getIconForType(type) {
    const iconMap = {
      NEW_FOLLOWER: "/icons/user-plus.svg",
      POST_LIKE: "/icons/heart.svg",
      TEAM_INVITE: "/icons/users.svg",
      TEAM_INVITE_RECEIVED: "/icons/users.svg", // Backend type
      GAME_INVITE: "/icons/calendar.svg",
      GAME_INVITE_RECEIVED: "/icons/calendar.svg", // Backend type
      SYSTEM: "/icons/bell.svg",
      NEW_POST: "/icons/file-text.svg",
      GAME_UPDATE: "/icons/refresh-cw.svg",
      COMMENT: "/icons/message-square.svg",
      TEAM_JOIN: "/icons/user-check.svg",
      GAME_RESULT: "/icons/trophy.svg",
    };

    return iconMap[type] || "/icons/bell.svg";
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error(
        "[NotificationService] Error requesting permission:",
        error
      );
      return false;
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   */
  async markAsRead(notificationId) {
    try {
      await api.notifications.markAsRead(notificationId);
      return true;
    } catch (error) {
      console.error("[NotificationService] Error marking as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await api.notifications.markAllAsRead();
      return true;
    } catch (error) {
      console.error("[NotificationService] Error marking all as read:", error);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {number} notificationId - Notification ID
   */
  async deleteNotification(notificationId) {
    try {
      await api.notifications.delete(notificationId);
      return true;
    } catch (error) {
      console.error(
        "[NotificationService] Error deleting notification:",
        error
      );
      throw error;
    }
  }

  /**
   * Get unread count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const response = await api.notifications.getUnreadCount();
      return response.unreadCount || 0;
    } catch (error) {
      console.error("[NotificationService] Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Get all notifications
   * @param {Object} params - Query params (page, size)
   * @returns {Promise<Array>} Notifications
   */
  async getAllNotifications(params = {}) {
    try {
      const response = await api.notifications.getAll(params);
      return response.content || [];
    } catch (error) {
      console.error(
        "[NotificationService] Error getting notifications:",
        error
      );
      return [];
    }
  }

  /**
   * Get unread notifications
   * @param {Object} params - Query params (page, size)
   * @returns {Promise<Array>} Unread notifications
   */
  async getUnreadNotifications(params = {}) {
    try {
      const response = await api.notifications.getUnread(params);
      return response.content || [];
    } catch (error) {
      console.error(
        "[NotificationService] Error getting unread notifications:",
        error
      );
      return [];
    }
  }

  /**
   * Get recent notifications (24h)
   * @returns {Promise<Array>} Recent notifications
   */
  async getRecentNotifications() {
    try {
      const response = await api.notifications.getRecent();
      return response.content || [];
    } catch (error) {
      console.error(
        "[NotificationService] Error getting recent notifications:",
        error
      );
      return [];
    }
  }

  /**
   * Create user-friendly notification message
   * @param {Object} notification - Raw notification from server
   * @returns {Object} Formatted notification
   */
  formatNotification(notification) {
    // CRITICAL: Parse metadata from JSON string to object if needed
    let parsedMetadata = notification.metadata || {};
    if (typeof notification.metadata === "string") {
      try {
        parsedMetadata = JSON.parse(notification.metadata);
      } catch (e) {
        console.warn("[NotificationService] Failed to parse metadata:", e);
        parsedMetadata = {};
      }
    }

    const config = getNotificationConfig(notification.type);

    // Generate message using the new system
    const message =
      notification.message ||
      generateNotificationMessage(
        notification.type,
        parsedMetadata,
        notification.senderName
      );

    // Generate action URL using the new system
    const actionUrl =
      notification.actionUrl ||
      generateNotificationActionUrl(notification.type, parsedMetadata);

    // Return formatted notification with enhanced data
    return {
      ...notification,
      metadata: parsedMetadata,
      message,
      actionUrl,
      config,
      icon: config.icon,
      colors: config.colors,
      priority: config.priority,
      formattedDate: this.formatNotificationDate(notification.createdAt),
      isActionable: this.requiresUserAction(notification.type),
      shouldShowToast: this.shouldShowAsToast(
        notification.type,
        config.priority
      ),
      // Ensure these fields are always present
      id: notification.id,
      senderId: notification.senderId,
      senderType: notification.senderType,
      senderUsername: notification.senderUsername,
      senderName: notification.senderName,
      type: notification.type,
      isRead: notification.isRead || notification.read || false,
      read: notification.isRead || notification.read || false, // Support both field names
      createdAt: notification.createdAt,
      readAt: notification.readAt || null,
    };
  }

  /**
   * Check if notification requires user action
   * @param {string} type - Notification type
   * @returns {boolean}
   */
  requiresUserAction(type) {
    const actionableTypes = [
      NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED,
      NOTIFICATION_TYPES.GAME_INVITATION,
    ];
    return actionableTypes.includes(type);
  }

  /**
   * Check if notification should show as toast
   * @param {string} type - Notification type
   * @param {string} priority - Notification priority
   * @returns {boolean}
   */
  shouldShowAsToast(type, priority = "low") {
    const toastTypes = [
      NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED,
      NOTIFICATION_TYPES.GAME_INVITATION,
      NOTIFICATION_TYPES.GAME_REMINDER,
      NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED,
    ];
    return toastTypes.includes(type) || priority === "high";
  }

  /**
   * Format notification date to human-readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatNotificationDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    // For older dates, show formatted date
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  /**
   * Sort notifications by priority and timestamp
   * @param {Array} notifications - Notifications array
   * @returns {Array} Sorted notifications
   */
  sortNotificationsByPriority(notifications) {
    return sortNotificationsByPriority(notifications);
  }

  /**
   * Cleanup service
   */
  cleanup() {
    this.listeners.clear();
    this.isInitialized = false;
    console.log("[NotificationService] Cleaned up");
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class
export { NotificationService };
