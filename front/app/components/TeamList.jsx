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
    return <p>Carregando equipes...</p>;
  }

  if (error) {
    const errMsg =
      typeof error === "string"
        ? error
        : error?.message || `${error?.status ?? ""} ${error?.statusText ?? ""}`;
    return (
      <div>
        <p className="text-red-500">Erro: {errMsg}</p>
        {error?.body && (
          <pre className="text-xs text-gray-600 mt-2">
            {JSON.stringify(error.body, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (teams.length === 0) {
    return <p>Nenhuma equipe encontrada.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
