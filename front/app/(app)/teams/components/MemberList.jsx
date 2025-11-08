"use client";

import React from "react";
import PlayerRow from "./PlayerRow";

export default function MemberList({
  team = {},
  currentUser = {},
  actionLoading = false,
  onRemovePlayer,
  onCancelInvite,
  leaderId,
}) {
  const players = team.players || [];
  const invites = team.invites || [];

  const playersOnly = players.map((p) => ({
    ...p,
    pending: false,
  }));

  const mapInvite = (it) => {
    // API may return nested invitedPlayer object
    const invited = it?.invitedPlayer ?? it?.player ?? it?.user ?? null;

    const name =
      invited?.name ||
      invited?.fullName ||
      invited?.username ||
      invited?.email ||
      it?.invitedName ||
      it?.inviteeName ||
      "Pendente";

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
      // Use the invited player's id when present, otherwise a fallback unique key
      id: invitedId ?? `invite-${it.id}`,
      _inviteId: it.id,
      pending: true,
      username: invited?.username ?? it?.username ?? null,
      name: name,
      avatarUrl: avatar,
    };
  };

  const pendingInvites = invites.map(mapInvite);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {playersOnly.map((p) => (
          <PlayerRow
            key={p.id}
            player={p}
            leaderId={leaderId}
            currentUserId={currentUser?.id}
            action={
              currentUser?.id &&
              leaderId &&
              String(currentUser.id) === String(leaderId) &&
              String(p.id ?? p.playerId) !== String(leaderId) ? (
                <button
                  disabled={actionLoading}
                  onClick={() => onRemovePlayer?.(p.id ?? p.playerId)}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded"
                >
                  Remover
                </button>
              ) : null
            }
          />
        ))}
      </div>

      {pendingInvites.length > 0 &&
        currentUser?.id &&
        leaderId &&
        String(currentUser.id) === String(leaderId) && (
          <div>
            <h3 className="text-sm font-medium text-secondary mb-2">
              Convites pendentes
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {pendingInvites.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  leaderId={leaderId}
                  currentUserId={currentUser?.id}
                  action={
                    currentUser?.id &&
                    leaderId &&
                    String(currentUser.id) === String(leaderId) ? (
                      <button
                        disabled={actionLoading}
                        onClick={() => onCancelInvite?.(p._inviteId)}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
