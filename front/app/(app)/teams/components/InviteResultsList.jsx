"use client";

import React from "react";
import Button from "@/app/components/ui/Button";

export default function InviteResultsList({
  results = [],
  loading = false,
  invitedIds = new Set(),
  selectedPlayers = [],
  toggleSelect,
  handleInvite,
  actionLoading = false,
  query = "",
  error = null,
}) {
  return (
    <div className="max-h-64 overflow-auto space-y-2">
      {loading && <div className="text-sm text-secondary">Buscando...</div>}
      {!loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="text-sm text-secondary">
          Nenhuma jogadora encontrada.
        </div>
      )}

      {error && <div className="text-sm text-danger">{error}</div>}

      {results.map((p) => (
        <div
          key={p.id ?? p.playerId}
          className="flex items-center justify-between gap-3 p-2 bg-surface border border-default rounded"
        >
          <div className="flex items-center gap-3">
            {invitedIds.has(p.id) ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pendente
              </span>
            ) : (
              <input
                type="checkbox"
                aria-label={`Selecionar ${p.name || p.username}`}
                checked={selectedPlayers.some(
                  (s) => String(s.id) === String(p.id)
                )}
                onChange={() => toggleSelect?.(p)}
                className="w-4 h-4 mr-2"
              />
            )}

            <img
              src={
                p.profilePhoto ||
                p.avatarUrl ||
                p.photo ||
                "/icons/user-default.png"
              }
              alt={p.name || p.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium text-primary">
                {p.name || p.fullName || p.username}
              </div>
              <div className="text-xs text-secondary">
                {p.username ? `@${p.username}` : p.email || ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleInvite?.(p)}
              loading={actionLoading}
              disabled={actionLoading || invitedIds.has(p.id)}
              className="w-auto px-3 py-1"
            >
              {invitedIds.has(p.id) ? "Convidado" : "Convidar"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
