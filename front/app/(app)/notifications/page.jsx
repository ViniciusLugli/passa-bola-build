"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import NotificationsLoadingState from "@/app/components/notifications/NotificationsLoadingState";
import NotificationsHeader from "@/app/components/notifications/NotificationsHeader";
import NotificationsTabs from "@/app/components/notifications/NotificationsTabs";
import NotificationsBatchActions from "@/app/components/notifications/NotificationsBatchActions";
import NotificationsSelectAll from "./components/NotificationsSelectAll";
import NotificationsList from "./components/NotificationsList";
import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/context/NotificationContext";
import { useNotificationsFilter } from "@/app/hooks/useNotificationsFilter";
import { useNotificationsSelection } from "@/app/hooks/useNotificationsSelection";
import { useNotificationsData } from "./hooks/useNotificationsData";
import { useNotificationsActions } from "./hooks/useNotificationsActions";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const {
    notifications: liveNotifications,
    unreadCount,
    isConnected,
    markAsReadLocally,
    removeNotificationLocally,
    clearReadNotificationsLocally,
    markAllAsReadLocally,
    setNotificationsList,
    updateUnreadCount,
    addNotification,
  } = useNotifications();

  // Load notifications data
  const { loading } = useNotificationsData(
    user,
    setNotificationsList,
    updateUnreadCount,
    showToast
  );

  // Filtering
  const {
    filter,
    setFilter,
    filteredNotifications,
    counts: notificationCounts,
  } = useNotificationsFilter(liveNotifications);

  // Selection
  const {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectAllCheckboxRef,
    isAllSelected,
  } = useNotificationsSelection(filteredNotifications, filter);

  // Actions
  const {
    batchActionLoading,
    deleteAllLoading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleMarkSelectedAsRead,
    handleDeleteSelected,
    handleDeleteAllRead,
  } = useNotificationsActions(
    markAsReadLocally,
    removeNotificationLocally,
    markAllAsReadLocally,
    clearReadNotificationsLocally,
    showToast
  );

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleActionComplete = (type, message) => {
    showToast(message, type);
  };

  const addMockNotifications = () => {
    const now = Date.now();
    const mocks = [
      {
        id: `mock-${now}-1`,
        title: "Convite para time",
        message: "Você recebeu um convite para ingressar no time Gêmeas FC",
        type: "TEAM_INVITE",
        createdAt: new Date().toISOString(),
        read: false,
        link: "/teams/123",
      },
      {
        id: `mock-${now}-2`,
        title: "Partida atualizada",
        message: "Horário alterado: Jogo contra Rivais às 18:00",
        type: "GAME_UPDATE",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        link: "/games/456",
      },
      {
        id: `mock-${now}-3`,
        title: "Novo post",
        message: "Time adversário postou um update no feed",
        type: "NEW_POST",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: true,
      },
      {
        id: `mock-${now}-4`,
        title: "Novo seguidor",
        message: "A usuária Ana começou a te seguir",
        type: "NEW_FOLLOWER",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: false,
      },
      {
        id: `mock-${now}-5`,
        title: "Sistema",
        message: "Manutenção agendada para domingo às 02:00",
        type: "SYSTEM",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        read: true,
      },
    ];

    mocks.forEach((m) => addNotification(m));
    showToast(`${mocks.length} notificações mock adicionadas`, "success");
  };

  if (loading) {
    return <NotificationsLoadingState />;
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-4 mt-8 max-w-4xl">
        <div className="relative bg-surface border border-default rounded-2xl shadow-elevated p-4 md:p-8 flex flex-col gap-6">
          <NotificationsHeader
            onBack={() => router.back()}
            unreadCount={unreadCount}
            isConnected={isConnected}
            onAddMocks={addMockNotifications}
          />

          <NotificationsTabs
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={notificationCounts}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteAllRead={() => handleDeleteAllRead(liveNotifications)}
            unreadCount={unreadCount}
            hasReadNotifications={liveNotifications.some((n) => n.read)}
            deleteAllLoading={deleteAllLoading}
          />

          {filteredNotifications.length > 0 && (
            <NotificationsSelectAll
              selectAllCheckboxRef={selectAllCheckboxRef}
              isAllSelected={isAllSelected}
              selectedCount={selectedIds.size}
              totalCount={filteredNotifications.length}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
            />
          )}

          <NotificationsBatchActions
            selectedCount={selectedIds.size}
            onMarkAsRead={() =>
              handleMarkSelectedAsRead(selectedIds, clearSelection)
            }
            onDelete={() => setConfirmDeleteOpen(true)}
            onClearSelection={clearSelection}
            loading={batchActionLoading}
          />

          <NotificationsList
            notifications={filteredNotifications}
            filter={filter}
            selectedIds={selectedIds}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onToggleSelect={toggleSelect}
            onActionComplete={handleActionComplete}
          />

          <ConfirmModal
            isOpen={confirmDeleteOpen}
            title={"Deletar notificações"}
            message={`Tem certeza que deseja deletar ${
              selectedIds.size
            } notificação${selectedIds.size > 1 ? "s" : ""}?`}
            onCancel={() => setConfirmDeleteOpen(false)}
            onConfirm={() =>
              handleDeleteSelected(selectedIds, clearSelection, () =>
                setConfirmDeleteOpen(false)
              )
            }
            confirmLabel={"Sim, deletar"}
            cancelLabel={"Cancelar"}
            loading={batchActionLoading}
          />
        </div>
      </main>
    </div>
  );
}
