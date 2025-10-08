"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import TeamCard from "@/app/components/TeamCard";
import { useAuth } from "@/app/context/AuthContext";

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: authLoading, user } = useAuth();

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      if (authLoading) {
        return;
      }
      try {
        let response = await api.teams.getAll();
        let teamsData = response?.teams ?? response?.content ?? [];

        if (!response) {
          console.warn("api.teams.getAll() retornou falsy:", response);
        }
        if (
          (!teamsData || teamsData.length === 0) &&
          response &&
          response.status === 403
        ) {
          try {
            const publicResponse = await api.teams.getAll({
              options: { skipAuth: true },
            });

            teamsData =
              publicResponse?.teams ??
              publicResponse?.content ??
              publicResponse ??
              [];

            response = publicResponse;
          } catch (publicErr) {
            console.warn("Tentativa pública falhou:", publicErr);
          }
        }

        if (user && teamsData.length > 0) {
          const currentUserId = String(user.id || user.playerId);

          const myTeams = teamsData.filter((team) => {
            if (team.leader) {
              const leaderId = String(
                team.leader.id || team.leader.playerId || team.leaderId
              );
              if (leaderId === currentUserId) return true;
            }

            if (team.players && Array.isArray(team.players)) {
              const isPlayerInTeam = team.players.some((player) => {
                const playerId = String(player.id || player.playerId);
                return playerId === currentUserId;
              });
              if (isPlayerInTeam) return true;
            }

            return false;
          });

          setTeams(myTeams);
        } else {
          setTeams(teamsData);
        }
      } catch (err) {
        console.error("Erro ao buscar equipes:", err);
        if (err && err.status === 403) {
          try {
            const publicResponse = await api.teams.getAll({
              options: { skipAuth: true },
            });
            const publicTeams =
              publicResponse?.teams ??
              publicResponse?.content ??
              publicResponse ??
              [];
            setTeams(Array.isArray(publicTeams) ? publicTeams : []);
            setLoading(false);
            return;
          } catch (publicErr) {
            console.warn("Tentativa pública falhou (catch):", publicErr);
            setError(publicErr.message || "Falha ao carregar equipes.");
            setLoading(false);
            return;
          }
        }

        setError(err.message || "Falha ao carregar equipes.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();

    const handleTeamsChanged = () => {
      fetchTeams();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("teams:changed", handleTeamsChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("teams:changed", handleTeamsChanged);
      }
    };
  }, [authLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-3 border-purple-500 border-t-transparent"></div>
        <span className="ml-3 text-gray-600 font-medium text-sm sm:text-base">
          Carregando equipes...
        </span>
      </div>
    );
  }

  if (error) {
    const errMsg =
      typeof error === "string"
        ? error
        : error?.message || `${error?.status ?? ""} ${error?.statusText ?? ""}`;
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-red-500 text-sm sm:text-base">⚠️ Erro: {errMsg}</p>
        {error?.body && (
          <pre className="text-xs text-gray-600 mt-2 overflow-x-auto p-2 bg-gray-50 rounded">
            {JSON.stringify(error.body, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-gray-500 text-sm sm:text-base">
          📋 Nenhuma equipe encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
