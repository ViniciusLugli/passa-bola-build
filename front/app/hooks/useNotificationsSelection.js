import { useState, useEffect, useRef } from "react";

/**
 * Hook personalizado para gerenciar seleção de notificações
 *
 * @param {Array} filteredNotifications - Array de notificações filtradas
 * @param {string} filter - Filtro atual (para limpar seleção quando mudar)
 * @returns {Object} Estado e métodos de seleção
 * @returns {Set} selectedIds - IDs das notificações selecionadas
 * @returns {Function} setSelectedIds - Função para alterar seleção diretamente
 * @returns {Function} toggleSelect - Alterna seleção de uma notificação
 * @returns {Function} selectAll - Seleciona todas as notificações filtradas
 * @returns {Function} clearSelection - Limpa toda a seleção
 * @returns {Object} selectAllCheckboxRef - Ref para o checkbox "selecionar tudo"
 * @returns {boolean} isAllSelected - Se todas as notificações estão selecionadas
 * @returns {boolean} isSomeSelected - Se algumas (mas não todas) estão selecionadas
 */
export function useNotificationsSelection(filteredNotifications, filter) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const selectAllCheckboxRef = useRef(null);

  // Limpa seleção quando o filtro muda
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter]);

  // Atualiza estado indeterminado do checkbox "selecionar tudo"
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedIds.size > 0 && selectedIds.size < filteredNotifications.length;
    }
  }, [selectedIds, filteredNotifications]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected =
    filteredNotifications.length > 0 &&
    selectedIds.size === filteredNotifications.length;

  const isSomeSelected =
    selectedIds.size > 0 && selectedIds.size < filteredNotifications.length;

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectAllCheckboxRef,
    isAllSelected,
    isSomeSelected,
  };
}
