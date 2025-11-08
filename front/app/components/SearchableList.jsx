"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";

export default function SearchableList({
  items = [],
  renderItem,
  searchKey = "name",
  placeholder = "Pesquisar...",
  emptyMessage = "Nenhum resultado encontrado",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Filter items based on debounced search term
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();

    return items.filter((item) => {
      // Support nested keys like "user.name"
      const keys = searchKey.split(".");
      let value = item;

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }

      return String(value || "")
        .toLowerCase()
        .includes(searchLower);
    });
  }, [items, debouncedSearchTerm, searchKey]);

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-secondary" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full pl-12 pr-12 py-3 border border-default rounded-lg bg-surface text-primary placeholder-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar pesquisa"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full text-secondary hover:text-primary hover:bg-surface-elevated transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Result Count */}
      <div
        className="text-sm text-secondary"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {debouncedSearchTerm ? (
          <span>
            <strong className="text-primary">{filteredItems.length}</strong> de{" "}
            <strong className="text-primary">{items.length}</strong>{" "}
            {items.length === 1 ? "resultado" : "resultados"}
          </span>
        ) : (
          <span>
            <strong className="text-primary">{items.length}</strong>{" "}
            {items.length === 1 ? "item" : "itens"}
          </span>
        )}
      </div>

      {/* Results */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <div key={item.id || item.userId || index}>{renderItem(item)}</div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface-muted border border-default rounded-xl p-8 text-center">
          <Search className="h-12 w-12 text-secondary mx-auto mb-3 opacity-50" />
          <p className="text-secondary text-base">{emptyMessage}</p>
          {debouncedSearchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-4 text-accent hover:text-accent-strong font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-2 py-1"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
