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

const ChatContext = createContext();

const ENABLE_CHAT_WEBSOCKET =
  process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET !== "false";

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const clientRef = useRef(null);
  const subscriptionsRef = useRef({});

  useEffect(() => {
    if (!ENABLE_CHAT_WEBSOCKET) {
      setIsConnected(false);
      return;
    }

    if (!isAuthenticated || !user) {
      setIsConnected(false);
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("[Chat WebSocket] Token não encontrado");
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
        console.log("[Chat WebSocket] ✅ Conectado com sucesso!");
        console.log("[Chat WebSocket] User:", {
          id: user?.id,
          userId: user?.userId,
          username: user?.username,
        });
        setIsConnected(true);

        // Subscribe to personal messages
        const subscription = stompClient.subscribe(
          `/user/queue/messages`,
          (message) => {
            console.log("[Chat WebSocket] 📨 Mensagem recebida via WebSocket!");
            console.log("[Chat WebSocket] Raw message:", message.body);
            try {
              const newMessage = JSON.parse(message.body);
              console.log("[Chat WebSocket] Parsed message:", newMessage);
              handleNewMessage(newMessage);
            } catch (error) {
              console.error(
                "[Chat WebSocket] ❌ Erro ao processar mensagem:",
                error
              );
            }
          }
        );
        console.log("[Chat WebSocket] ✅ Subscribed to /user/queue/messages");

        // Subscribe to presence events
        stompClient.subscribe(`/user/queue/presence`, (message) => {
          try {
            const presenceEvent = JSON.parse(message.body);
            handlePresenceEvent(presenceEvent);
          } catch (error) {
            console.error("Erro ao processar evento de presença:", error);
          }
        });

        // Request initial list of online users
        stompClient.publish({
          destination: `/app/presence.request`,
          body: JSON.stringify({}),
        });

        clientRef.current = stompClient;
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        try {
          const parsedFrame = {
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
            message: "Erro STOMP (Chat)",
            meta: parsedFrame,
          });
        } catch (err) {
          logError({
            route: WS_URL,
            message: "Erro STOMP (Chat) (parsing)",
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
            message: "Erro WebSocket (Chat)",
            meta: parsed,
          });
        } catch (err) {
          logError({
            route: WS_URL,
            message: "Erro WebSocket (Chat) (parsing)",
            meta: { err, event },
          });
        }
        setIsConnected(false);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handlePresenceEvent = useCallback((event) => {
    const { type, userId, userIds } = event;

    switch (type) {
      case "USER_ONLINE":
        setOnlineUsers((prev) => new Set([...prev, userId]));
        break;
      case "USER_OFFLINE":
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        break;
      case "PRESENCE_LIST":
        setOnlineUsers(new Set(userIds || []));
        break;
      default:
        console.warn("Tipo de evento de presença desconhecido:", type);
    }
  }, []);

  const handleNewMessage = useCallback(
    (message) => {
      console.log("[ChatContext] New message received:", message);
      console.log("[ChatContext] Current user:", {
        id: user?.id,
        userId: user?.userId,
      });

      // Normalize IDs for comparison (handle both string and number types)
      const normalizeId = (id) => {
        if (id === null || id === undefined) return null;
        return String(id);
      };

      // Determinar o otherUserId baseado em quem enviou/recebeu
      // Se eu enviei, otherUserId é recipientId
      // Se eu recebi, otherUserId é senderId
      // IMPORTANTE: Usar userId (Snowflake ID), não id (incremental)
      // CRÍTICO: Normalizar TODOS os IDs para string para evitar perda de precisão
      const messageSenderId = normalizeId(message.senderId);
      const messageRecipientId = normalizeId(message.recipientId);
      const currentUserId = normalizeId(user?.userId || user?.id);
      const isSentByMe = messageSenderId === currentUserId;
      const otherUserId = isSentByMe ? messageRecipientId : messageSenderId;

      console.log("[ChatContext] Message comparison:", {
        messageSenderId,
        messageSenderIdRaw: message.senderId,
        messageRecipientId,
        messageRecipientIdRaw: message.recipientId,
        currentUserId,
        userUserIdRaw: user?.userId,
        userIdRaw: user?.id,
        isSentByMe,
        otherUserId,
      });

      // Store messages by otherUserId - SIMPLIFIED: just add new messages
      setMessages((prev) => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), message],
      }));

      // Atualizar lista de conversas
      const shouldUpdateUnread =
        !activeConversation || activeConversation.otherUserId !== otherUserId;

      console.log("[ChatContext] Should update unread:", {
        shouldUpdateUnread,
        hasActiveConversation: !!activeConversation,
        activeConversationOtherUserId: activeConversation?.otherUserId,
        messageOtherUserId: otherUserId,
      });

      if (shouldUpdateUnread) {
        setUnreadCount((prev) => prev + 1);

        setConversations((prev) => {
          console.log("[ChatContext] Current conversations:", prev);
          const existingConv = prev.find(
            (c) => String(c.otherUserId) === String(otherUserId)
          );
          console.log(
            "[ChatContext] Existing conversation found:",
            existingConv
          );

          if (existingConv) {
            const updated = prev.map((conv) =>
              String(conv.otherUserId) === String(otherUserId)
                ? {
                    ...conv,
                    lastMessage: message.content,
                    lastMessageTime: message.createdAt,
                    unreadCount: (conv.unreadCount || 0) + 1,
                  }
                : conv
            );
            console.log(
              "[ChatContext] Updated existing conversation:",
              updated
            );
            return updated;
          } else {
            // Nova conversa
            const newConv = {
              otherUserId: otherUserId,
              otherUsername: isSentByMe
                ? message.recipientUsername
                : message.senderUsername,
              otherName: isSentByMe
                ? message.recipientName
                : message.senderName,
              otherProfilePhotoUrl: null,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: 1,
            };
            console.log("[ChatContext] Creating new conversation:", newConv);
            const updated = [newConv, ...prev];
            console.log("[ChatContext] Updated conversations list:", updated);
            return updated;
          }
        });
      }
    },
    [activeConversation, user]
  );

  // subscribeToChat e unsubscribeFromChat não são mais necessários
  // porque a API usa /user/queue/messages global
  const subscribeToChat = useCallback((otherUserId) => {
    // Não faz nada - subscribe já foi feito no onConnect
    /* suppressed debug */
  }, []);

  const unsubscribeFromChat = useCallback((otherUserId) => {
    // Não faz nada - subscribe é global
    /* suppressed debug */
  }, []);

  const sendMessageViaWebSocket = useCallback(
    (recipientId, content) => {
      console.log("[Chat WebSocket] Tentando enviar mensagem...");
      console.log("[Chat WebSocket] isConnected:", isConnected);
      console.log("[Chat WebSocket] clientRef.current:", !!clientRef.current);

      if (!clientRef.current || !isConnected) {
        console.warn("[Chat WebSocket] ❌ Não conectado, enviando via HTTP");
        return false;
      }

      try {
        // CRITICAL: Ensure recipientId is sent as string to preserve Snowflake ID precision
        const normalizedRecipientId = String(recipientId);
        const payload = { recipientId: normalizedRecipientId, content };
        console.log("[Chat WebSocket] 📤 Enviando mensagem:", payload);
        clientRef.current.publish({
          destination: `/app/chat.send`,
          body: JSON.stringify(payload),
        });
        console.log("[Chat WebSocket] ✅ Mensagem enviada via WebSocket!");
        return true;
      } catch (error) {
        console.error(
          "[Chat WebSocket] ❌ Erro ao enviar mensagem via WebSocket:",
          error
        );
        return false;
      }
    },
    [isConnected]
  );

  const addMessageLocally = useCallback((otherUserId, message) => {
    console.log(
      "[ChatContext] Adding message locally:",
      message.id,
      message.content?.substring(0, 50)
    );

    setMessages((prev) => {
      const currentMessages = prev[otherUserId] || [];

      // Simply add the message from the server
      return {
        ...prev,
        [otherUserId]: [...currentMessages, message],
      };
    });
  }, []);

  const setConversationMessages = useCallback((otherUserId, messageList) => {
    setMessages((prev) => ({
      ...prev,
      [otherUserId]: messageList,
    }));
  }, []);

  const clearConversationMessages = useCallback((otherUserId) => {
    setMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[otherUserId];
      return newMessages;
    });
  }, []);

  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  const value = {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    messages,
    unreadCount,
    isConnected,
    onlineUsers,
    isUserOnline,
    subscribeToChat,
    unsubscribeFromChat,
    sendMessageViaWebSocket,
    addMessageLocally,
    setConversationMessages,
    clearConversationMessages,
    updateUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
