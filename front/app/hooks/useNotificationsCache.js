/**
 * Hook de cache inteligente para notificações
 *
 * Características:
 * - Cache com TTL (Time To Live)
 * - Invalidação automática
 * - Deduplicação de requests
 * - Background refresh
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/app/lib/api";
import { notificationService } from "@/app/lib/notificationService";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BACKGROUND_REFRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes

export function useNotificationsCache(user) {
  const [cache, setCache] = useState(new Map());
  const [loading, setLoading] = useState(new Map());
  const pendingRequests = useRef(new Map());

  // Cache key generator
  const getCacheKey = useCallback((type, params = {}) => {
    return `${type}:${JSON.stringify(params)}`;
  }, []);

  // Check if cache entry is valid
  const isCacheValid = useCallback((entry) => {
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_TTL;
  }, []);

  // Check if entry needs background refresh
  const needsBackgroundRefresh = useCallback((entry) => {
    if (!entry) return true;
    return Date.now() - entry.timestamp > BACKGROUND_REFRESH_THRESHOLD;
  }, []);

  // Set cache entry
  const setCacheEntry = useCallback((key, data) => {
    setCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(key, {
        data,
        timestamp: Date.now(),
      });
      return newCache;
    });
  }, []);

  // Get cache entry
  const getCacheEntry = useCallback(
    (key) => {
      return cache.get(key);
    },
    [cache]
  );

  // Invalidate specific cache entries
  const invalidateCache = useCallback((pattern) => {
    setCache((prev) => {
      const newCache = new Map();
      for (const [key, value] of prev.entries()) {
        if (!key.includes(pattern)) {
          newCache.set(key, value);
        }
      }
      return newCache;
    });
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    pendingRequests.current.clear();
  }, []);

  // Generic fetch with cache
  const fetchWithCache = useCallback(
    async (
      cacheKey,
      fetchFn,
      { forceRefresh = false, backgroundRefresh = true } = {}
    ) => {
      // Check for pending request
      const pendingKey = `pending_${cacheKey}`;
      if (pendingRequests.current.has(pendingKey)) {
        return pendingRequests.current.get(pendingKey);
      }

      const cacheEntry = getCacheEntry(cacheKey);

      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && isCacheValid(cacheEntry)) {
        // Background refresh if needed
        if (backgroundRefresh && needsBackgroundRefresh(cacheEntry)) {
          // Fire and forget background update
          setTimeout(async () => {
            try {
              const freshData = await fetchFn();
              setCacheEntry(cacheKey, freshData);
            } catch (error) {
              console.warn(`Background refresh failed for ${cacheKey}:`, error);
            }
          }, 0);
        }

        return cacheEntry.data;
      }

      // Set loading state
      setLoading((prev) => new Map(prev).set(cacheKey, true));

      // Create and cache the promise
      const promise = (async () => {
        try {
          const data = await fetchFn();
          setCacheEntry(cacheKey, data);
          return data;
        } catch (error) {
          // If we have stale cache data, return it
          if (cacheEntry?.data) {
            console.warn(
              `Using stale cache for ${cacheKey} due to error:`,
              error
            );
            return cacheEntry.data;
          }
          throw error;
        } finally {
          setLoading((prev) => {
            const newLoading = new Map(prev);
            newLoading.delete(cacheKey);
            return newLoading;
          });
          pendingRequests.current.delete(pendingKey);
        }
      })();

      pendingRequests.current.set(pendingKey, promise);
      return promise;
    },
    [getCacheEntry, isCacheValid, needsBackgroundRefresh, setCacheEntry]
  );

  // Specific notification fetchers with cache
  const getNotifications = useCallback(
    async (params = {}, options = {}) => {
      if (!user) return { content: [] };

      const cacheKey = getCacheKey("notifications", params);
      return fetchWithCache(
        cacheKey,
        async () => {
          const response = await api.notifications.getAll(params);
          // Format notifications consistently
          const formatted = (response.content || []).map((notif) =>
            notificationService.formatNotification(notif)
          );
          return { ...response, content: formatted };
        },
        options
      );
    },
    [user, getCacheKey, fetchWithCache]
  );

  const getUnreadNotifications = useCallback(
    async (params = {}, options = {}) => {
      if (!user) return { content: [] };

      const cacheKey = getCacheKey("notifications_unread", params);
      return fetchWithCache(
        cacheKey,
        async () => {
          const response = await api.notifications.getUnread(params);
          const formatted = (response.content || []).map((notif) =>
            notificationService.formatNotification(notif)
          );
          return { ...response, content: formatted };
        },
        options
      );
    },
    [user, getCacheKey, fetchWithCache]
  );

  const getUnreadCount = useCallback(
    async (options = {}) => {
      if (!user) return { unreadCount: 0 };

      const cacheKey = getCacheKey("unread_count");
      return fetchWithCache(
        cacheKey,
        async () => {
          return api.notifications.getUnreadCount();
        },
        { ...options, backgroundRefresh: true }
      );
    },
    [user, getCacheKey, fetchWithCache]
  );

  const getRecentNotifications = useCallback(
    async (options = {}) => {
      if (!user) return { content: [] };

      const cacheKey = getCacheKey("notifications_recent");
      return fetchWithCache(
        cacheKey,
        async () => {
          const response = await api.notifications.getRecent();
          const formatted = (response.content || []).map((notif) =>
            notificationService.formatNotification(notif)
          );
          return { ...response, content: formatted };
        },
        options
      );
    },
    [user, getCacheKey, fetchWithCache]
  );

  // Cache invalidation helpers
  const invalidateNotificationsCache = useCallback(() => {
    invalidateCache("notifications");
  }, [invalidateCache]);

  const invalidateCountCache = useCallback(() => {
    invalidateCache("unread_count");
  }, [invalidateCache]);

  // Auto-invalidate cache when user changes
  useEffect(() => {
    clearCache();
  }, [user?.id, clearCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingRequests.current.clear();
    };
  }, []);

  return {
    // Data fetchers
    getNotifications,
    getUnreadNotifications,
    getUnreadCount,
    getRecentNotifications,

    // Cache management
    invalidateNotificationsCache,
    invalidateCountCache,
    clearCache,

    // Cache state
    loading: loading,
    cacheSize: cache.size,

    // Direct cache access (for debugging)
    __cache: cache,
  };
}
