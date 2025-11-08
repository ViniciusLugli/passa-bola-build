"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import TeamCard from "@/app/components/cards/TeamCard";
import { useAuth } from "@/app/context/AuthContext";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";
import EmptyState from "@/app/components/ui/EmptyState";
import ErrorState from "@/app/components/ui/ErrorState";
import { Users, Plus } from "lucide-react";
import Button from "@/app/components/ui/Button";

export default function TeamList({ query = "", onlyMine = false }) {
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

        const currentUserId = user ? String(user.id || user.playerId) : null;

        const isUserInTeam = (team) => {
          if (!currentUserId) return false;
          if (team.leader) {
            const leaderId = String(
              team.leader.id || team.leader.playerId || team.leaderId || ""
            );
            if (leaderId === currentUserId) return true;
          }
          if (team.players && Array.isArray(team.players)) {
            return team.players.some((player) => {
              const playerId = String(player.id || player.playerId || "");
              return playerId === currentUserId;
            });
          }
          return false;
        };

        let uniqueTeams = Array.isArray(teamsData) ? teamsData : [];
        if (uniqueTeams.length > 0) {
          const seen = new Map();
          uniqueTeams.forEach((t) => {
            const id = t?.id ?? t?.teamId ?? JSON.stringify(t);
            if (!seen.has(id)) seen.set(id, t);
          });
          if (seen.size !== uniqueTeams.length) {
            console.warn(
              `Detected duplicate teams from API (original: ${uniqueTeams.length}, unique: ${seen.size}). Deduping client-side.`
            );
          }
          uniqueTeams = Array.from(seen.values());
        }

        const userTeams = uniqueTeams.filter((t) => isUserInTeam(t));

        const sortedUserTeams = userTeams.sort((a, b) => {
          const aName = (a?.name || a?.nameTeam || "").toString().toLowerCase();
          const bName = (b?.name || b?.nameTeam || "").toString().toLowerCase();
          if (aName < bName) return -1;
          if (aName > bName) return 1;
          return 0;
        });

        setTeams(sortedUserTeams);
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
  }, [authLoading, user]);

  if (loading) {
    return <LoadingSkeleton count={6} variant="card" />;
  }

  if (error) {
    const errMsg =
      typeof error === "string"
        ? error
        : error?.message || `${error?.status ?? ""} ${error?.statusText ?? ""}`;
    return (
      <ErrorState
        title="Erro ao carregar equipes"
        message={errMsg}
        onRetry={() => window.location.reload()}
        variant="error"
      />
    );
  }

  const normalized = (s) => (s || "").toString().toLowerCase().trim();
  const hasQuery = normalized(query).length > 0;
  const filtered = hasQuery
    ? teams.filter((t) =>
        normalized(t.name ?? t.nameTeam ?? t.teamName).includes(
          normalized(query)
        )
      )
    : teams;

  if (filtered.length === 0) {
    if (!hasQuery) {
      return (
        <EmptyState
          icon={<Users />}
          title="Você ainda não tem equipes"
          description={
            user?.userType === "PLAYER"
              ? "Crie sua primeira equipe para começar a jogar e organizar partidas."
              : "Procure por equipes ou peça para alguém te convidar."
          }
          action={
            user?.userType === "PLAYER" ? (
              <Button onClick={() => (window.location.href = "/teams/newTeam")}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Equipe
              </Button>
            ) : undefined
          }
          variant="gradient"
        />
      );
    }

    return (
      <EmptyState
        icon={<Users />}
        title={`Nenhuma equipe encontrada para "${query}"`}
        description="Tente outro termo de busca ou ajuste os filtros."
        variant="bordered"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {filtered.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
