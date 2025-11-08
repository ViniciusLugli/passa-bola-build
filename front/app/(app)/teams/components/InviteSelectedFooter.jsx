"use client";

import React from "react";
import Button from "@/app/components/ui/Button";

export default function InviteSelectedFooter({
  selectedPlayers = [],
  clearSelected,
  sendSelectedInvites,
  actionLoading = false,
}) {
  if (!selectedPlayers || selectedPlayers.length === 0) return null;

  return (
    <div className="pt-3 border-t border-default/40 flex items-center justify-between gap-3">
      <div className="text-sm text-secondary">
        Selecionadas: {selectedPlayers.length}
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={clearSelected}
          disabled={actionLoading}
        >
          Limpar
        </Button>
        <Button onClick={sendSelectedInvites} loading={actionLoading}>
          Enviar convites ({selectedPlayers.length})
        </Button>
      </div>
    </div>
  );
}
