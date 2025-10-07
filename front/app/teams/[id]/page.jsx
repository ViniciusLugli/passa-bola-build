"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

function PlayerRow({ player, leaderId, currentUserId }) {
  const isCurrentUser = Boolean(
    currentUserId &&
      (String(player?.id) === String(currentUserId) ||
        String(player?.playerId) === String(currentUserId))
  );
  const name = isCurrentUser
    ? "Eu"
    : player?.name ?? player?.fullName ?? player?.username ?? "Jogador";
  const avatar =
    player?.avatarUrl ?? player?.photo ?? "/icons/user-default.png";
  const isLeader = Boolean(
    leaderId &&
      (String(player?.id) === String(leaderId) ||
        String(player?.playerId) === String(leaderId))
  );
  const statusLabel = isLeader ? "Líder" : "Jogador";

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded shadow-sm">
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-800">{name}</div>
        <div className="text-xs text-gray-500">{statusLabel}</div>
      </div>
    </div>
  );
}

export default function TeamDetailsPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { loading: authLoading, user: currentUser } = useAuth();

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.teams.getById(id);
      const teamData = res ?? res?.team ?? res?.content ?? null;
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
    if (
      !confirm("Remover este jogador do time? Esta ação não pode ser desfeita.")
    )
      return;
    setActionLoading(true);
    try {
      await api.teams.removePlayer(id, playerId);
      await fetchTeam();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("teams:changed"));
      }
    } catch (err) {
      console.error("Falha ao remover jogador:", err);
      alert(err?.message || "Falha ao remover jogador");
    } finally {
      setActionLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!confirm("Tem certeza que deseja sair deste time?")) return;
    setActionLoading(true);
    try {
      await api.teams.leaveTeam(id);
      await fetchTeam();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("teams:changed"));
      }
    } catch (err) {
      console.error("Falha ao sair do time:", err);
      alert(err?.message || "Falha ao sair do time");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-3xl">
        {loading && <p>Carregando detalhes do time...</p>}
        {error && <p className="text-red-500">Erro: {error}</p>}
        {!loading && !error && !team && <p>Time não encontrado.</p>}

        {team && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {team?.name ?? team?.nameTeam ?? "Equipe"}
                </h1>
                {team?.bio && <p className="text-gray-600 mt-2">{team.bio}</p>}
                <div className="text-sm text-gray-500 mt-3">
                  Criado em: {new Date(team.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="ml-4">
                {currentUser?.id && currentUser.id !== team?.leader?.id && (
                  <button
                    disabled={actionLoading}
                    onClick={leaveTeam}
                    className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    Sair do time
                  </button>
                )}
              </div>
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-3">
                Jogadores ({team?.playerCount ?? team?.players?.length ?? 0})
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {(team?.players ?? []).map((p) => (
                  <div
                    key={p.id ?? p.playerId}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <PlayerRow
                        player={p}
                        leaderId={team?.leader?.id}
                        currentUserId={currentUser?.id}
                      />
                    </div>
                    <div className="flex gap-2">
                      {currentUser?.id &&
                        team?.leader?.id &&
                        String(currentUser.id) === String(team.leader.id) &&
                        String(p.id ?? p.playerId) !==
                          String(team.leader.id) && (
                          <button
                            disabled={actionLoading}
                            onClick={() => removePlayer(p.id ?? p.playerId)}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Remover
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
