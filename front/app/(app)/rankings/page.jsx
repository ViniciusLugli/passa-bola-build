"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, TrendingUp, Users } from "lucide-react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Image from "next/image";
import Link from "next/link";

export default function RankingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("players"); // 'players' or 'teams'
  const [activeDivision, setActiveDivision] = useState("all"); // 'all' or specific division
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const divisions = [
    { value: "all", label: "Todos", emoji: "🌍" },
    { value: "BRONZE", label: "Bronze", emoji: "🥉" },
    { value: "PRATA", label: "Prata", emoji: "🥈" },
    { value: "OURO", label: "Ouro", emoji: "🥇" },
    { value: "PLATINA", label: "Platina", emoji: "💎" },
    { value: "DIAMANTE", label: "Diamante", emoji: "💠" },
    { value: "MESTRE", label: "Mestre", emoji: "👑" },
    { value: "LENDARIA", label: "Lendária", emoji: "⭐" },
  ];

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchRankings();
    }
  }, [activeTab, activeDivision, authLoading, isAuthenticated]);

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;
      if (activeTab === "players") {
        if (activeDivision === "all") {
          const response = await api.rankings.getPlayersRanking({
            page: 0,
            size: 50,
          });
          data = response.content || response;
        } else {
          const response = await api.rankings.getPlayersByDivision(
            activeDivision,
            { page: 0, size: 50 }
          );
          data = response.content || response;
        }
      } else {
        if (activeDivision === "all") {
          const response = await api.rankings.getTeamsRanking({
            page: 0,
            size: 50,
          });
          data = response.content || response;
        } else {
          const response = await api.rankings.getTeamsByDivision(
            activeDivision,
            { page: 0, size: 50 }
          );
          data = response.content || response;
        }
      }
      setRankings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar rankings:", err);
      setError("Não foi possível carregar os rankings.");
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const getDivisionColor = (division) => {
    const colors = {
      BRONZE: "text-amber-700",
      PRATA: "text-gray-400",
      OURO: "text-yellow-400",
      PLATINA: "text-cyan-400",
      DIAMANTE: "text-purple-400",
      MESTRE: "text-red-400",
      LENDARIA: "text-blue-400",
    };
    return colors[division] || "text-gray-400";
  };

  const getDivisionBg = (division) => {
    const colors = {
      BRONZE: "bg-amber-700/10",
      PRATA: "bg-gray-400/10",
      OURO: "bg-yellow-400/10",
      PLATINA: "bg-cyan-400/10",
      DIAMANTE: "bg-purple-400/10",
      MESTRE: "bg-red-400/10",
      LENDARIA: "bg-blue-400/10",
    };
    return colors[division] || "bg-gray-400/10";
  };

  const getMedalIcon = (position) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return `#${position}`;
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Rankings
          </h1>
        </div>
        <p className="text-secondary">
          Confira as melhores jogadoras e times da plataforma
        </p>
      </div>

      {/* Tabs: Jogadoras vs Times */}
      <div className="flex gap-2 mb-6 border-b border-default">
        <button
          onClick={() => {
            setActiveTab("players");
            setActiveDivision("all");
          }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === "players"
              ? "border-primary text-primary"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <Users className="h-5 w-5" />
          Jogadoras
        </button>
        <button
          onClick={() => {
            setActiveTab("teams");
            setActiveDivision("all");
          }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === "teams"
              ? "border-primary text-primary"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <Medal className="h-5 w-5" />
          Times
        </button>
      </div>

      {/* Divisão Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {divisions.map((div) => (
          <button
            key={div.value}
            onClick={() => setActiveDivision(div.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeDivision === div.value
                ? "bg-primary text-white"
                : "bg-surface border border-default text-secondary hover:bg-surface-hover"
            }`}
          >
            <span>{div.emoji}</span>
            <span>{div.label}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rankings.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-secondary">Nenhum ranking disponível ainda.</p>
          <p className="text-secondary text-sm mt-2">
            Participe de jogos competitivos para aparecer no ranking!
          </p>
        </div>
      )}

      {/* Rankings List */}
      {!loading && !error && rankings.length > 0 && (
        <div className="bg-surface rounded-2xl border border-default overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-hover border-b border-default">
                <tr>
                  <th className="text-left p-4 text-secondary font-semibold">
                    Posição
                  </th>
                  <th className="text-left p-4 text-secondary font-semibold">
                    {activeTab === "players" ? "Jogadora" : "Time"}
                  </th>
                  <th className="text-center p-4 text-secondary font-semibold">
                    Divisão
                  </th>
                  <th className="text-center p-4 text-secondary font-semibold">
                    Pontos
                  </th>
                  <th className="text-center p-4 text-secondary font-semibold">
                    Jogos
                  </th>
                  <th className="text-center p-4 text-secondary font-semibold">
                    Taxa de Vitória
                  </th>
                  <th className="text-center p-4 text-secondary font-semibold">
                    Sequência
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((ranking, index) => {
                  const position =
                    activeDivision === "all"
                      ? ranking.globalPosition
                      : ranking.divisionPosition;
                  const isPlayer = activeTab === "players";
                  const profileUrl = isPlayer
                    ? `/user/player/${ranking.playerId}`
                    : `/teams/${ranking.teamId}`;

                  return (
                    <tr
                      key={ranking.id}
                      className="border-b border-default hover:bg-surface-hover transition-colors"
                    >
                      {/* Posição */}
                      <td className="p-4">
                        <span className="text-2xl font-bold text-primary">
                          {getMedalIcon(position)}
                        </span>
                      </td>

                      {/* Nome e Avatar */}
                      <td className="p-4">
                        <Link
                          href={profileUrl}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-hover">
                            <Image
                              src={
                                ranking.profilePhotoUrl ||
                                "/icons/user-default.png"
                              }
                              alt={
                                isPlayer ? ranking.playerName : ranking.teamName
                              }
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-primary">
                              {isPlayer ? ranking.playerName : ranking.teamName}
                            </p>
                            <p className="text-sm text-secondary">
                              @
                              {isPlayer
                                ? ranking.playerUsername
                                : ranking.leaderName}
                            </p>
                          </div>
                        </Link>
                      </td>

                      {/* Divisão */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getDivisionBg(
                            ranking.division
                          )} ${getDivisionColor(ranking.division)}`}
                        >
                          {ranking.divisionName}
                        </span>
                      </td>

                      {/* Pontos */}
                      <td className="p-4 text-center">
                        <span className="font-bold text-primary">
                          {ranking.totalPoints}
                        </span>
                      </td>

                      {/* Jogos */}
                      <td className="p-4 text-center">
                        <div className="text-sm">
                          <span className="text-green-500 font-semibold">
                            {ranking.gamesWon}V
                          </span>
                          <span className="text-secondary mx-1">/</span>
                          <span className="text-yellow-500 font-semibold">
                            {ranking.gamesDrawn}E
                          </span>
                          <span className="text-secondary mx-1">/</span>
                          <span className="text-red-500 font-semibold">
                            {ranking.gamesLost}D
                          </span>
                        </div>
                        <p className="text-xs text-secondary mt-1">
                          {ranking.totalGames} total
                        </p>
                      </td>

                      {/* Taxa de Vitória */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-primary">
                            {ranking.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Sequência */}
                      <td className="p-4 text-center">
                        <div className="text-sm">
                          <span
                            className={`font-bold ${
                              ranking.currentStreak >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {ranking.currentStreak >= 0 ? "+" : ""}
                            {ranking.currentStreak}
                          </span>
                          <p className="text-xs text-secondary mt-1">
                            Melhor: {ranking.bestStreak}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
