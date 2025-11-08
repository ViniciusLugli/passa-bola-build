"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import InviteMemberModal from "../components/InviteMemberModal";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import { useToast } from "@/app/context/ToastContext";
import MembersAvatars from "../components/MembersAvatars";
import MemberList from "../components/MemberList";

export default function TeamDetailsPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    payload: null,
    message: "",
  });
  const { loading: authLoading, user: currentUser } = useAuth();
  const { showToast } = useToast();

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.teams.getById(id);
      const teamData = res ?? res?.team ?? res?.content ?? null;
      try {
        // Only fetch team invites if the current user is the team leader.
        if (
          currentUser &&
          teamData?.leader &&
          String(currentUser.id) === String(teamData.leader.id)
        ) {
          const invitesRes = await api.teams.getTeamInvites(id);
          const invitesList = Array.isArray(invitesRes)
            ? invitesRes
            : invitesRes?.content || [];
          teamData.invites = invitesList;
        } else {
          // Not the leader: do not attempt to fetch invites (server returns 400/403)
          teamData.invites = teamData.invites || [];
        }
      } catch (ie) {
        teamData.invites = teamData.invites || [];
      }

      setTeam(teamData);
    } catch (err) {
      console.error("Erro ao buscar time:", err);
      setError(err?.message || "Falha ao carregar time");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchTeam();
  }, [id, authLoading]);

  const removePlayer = async (playerId) => {
    setConfirmState({
      isOpen: true,
      action: "removePlayer",
      payload: playerId,
      message: "Remover este jogador do time? Esta ação não pode ser desfeita.",
    });
  };

  const leaveTeam = async () => {
    setConfirmState({
      isOpen: true,
      action: "leaveTeam",
      payload: null,
      message: "Tem certeza que deseja sair deste time?",
    });
  };

  const handleConfirm = async () => {
    const { action, payload } = confirmState;
    setConfirmState((s) => ({ ...s, isOpen: false }));
    setActionLoading(true);
    try {
      if (action === "removePlayer") {
        await api.teams.removePlayer(id, payload);
      } else if (action === "leaveTeam") {
        await api.teams.leaveTeam(id);
      }
      await fetchTeam();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("teams:changed"));
      }
    } catch (err) {
      console.error("Falha na ação de confirmação:", err);
      showToast(err?.message || "Falha ao executar ação", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-page min-h-screen">
      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-3xl">
        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-surface-muted rounded animate-pulse"></div>
            <div className="h-4 w-full bg-surface-muted rounded animate-pulse"></div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`av-${i}`}
                  className="h-14 w-14 rounded-full bg-surface-muted animate-pulse"
                />
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-red-500">Erro: {error}</p>}
        {!loading && !error && !team && <p>Time não encontrado.</p>}

        {team && (
          <div className="space-y-6">
            <div className="bg-surface border border-default p-6 rounded-lg shadow-elevated">
              <div className="flex items-start gap-4">
                {/* Team Logo */}
                {(team?.logoUrl || team?.logo) && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-muted border border-default flex-shrink-0">
                    <img
                      src={team?.logoUrl || team?.logo}
                      alt={`Logo do ${team?.name || team?.nameTeam}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-primary">
                    {team?.name ?? team?.nameTeam ?? "Equipe"}
                  </h1>
                  {team?.bio && (
                    <p className="text-secondary mt-2">{team.bio}</p>
                  )}
                  <div className="text-sm text-tertiary mt-3">
                    Criado em:{" "}
                    {team?.createdAt
                      ? new Date(team.createdAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>

              {((team.players && team.players.length > 0) ||
                (team.invites && team.invites.length > 0)) && (
                <MembersAvatars
                  players={team.players}
                  invites={team.invites}
                  playersCount={team.players?.length ?? 0}
                  currentUser={currentUser}
                  leaderId={team?.leader?.id}
                />
              )}

              <div className="mt-4 flex gap-2">
                {currentUser?.id && currentUser.id !== team?.leader?.id && (
                  <button
                    disabled={actionLoading}
                    onClick={leaveTeam}
                    className="text-sm bg-surface-muted border border-default hover:bg-surface-elevated px-3 py-1 rounded transition-colors"
                  >
                    Sair do time
                  </button>
                )}

                {String(currentUser?.id) === String(team?.leader?.id) && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() => setShowInviteModal(true)}
                      className="text-sm bg-accent text-on-brand px-3 py-1 rounded font-semibold"
                    >
                      Convidar
                    </button>
                    <InviteMemberModal
                      isOpen={showInviteModal}
                      onClose={() => setShowInviteModal(false)}
                      teamId={team.id || id}
                      onInviteSuccess={async () => {
                        await fetchTeam();
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(
                            new CustomEvent("teams:changed")
                          );
                        }
                      }}
                    />
                    <ConfirmModal
                      isOpen={confirmState.isOpen}
                      title={"Confirmação"}
                      message={confirmState.message}
                      onCancel={() =>
                        setConfirmState((s) => ({ ...s, isOpen: false }))
                      }
                      onConfirm={handleConfirm}
                      confirmLabel={"Sim"}
                      cancelLabel={"Não"}
                      loading={actionLoading}
                    />
                  </>
                )}
              </div>
            </div>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                Jogadoras ({team?.playerCount ?? team?.players?.length ?? 0})
              </h2>
              <MemberList
                team={team}
                currentUser={currentUser}
                actionLoading={actionLoading}
                onRemovePlayer={(playerId) => removePlayer(playerId)}
                onCancelInvite={async (inviteId) => {
                  try {
                    setActionLoading(true);
                    await api.teams.cancelInvite(inviteId);
                    await fetchTeam();
                    showToast("Convite cancelado.", "success");
                  } catch (err) {
                    console.error("Falha ao cancelar convite:", err);
                    showToast(
                      err?.message || "Erro ao cancelar convite",
                      "error"
                    );
                  } finally {
                    setActionLoading(false);
                  }
                }}
                leaderId={team?.leader?.id}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
