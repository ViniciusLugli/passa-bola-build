"use client";

import React from "react";

export default function MembersAvatars({
  players = [],
  invites = [],
  playersCount = 0,
  currentUser = null,
  leaderId = null,
}) {
  // normalize invites into player-like objects with robust fallbacks
  const mapInvite = (it) => {
    const invited = it?.invitedPlayer ?? it?.player ?? it?.user ?? null;

    const name =
      invited?.name ||
      invited?.fullName ||
      invited?.username ||
      invited?.email ||
      it?.invitedName ||
      it?.inviteeName ||
      null;

    const avatar =
      invited?.profilePhotoUrl ||
      invited?.profilePhoto ||
      invited?.avatarUrl ||
      invited?.photo ||
      it?.profilePhoto ||
      "/icons/user-default.png";

    const invitedId =
      invited?.id ?? it?.invitedPlayerId ?? it?.playerId ?? null;

    return {
      id: invitedId ?? `invite-${it.id}`,
      _inviteId: it.id,
      pending: true,
      username: invited?.username ?? it?.username ?? null,
      name: name,
      avatarUrl: avatar,
    };
  };

  // Only include pending invites in the avatar list if the current user is the team leader
  const includeInvites =
    currentUser && leaderId && String(currentUser.id) === String(leaderId);

  const combined = [
    ...players,
    ...(includeInvites ? (invites || []).map(mapInvite) : []),
  ];

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-secondary mb-2">Membros</h3>
      <div className="flex items-center gap-2">
        {combined.slice(0, 8).map((p) => (
          <img
            key={p.id}
            src={
              p.avatarUrl ||
              p.profilePhoto ||
              p.photo ||
              "/icons/user-default.png"
            }
            alt={p.name || p.username || "Pendente"}
            className={`w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover ${
              p.pending ? "opacity-60" : ""
            }`}
          />
        ))}

        {playersCount > 8 && (
          <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-sm text-secondary border-2 border-white">
            +{playersCount - 8}
          </div>
        )}
      </div>
    </div>
  );
}
