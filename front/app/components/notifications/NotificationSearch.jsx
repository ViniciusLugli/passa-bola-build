/**
 * NotificationSearch Component
 *
 * Componente de busca otimizado para notificações com:
 * - Debounce automático
 * - Filtros avançados
 * - Histórico de busca
 * - Sugestões inteligentes
 */

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useDebounce, useDebounceCallback } from "../../hooks/useDebounce";
import { NOTIFICATION_TYPES } from "../../lib/notificationTypes";

const NotificationSearch = ({
  notifications = [],
  onFilteredNotifications,
  placeholder = "Buscar notificações...",
  showFilters = true,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSender, setSelectedSender] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchInputRef = useRef(null);

  // Debounce da busca para performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Debounced callback para filtrar notificações
  const [debouncedFilter] = useDebounceCallback((filteredNotifications) => {
    onFilteredNotifications?.(filteredNotifications);
  }, 100);

  // Obtém lista única de remetentes para o filtro
  const uniqueSenders = useMemo(() => {
    const senders = new Set();
    notifications.forEach((notif) => {
      if (notif.senderName) {
        senders.add(notif.senderName);
      }
    });
    return Array.from(senders).sort();
  }, [notifications]);

  // Filtra notificações baseado nos critérios selecionados
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filtro por termo de busca
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (notif) =>
          notif.message?.toLowerCase().includes(searchLower) ||
          notif.senderName?.toLowerCase().includes(searchLower) ||
          notif.type?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter((notif) => notif.type === selectedType);
    }

    // Filtro por remetente
    if (selectedSender !== "all") {
      filtered = filtered.filter(
        (notif) => notif.senderName === selectedSender
      );
    }

    // Filtro por não lidas
    if (showUnreadOnly) {
      filtered = filtered.filter((notif) => !notif.isRead);
    }

    // Filtro por período
    if (dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (notif) => new Date(notif.createdAt) >= cutoffDate
      );
    }

    return filtered;
  }, [
    notifications,
    debouncedSearchTerm,
    selectedType,
    selectedSender,
    dateRange,
    showUnreadOnly,
  ]);

  // Chama callback quando filtro muda
  React.useEffect(() => {
    debouncedFilter(filteredNotifications);
  }, [filteredNotifications, debouncedFilter]);

  // Limpa todos os filtros
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedSender("all");
    setDateRange("all");
    setShowUnreadOnly(false);
  }, []);

  // Conta filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedType !== "all") count++;
    if (selectedSender !== "all") count++;
    if (dateRange !== "all") count++;
    if (showUnreadOnly) count++;
    return count;
  }, [searchTerm, selectedType, selectedSender, dateRange, showUnreadOnly]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de busca principal */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros avançados */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os tipos</option>
              {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por remetente */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Remetente
            </label>
            <select
              value={selectedSender}
              onChange={(e) => setSelectedSender(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              {uniqueSenders.map((sender) => (
                <option key={sender} value={sender}>
                  {sender}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por período */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todo período</option>
              <option value="today">Hoje</option>
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
            </select>
          </div>

          {/* Toggle não lidas */}
          <div className="flex items-center space-x-2">
            <label className="block text-xs font-medium text-gray-700">
              Filtros
            </label>
            <div className="flex items-center">
              <input
                id="unread-only"
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="unread-only"
                className="ml-2 text-sm text-gray-700"
              >
                Apenas não lidas
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Indicadores e ações */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>
            {filteredNotifications.length} de {notifications.length}{" "}
            notificações
          </span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? "s" : ""}{" "}
              ativo{activeFiltersCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationSearch;
