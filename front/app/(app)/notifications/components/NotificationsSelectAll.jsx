export default function NotificationsSelectAll({
  selectAllCheckboxRef,
  isAllSelected,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <label className="flex items-center gap-2 cursor-pointer p-2 -m-2">
        <input
          ref={selectAllCheckboxRef}
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => {
            if (e.target.checked) {
              onSelectAll();
            } else {
              onClearSelection();
            }
          }}
          aria-label="Selecionar todas as notificações"
          className="w-5 h-5 cursor-pointer"
        />
        <span className="text-sm font-medium text-secondary">
          Selecionar tudo
          {selectedCount > 0 &&
            selectedCount < totalCount &&
            ` (${selectedCount}/${totalCount})`}
        </span>
      </label>
    </div>
  );
}
