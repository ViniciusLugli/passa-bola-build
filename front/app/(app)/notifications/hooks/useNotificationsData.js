import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotificationsCache } from "@/app/hooks/useNotificationsCache";

/**
 * Hook para gerenciar o carregamento inicial de notificações
 */
export function useNotificationsData(
  user,
  setNotificationsList,
  updateUnreadCount,
  showToast
) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const cache = useNotificationsCache(user);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        // Use cached version with background refresh
        const response = await cache.getNotifications(
          { page: 0, size: 50 },
          { backgroundRefresh: true }
        );

        const notificationsList = response.content || [];
        console.log("[DEBUG] Cached notifications list:", notificationsList);
        console.log("[DEBUG] Notifications count:", notificationsList.length);

        if (isMounted) {
          setNotificationsList(notificationsList);
        }

        // Get cached unread count
        const countResponse = await cache.getUnreadCount({ backgroundRefresh: true });
        if (isMounted) {
          updateUnreadCount(countResponse.unreadCount || 0);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erro ao buscar notificações:", err);
          showToast(err.message || "Erro ao carregar notificações.", "error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
    // FIX: Removido 'cache' das dependências para evitar loop infinito
    // O objeto cache muda a cada render devido aos callbacks internos
    // Dependemos apenas do user?.id que é estável
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    loading,
    cache, // Expose cache for other operations
  };
}
