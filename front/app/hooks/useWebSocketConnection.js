/**
 * useWebSocketConnection Hook
 *
 * Hook personalizado para gerenciar conexões WebSocket com:
 * - Reconexão automática com backoff exponencial
 * - Sincronização de estado após reconexão
 * - Gestão de estado de conexão
 * - Heartbeat/ping para detecção de conexão perdida
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const INITIAL_RETRY_DELAY = 1000; // 1 segundo
const MAX_RETRY_DELAY = 30000; // 30 segundos
const MAX_RETRY_ATTEMPTS = 10;
const HEARTBEAT_INTERVAL = 30000; // 30 segundos

export function useWebSocketConnection(baseUrl = "http://localhost:8080") {
  const [connectionState, setConnectionState] = useState("disconnected");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [lastError, setLastError] = useState(null);

  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const stompClientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const subscriptionsRef = useRef(new Map());
  const isManuallyDisconnectedRef = useRef(false);
  const connectFunctionRef = useRef(null);

  /**
   * Calcula o delay para próxima tentativa com backoff exponencial
   */
  const calculateRetryDelay = useCallback((attempt) => {
    const delay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(2, attempt),
      MAX_RETRY_DELAY
    );
    // Adiciona jitter para evitar thundering herd
    return delay + Math.random() * 1000;
  }, []);

  /**
   * Limpa todos os timers e referências
   */
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    subscriptionsRef.current.clear();
  }, []);

  /**
   * Reconecta todas as subscrições existentes
   */
  const resubscribeAll = useCallback(() => {
    console.log("[WebSocket] Resubscribing to previous subscriptions...");
    const subscriptions = Array.from(subscriptionsRef.current.entries());

    subscriptions.forEach(([destination, callback]) => {
      try {
        const subscription = stompClientRef.current.subscribe(
          destination,
          callback
        );
        subscriptionsRef.current.set(destination, callback);
        console.log(`[WebSocket] Resubscribed to ${destination}`);
      } catch (error) {
        console.error(
          `[WebSocket] Failed to resubscribe to ${destination}:`,
          error
        );
      }
    });
  }, []);

  /**
   * Inicia heartbeat para manter conexão viva
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (stompClientRef.current?.connected) {
        try {
          stompClientRef.current.send(
            "/app/ping",
            {},
            JSON.stringify({ timestamp: Date.now() })
          );
        } catch (error) {
          console.warn("[WebSocket] Heartbeat failed:", error);
        }
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  /**
   * Manipula perda de conexão
   */
  const handleConnectionLoss = useCallback(() => {
    if (isManuallyDisconnectedRef.current) return;

    console.log("[WebSocket] Connection lost, attempting to reconnect...");
    setConnectionState("reconnecting");

    cleanup();

    if (retryAttempt < MAX_RETRY_ATTEMPTS) {
      const delay = calculateRetryDelay(retryAttempt);
      console.log(
        `[WebSocket] Retrying connection in ${delay}ms (attempt ${
          retryAttempt + 1
        }/${MAX_RETRY_ATTEMPTS})`
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        setRetryAttempt((prev) => prev + 1);
        // Use ref to avoid circular dependency
        if (connectFunctionRef.current) {
          connectFunctionRef.current();
        }
      }, delay);
    } else {
      console.error("[WebSocket] Max retry attempts reached");
      setConnectionState("failed");
      setLastError(new Error("Maximum retry attempts exceeded"));
    }
  }, [retryAttempt, calculateRetryDelay, cleanup]);

  /**
   * Conecta ao WebSocket
   */
  const connect = useCallback(() => {
    if (!token || !user) {
      console.log("[WebSocket] No auth token or user, skipping connection");
      return;
    }

    if (stompClientRef.current?.connected) {
      console.log("[WebSocket] Already connected");
      return;
    }

    try {
      setConnectionState("connecting");
      isManuallyDisconnectedRef.current = false;

      // Dynamically import SockJS and Stomp
      Promise.all([import("sockjs-client"), import("@stomp/stompjs")])
        .then(([{ default: SockJS }, { Client }]) => {
          const socket = new SockJS(`${baseUrl}/ws`);
          const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
              Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
              if (process.env.NODE_ENV === "development") {
                console.log("[WebSocket Debug]", str);
              }
            },
            reconnectDelay: 0, // Disabled - we handle reconnection manually
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
          });

          stompClient.onConnect = (frame) => {
            console.log("[WebSocket] Connected:", frame);
            setConnectionState("connected");
            setRetryAttempt(0);
            setLastError(null);

            socketRef.current = socket;
            stompClientRef.current = stompClient;

            startHeartbeat();
            resubscribeAll();
          };

          stompClient.onDisconnect = () => {
            console.log("[WebSocket] Disconnected");
            if (!isManuallyDisconnectedRef.current) {
              handleConnectionLoss();
            }
          };

          stompClient.onStompError = (frame) => {
            console.error("[WebSocket] STOMP error:", frame);
            setLastError(new Error(frame.body || "STOMP error"));
            handleConnectionLoss();
          };

          stompClient.onWebSocketError = (error) => {
            console.error("[WebSocket] WebSocket error:", error);
            setLastError(error);
            handleConnectionLoss();
          };

          stompClient.activate();
        })
        .catch((error) => {
          console.error(
            "[WebSocket] Failed to import WebSocket libraries:",
            error
          );
          setLastError(error);
          setConnectionState("failed");
        });
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
      setLastError(error);
      handleConnectionLoss();
    }
  }, [
    token,
    user,
    baseUrl,
    startHeartbeat,
    resubscribeAll,
    handleConnectionLoss,
  ]);

  // Store connect function in ref to avoid circular dependency
  useEffect(() => {
    connectFunctionRef.current = connect;
  }, [connect]);

  /**
   * Desconecta do WebSocket
   */
  const disconnect = useCallback(() => {
    console.log("[WebSocket] Manually disconnecting...");
    isManuallyDisconnectedRef.current = true;

    cleanup();

    if (stompClientRef.current?.connected) {
      stompClientRef.current.deactivate();
    }

    setConnectionState("disconnected");
    setRetryAttempt(0);
  }, [cleanup]);

  /**
   * Subscribe to a topic with automatic resubscription
   */
  const subscribe = useCallback((destination, callback) => {
    if (!stompClientRef.current?.connected) {
      console.warn(
        `[WebSocket] Cannot subscribe to ${destination} - not connected`
      );
      // Store subscription for later reconnection
      subscriptionsRef.current.set(destination, callback);
      return null;
    }

    try {
      const subscription = stompClientRef.current.subscribe(
        destination,
        callback
      );
      subscriptionsRef.current.set(destination, callback);
      console.log(`[WebSocket] Subscribed to ${destination}`);
      return subscription;
    } catch (error) {
      console.error(
        `[WebSocket] Failed to subscribe to ${destination}:`,
        error
      );
      return null;
    }
  }, []);

  /**
   * Unsubscribe from a topic
   */
  const unsubscribe = useCallback((destination) => {
    subscriptionsRef.current.delete(destination);
    console.log(`[WebSocket] Unsubscribed from ${destination}`);
  }, []);

  /**
   * Send message through WebSocket
   */
  const send = useCallback((destination, headers = {}, body = "") => {
    if (!stompClientRef.current?.connected) {
      console.warn(`[WebSocket] Cannot send to ${destination} - not connected`);
      return false;
    }

    try {
      stompClientRef.current.send(destination, headers, body);
      return true;
    } catch (error) {
      console.error(`[WebSocket] Failed to send to ${destination}:`, error);
      return false;
    }
  }, []);

  /**
   * Reset connection (force reconnect)
   */
  const reset = useCallback(() => {
    disconnect();
    setTimeout(() => {
      setRetryAttempt(0);
      setLastError(null);
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Auto-connect when token and user are available
  useEffect(() => {
    if (token && user && connectionState === "disconnected") {
      connect();
    }
  }, [token, user, connectionState, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    isConnected: connectionState === "connected",
    isConnecting: connectionState === "connecting",
    isReconnecting: connectionState === "reconnecting",
    isFailed: connectionState === "failed",
    retryAttempt,
    lastError,
    connect,
    disconnect,
    reset,
    subscribe,
    unsubscribe,
    send,
  };
}
