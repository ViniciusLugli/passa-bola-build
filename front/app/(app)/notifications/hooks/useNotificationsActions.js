import { useState } from "react";
import { api } from "@/app/lib/api";

/**
 * Hook para gerenciar ações de notificações (marcar como lida, deletar, etc)
 */
export function useNotificationsActions(
  markAsReadLocally,
  removeNotificationLocally,
  markAllAsReadLocally,
  clearReadNotificationsLocally,
  showToast
) {
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead(notificationId);
      markAsReadLocally(notificationId);
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
      showToast("Erro ao marcar notificação como lida.", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.notifications.markAllAsRead();
      markAllAsReadLocally();
      showToast(
        response.message || "Todas as notificações foram marcadas como lidas!",
        "success"
      );
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
      showToast("Erro ao marcar todas as notificações como lidas.", "error");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.notifications.delete(notificationId);
      removeNotificationLocally(notificationId);
      showToast("Notificação deletada!", "success");
    } catch (err) {
      console.error("Erro ao deletar notificação:", err);
      showToast("Erro ao deletar notificação.", "error");
    }
  };

  const handleMarkSelectedAsRead = async (selectedIds, clearSelection) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBatchActionLoading(true);
    try {
      await Promise.all(ids.map((id) => api.notifications.markAsRead(id)));
      ids.forEach((id) => markAsReadLocally(id));
      showToast(`${ids.length} notificações marcadas como lidas.`, "success");
      clearSelection();
    } catch (err) {
      console.error(
        "Erro ao marcar notificações selecionadas como lidas:",
        err
      );
      showToast("Erro ao marcar notificações como lidas.", "error");
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleDeleteSelected = async (
    selectedIds,
    clearSelection,
    onComplete
  ) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      onComplete();
      return;
    }

    setBatchActionLoading(true);
    try {
      await Promise.all(ids.map((id) => api.notifications.delete(id)));
      ids.forEach((id) => removeNotificationLocally(id));
      showToast(`${ids.length} notificações deletadas.`, "success");
      clearSelection();
      onComplete();
    } catch (err) {
      console.error("Erro ao deletar notificações selecionadas:", err);
      showToast("Erro ao deletar notificações.", "error");
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleDeleteAllRead = async (liveNotifications) => {
    setDeleteAllLoading(true);
    try {
      const readNotifications = liveNotifications.filter((n) => n.read);

      await Promise.all(
        readNotifications.map((notif) => api.notifications.delete(notif.id))
      );

      clearReadNotificationsLocally();
      showToast(
        `${readNotifications.length} notificações lidas foram deletadas!`,
        "success"
      );
    } catch (err) {
      console.error("Erro ao deletar notificações lidas:", err);
      showToast("Erro ao deletar notificações lidas.", "error");
    } finally {
      setDeleteAllLoading(false);
    }
  };

  return {
    batchActionLoading,
    deleteAllLoading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleMarkSelectedAsRead,
    handleDeleteSelected,
    handleDeleteAllRead,
  };
}
