"use client";

import { useEffect, useState } from "react";
import GameCard from "@/app/components/cards/GameCard";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { getGameTypeLabel } from "@/app/lib/gameUtils";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";
import EmptyState from "@/app/components/ui/EmptyState";
import ErrorState from "@/app/components/ui/ErrorState";
import { Calendar, Plus } from "lucide-react";
import Button from "@/app/components/ui/Button";

function Games() {
  const [games, setGames] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: loggedInUser, isAuthenticated } = useAuth();

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => setSelectedTypes([]);

  const groupGamesByDay = (gamesList) => {
    const map = {};
    gamesList.forEach((g) => {
      const d = new Date(g.gameDate);
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(g);
    });
    return map;
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.games.getAll();
      let fetchedGames = response.content || [];

      if (isAuthenticated && loggedInUser) {
        const role = String(loggedInUser.userType || "").toUpperCase();
        if (role === "PLAYER" || role === "ORGANIZATION") {
          try {
            const participationsResponse =
              await api.gameParticipants.getMyParticipations({
                page: 0,
                size: 100,
              });
            const myParticipations = participationsResponse.content || [];

            // Criar um Set com os IDs dos jogos em que estou inscrito
            const joinedGameIds = new Set(
              myParticipations
                .map((p) => p.gameId || p.game?.id)
                .filter(Boolean)
            );

            // Marcar cada jogo com isJoined
            fetchedGames = fetchedGames.map((game) => {
              const isJoined = joinedGameIds.has(game.id);
              return {
                ...game,
                isJoined,
              };
            });
          } catch (participationError) {
            console.error("Erro ao buscar participações:", participationError);
            // Continua sem marcar jogos como joined
          }
        } else {
          // Usuários SPECTATOR não possuem participações via this endpoint; skip para evitar 403 no servidor
        }
      }

      setGames(fetchedGames);
      const types = Array.from(
        new Set(fetchedGames.map((g) => g.gameType).filter(Boolean))
      );
      setAvailableTypes(types);
    } catch (err) {
      console.error("Erro ao buscar jogos:", err);
      setError(err.message || "Falha ao carregar os jogos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated]);

  const handleGameUpdate = () => {
    fetchGames();
  };

  return (
    <div className="transparent min-h-screen pb-24 sm:pb-20">
      <main
        className="
        container 
        mx-auto 
        px-3 sm:px-4 md:px-6 lg:px-8
        py-4 sm:py-6 md:py-8 lg:py-12 
        max-w-7xl
      "
      >
        <div className="bg-surface border border-default rounded-2xl shadow-elevated p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 md:mb-10">
            <h1
              className="
              text-2xl sm:text-3xl md:text-4xl lg:text-5xl
              font-extrabold 
              text-primary 
              leading-tight
              text-center sm:text-left
            "
            >
              Jogos Disponíveis
            </h1>

            <div className="mt-4 sm:mt-0">
              <div className="sm:hidden">
                <Link
                  href="/games/newGame"
                  className="block w-full text-center bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg"
                >
                  Criar jogo
                </Link>
              </div>
              <div className="hidden sm:block">
                <Link
                  href="/games/newGame"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-colors"
                >
                  Criar jogo
                </Link>
              </div>
            </div>
          </div>

          {loading && <LoadingSkeleton count={5} variant="card" />}

          {error && (
            <ErrorState
              title="Erro ao carregar jogos"
              message={error}
              onRetry={fetchGames}
              variant="error"
            />
          )}

          {!loading && !error && (
            <section className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Filters */}
              {availableTypes.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {availableTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        selectedTypes.includes(t)
                          ? "bg-accent text-on-brand border-accent"
                          : "bg-surface text-primary border-default"
                      }`}
                    >
                      {getGameTypeLabel(t)}
                    </button>
                  ))}

                  {availableTypes.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-secondary underline ml-2"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}

              {/* Mini calendar (next 7 days) */}
              {games.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    Próximos 7 dias
                  </h3>
                  <div className="overflow-x-auto -mx-4 px-4">
                    <div className="inline-flex gap-3">
                      {(() => {
                        const grouped = groupGamesByDay(games);
                        const now = new Date();
                        const days = [];
                        for (let i = 0; i < 7; i++) {
                          const d = new Date(now);
                          d.setDate(now.getDate() + i);
                          const key = d.toISOString().slice(0, 10);
                          days.push({
                            date: d,
                            key,
                            games: grouped[key] || [],
                          });
                        }

                        return days.map((day) => (
                          <div
                            key={day.key}
                            className="min-w-[190px] bg-surface rounded-xl p-3 border border-default shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="text-sm text-secondary">
                                  {day.date.toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                  })}
                                </div>
                                <div className="font-bold text-base">
                                  {day.date.toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </div>
                              </div>
                              <div className="text-sm text-secondary">
                                {day.games.length} partidas
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {day.games.length > 0 ? (
                                day.games
                                  .filter((g) =>
                                    selectedTypes.length
                                      ? selectedTypes.includes(g.gameType)
                                      : true
                                  )
                                  .map((g) => (
                                    <div
                                      key={g.id}
                                      className="block text-sm text-primary truncate"
                                      title={
                                        g.gameName ||
                                        g.championship ||
                                        "Partida"
                                      }
                                    >
                                      {new Date(g.gameDate).toLocaleTimeString(
                                        "pt-BR",
                                        { hour: "2-digit", minute: "2-digit" }
                                      )}{" "}
                                      —{" "}
                                      {g.gameName ||
                                        g.championship ||
                                        "Partida"}
                                    </div>
                                  ))
                              ) : (
                                <div className="text-sm text-tertiary">
                                  Sem partidas
                                </div>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {games.length > 0 ? (
                games
                  .filter((g) =>
                    selectedTypes.length
                      ? selectedTypes.includes(g.gameType)
                      : true
                  )
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onGameUpdate={handleGameUpdate}
                    />
                  ))
              ) : (
                <EmptyState
                  icon={<Calendar />}
                  title="Nenhum jogo disponível"
                  description="Seja a primeira a criar um jogo e começar a jogar!"
                  action={
                    <Button
                      onClick={() => (window.location.href = "/games/newGame")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Jogo
                    </Button>
                  }
                  variant="gradient"
                />
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GamesPage() {
  return <Games />;
}
