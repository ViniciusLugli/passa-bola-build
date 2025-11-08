"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { error as logError } from "@/app/lib/logger";
import { useAuth } from "./AuthContext";
import { notificationService } from "@/app/lib/notificationService";
import { api } from "@/app/lib/api";

const NotificationContext = createContext();

const ENABLE_WEBSOCKET = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET !== "false";

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(null);

  // Use refs to store latest functions and avoid dependency issues
  const syncNotificationRef = useRef();
  const syncAfterReconnectionRef = useRef();
  const clientRef = useRef();

  // Sync notifications and avoid duplicates
  const syncNotification = useCallback(
    (newNotification, isFromWebSocket = false) => {
      const formatted = notificationService.formatNotification(newNotification);

      setNotifications((prev) => {
        // Check if notification already exists
        const existingIndex = prev.findIndex((n) => n.id === formatted.id);

        if (existingIndex >= 0) {
          // Update existing notification
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...formatted };
          return updated;
        } else {
          // Add new notification at the beginning
          return [formatted, ...prev];
        }
      });

      // Update unread count only for new unread notifications
      if (!formatted.read) {
        setUnreadCount((prev) => {
          // For new notifications from WebSocket, don't increment here
          // since we'll get the count update separately
          // For manual additions, increment
          return isFromWebSocket ? prev : prev + 1;
        });
      }

      // Delegate to notification service for browser notifications
      if (isFromWebSocket) {
        notificationService.handleIncomingNotification(formatted);
      }
    },
    [] // Remove notifications dependency to break infinite loop
  );

  // Store latest function in ref
  syncNotificationRef.current = syncNotification;

  // Sync state after reconnection
  const syncAfterReconnection = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      console.log("[WebSocket] Syncing state after reconnection...");

      // Get latest notifications
      const response = await api.notifications.getAll({ page: 0, size: 50 });
      const notificationsList = response.content || [];

      // Format all notifications
      const formatted = notificationsList.map((notif) =>
        notificationService.formatNotification(notif)
      );

      setNotifications(formatted);

      // Get updated unread count
      const countResponse = await api.notifications.getUnreadCount();
      setUnreadCount(countResponse.unreadCount || 0);

      setLastSyncTimestamp(Date.now());
      console.log("[WebSocket] State synced successfully");
    } catch (error) {
      console.error(
        "[WebSocket] Error syncing state after reconnection:",
        error
      );
    }
  }, [user, isAuthenticated]); // Only depend on user and auth status

  // Store latest function in ref
  syncAfterReconnectionRef.current = syncAfterReconnection;

  useEffect(() => {
    if (!ENABLE_WEBSOCKET) {
      setIsConnected(false);
      return;
    }

    if (!isAuthenticated || !user) {
      setIsConnected(false);
      if (clientRef.current) {
        clientRef.current.deactivate();
        setClient(null);
        clientRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("[WebSocket] Token não encontrado, não é possível conectar");
      return;
    }

    // Constrói a URL do WebSocket a partir da API URL
    const BASE_URL = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    ).replace(/\/api$/, "");
    const WS_URL = `${BASE_URL}/ws-chat-sockjs`;

    const stompClient = new Client({
      webSocketFactory: () =>
        new SockJS(WS_URL, null, {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
        }),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (/* str */) => {
        /* debug suppressed */
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("[WebSocket] Connected successfully");
        setIsConnected(true);

        // Sync state after reconnection
        if (syncAfterReconnectionRef.current) {
          syncAfterReconnectionRef.current();
        }

        const userType = user.userType.toLowerCase(); // player, organization, spectator

        // Subscribe to notification messages for the user
        stompClient.subscribe(
          `/topic/notifications/${userType}/${user.id}`,
          (message) => {
            try {
              const rawNotification = JSON.parse(message.body);
              console.log(
                "[WebSocket] Received notification:",
                rawNotification
              );

              // Use sync function to handle the notification
              if (syncNotificationRef.current) {
                syncNotificationRef.current(rawNotification, true);
              }
            } catch (error) {
              console.error("Erro ao processar notificação:", error);
            }
          }
        );

        // Subscribe to unread count updates (server can push count updates)
        stompClient.subscribe(
          `/topic/notifications/${userType}/${user.id}/count`,
          (message) => {
            try {
              const payload = JSON.parse(message.body);
              // payload can be { unreadCount: N } or a plain number
              const count =
                payload && typeof payload === "object"
                  ? payload.unreadCount ?? payload.count ?? 0
                  : Number(payload) || 0;
              console.log("[WebSocket] Received unread count update:", count);
              setUnreadCount(count);
            } catch (err) {
              // try parse as raw number
              const raw = message.body;
              const n = Number(raw);
              if (!Number.isNaN(n)) {
                setUnreadCount(n);
              } else {
                console.error(
                  "Erro ao processar contador de notificações:",
                  err
                );
              }
            }
          }
        );
      },
      onDisconnect: () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        try {
          const parsed = {
            time: new Date().toISOString(),
            url: WS_URL,
            userId: user?.id,
            userType: user?.userType,
            frame: {
              command: frame?.command,
              headers: frame?.headers,
              body: frame?.body,
              message: frame?.message,
            },
          };
          logError({
            route: WS_URL,
            message: "Erro STOMP (Notifications)",
            meta: parsed,
          });
        } catch (err) {
          logError({
            route: WS_URL,
            message: "Erro STOMP (Notifications) (parsing)",
            meta: { err, frame },
          });
        }
        setIsConnected(false);
      },
      onWebSocketError: (event) => {
        try {
          const parsed = {
            time: new Date().toISOString(),
            url: WS_URL,
            userId: user?.id,
            userType: user?.userType,
            type: event?.type,
            message: event?.message || event?.reason || null,
            error: event?.error || null,
            target: {
              url: event?.target?.url || null,
              readyState: event?.target?.readyState || null,
            },
            stack: event?.error?.stack || null,
          };
          logError({
            route: WS_URL,
            message: "Erro WebSocket (Notifications)",
            meta: parsed,
          });
        } catch (err) {
          logError({
            route: WS_URL,
            message: "Erro WebSocket (Notifications) (parsing)",
            meta: { err, event },
          });
        }
        setIsConnected(false);
      },
    });

    stompClient.activate();
    setClient(stompClient);
    clientRef.current = stompClient;

    // Initialize notification service and request permission
    notificationService.initialize();
    notificationService.requestPermission();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
    // Only depend on authentication and user, not on callback functions
  }, [isAuthenticated, user]);

  // Adicionar notificação manualmente
  const addNotification = useCallback(
    (notification) => {
      syncNotification(notification, false);
    },
    [syncNotification]
  );

  const markAsReadLocally = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, read: true, isRead: true }
          : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsReadLocally = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const removeNotificationLocally = useCallback((notificationId) => {
    setNotifications((prev) => {
      const notif = prev.find((n) => n.id === notificationId);
      if (notif && !notif.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  const clearReadNotificationsLocally = useCallback(() => {
    setNotifications((prev) => prev.filter((notif) => !notif.read));
  }, []);

  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  const setNotificationsList = useCallback((notifList) => {
    // Format all notifications consistently
    const formatted = notifList.map((notif) =>
      notificationService.formatNotification(notif)
    );
    setNotifications(formatted);
    const unread = formatted.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    lastSyncTimestamp,
    addNotification,
    markAsReadLocally,
    markAllAsReadLocally,
    removeNotificationLocally,
    clearReadNotificationsLocally,
    updateUnreadCount,
    setNotificationsList,
    syncNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
