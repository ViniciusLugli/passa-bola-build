"use client";

import React from "react";

export default function PlayerRow({ player, leaderId, currentUserId, action }) {
  const isCurrentUser = Boolean(
    currentUserId &&
      (String(player?.id) === String(currentUserId) ||
        String(player?.playerId) === String(currentUserId))
  );
  const isPending = Boolean(player?.pending);
  const name = isCurrentUser
    ? "Eu"
    : isPending
    ? player?.name ?? player?.username ?? player?.email ?? "Pendente"
    : player?.name ??
      player?.fullName ??
      player?.username ??
      player?.email ??
      "Jogador";
  const avatar =
    player?.avatarUrl ??
    player?.profilePhoto ??
    player?.photo ??
    "/icons/user-default.png";
  const isLeader = Boolean(
    leaderId &&
      (String(player?.id) === String(leaderId) ||
        String(player?.playerId) === String(leaderId))
  );
  const statusLabel = isPending ? "Pendente" : isLeader ? "Líder" : "Jogador";

  return (
    <div className="flex items-center gap-3 p-3 bg-surface border border-default rounded shadow-elevated">
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-primary">{name}</div>
        <div className="text-xs text-secondary">{statusLabel}</div>
      </div>
      {action && <div className="ml-2">{action}</div>}
    </div>
  );
}
