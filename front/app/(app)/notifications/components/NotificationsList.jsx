import NotificationCard from "@/app/components/cards/NotificationCard";
import NotificationsEmptyState from "@/app/components/notifications/NotificationsEmptyState";

export default function NotificationsList({
  notifications,
  filter,
  selectedIds,
  onMarkAsRead,
  onDelete,
  onToggleSelect,
  onActionComplete,
}) {
  if (notifications.length === 0) {
    return <NotificationsEmptyState filter={filter} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          onActionComplete={onActionComplete}
          selectable={true}
          selected={selectedIds.has(notification.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
