"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { Plus, Minus } from "lucide-react";

export default function GameInfoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [game, setGame] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [goals, setGoals] = useState([]); // Array de gols conforme o JSON
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isAuthenticated && id) {
      loadGameData();
    }
  }, [isAuthenticated, id]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const [gameData, participantsData] = await Promise.all([
        api.games.getById(id),
        api.gameParticipants.getByGame(id),
      ]);

      setGame(gameData);
      const participantsList =
        participantsData.content || participantsData || [];
      setParticipants(participantsList);

      // Verificar se o usuário é o host
      if (user?.id !== gameData.hostId) {
        showToast("Apenas o host pode gerenciar este jogo", "error");
        router.push(`/games`);
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar dados do jogo:", error);
      showToast("Erro ao carregar informações do jogo", "error");
    } finally {
      setLoading(false);
    }
  };

  const addGoal = (playerId, teamSide) => {
    const newGoal = {
      playerId: parseInt(playerId),
      teamSide: teamSide,
      minute: 0, // Pode ser expandido depois para adicionar minuto
      isOwnGoal: false,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const removeGoal = (playerId, teamSide) => {
    setGoals((prev) => {
      const index = prev.findIndex(
        (g) => g.playerId === parseInt(playerId) && g.teamSide === teamSide
      );
      if (index !== -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
  };

  const getPlayerGoalCount = (playerId) => {
    return goals.filter((g) => g.playerId === parseInt(playerId)).length;
  };

  const calculateTeamGoals = (teamSide) => {
    return goals.filter((g) => g.teamSide === teamSide && !g.isOwnGoal).length;
  };

  const getTeamScorers = (teamSide) => {
    const scorers = {};
    goals
      .filter((g) => g.teamSide === teamSide && !g.isOwnGoal)
      .forEach((g) => {
        const player = participants.find((p) => p.player.id === g.playerId);
        if (player) {
          const name = player.player.username;
          scorers[name] = (scorers[name] || 0) + 1;
        }
      });
    return scorers;
  };

  const handleFinishGame = async () => {
    try {
      setSubmitting(true);

      const team1Goals = calculateTeamGoals(1);
      const team2Goals = calculateTeamGoals(2);

      const payload = {
        homeGoals: team1Goals,
        awayGoals: team2Goals,
        goals: goals,
        notes: notes || null,
      };

      console.log("🎯 Finalizando jogo com payload:", payload);
      console.log("🔑 Token presente:", !!user);

      // Enviar para a API
      const response = await api.games.finishGame(id, payload);
      console.log("✅ Resposta da API:", response);

      showToast("Jogo finalizado com sucesso!", "success");
      router.push("/games");
    } catch (error) {
      console.error("❌ Erro ao finalizar jogo:", error);
      console.error("📋 Detalhes do erro:", {
        message: error.message,
        status: error.status,
        body: error.body,
      });
      showToast("Erro ao finalizar jogo", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-page min-h-screen">
        <main className="container mx-auto p-4 mt-8 max-w-6xl">
          <div className="bg-surface border border-default rounded-2xl shadow-elevated p-8">
            <h1 className="text-3xl font-bold text-primary text-center">
              Carregando...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-page min-h-screen">
        <main className="container mx-auto p-4 mt-8 max-w-6xl">
          <div className="bg-surface border border-default rounded-2xl shadow-elevated p-8">
            <h1 className="text-3xl font-bold text-primary text-center">
              Jogo não encontrado
            </h1>
          </div>
        </main>
      </div>
    );
  }

  const team1Participants = participants.filter((p) => p.teamSide === 1);
  const team2Participants = participants.filter((p) => p.teamSide === 2);
  const team1Goals = calculateTeamGoals(1);
  const team2Goals = calculateTeamGoals(2);
  const team1Scorers = getTeamScorers(1);
  const team2Scorers = getTeamScorers(2);

  return (
    <div className="bg-page min-h-screen pb-24">
      <main className="container mx-auto p-4 mt-8 max-w-6xl">
        <div className="bg-surface border border-default rounded-2xl shadow-elevated p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="text-secondary hover:text-primary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Finalizar Jogo
            </h1>
            <div className="w-6"></div>
          </div>

          {/* Game Info */}
          <div className="bg-surface-muted rounded-xl p-4 mb-6">
            <h2 className="text-xl font-semibold text-primary mb-2">
              {game.gameName || game.championship || "Partida"}
            </h2>
            <p className="text-secondary text-sm">
              {new Date(game.gameDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-secondary text-sm">{game.venue}</p>
          </div>

          {/* Placar Principal */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 md:p-8 mb-6 border-2 border-purple-400">
            <div className="flex items-start justify-between gap-4 md:gap-8">
              {/* Team 1 - Azul */}
              <div className="flex-1 space-y-3">
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                    Time 1
                  </h2>
                  <div className="bg-blue-500/30 backdrop-blur rounded-xl p-4 md:p-6 border-2 border-blue-400">
                    <div className="text-5xl md:text-6xl font-bold text-white">
                      {team1Goals}
                    </div>
                  </div>
                </div>

                {/* Artilheiros Time 1 */}
                {Object.keys(team1Scorers).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(team1Scorers).map(([name, count]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between bg-blue-500/20 backdrop-blur rounded-lg p-2 md:p-3 border border-blue-400"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-400 flex-shrink-0"></div>
                          <span className="font-medium text-white text-sm md:text-base truncate">
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xl md:text-2xl font-bold text-white">
                            {count}
                          </span>
                          <button
                            onClick={() =>
                              removeGoal(
                                participants.find(
                                  (p) => p.player.username === name
                                )?.player.id,
                                1
                              )
                            }
                            className="w-6 h-6 md:w-7 md:h-7 rounded bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                            title="Remover gol"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* X Central */}
              <div className="flex items-center justify-center pt-8 md:pt-12">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white">
                  ×
                </div>
              </div>

              {/* Team 2 - Vermelho */}
              <div className="flex-1 space-y-3">
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                    Time 2
                  </h2>
                  <div className="bg-red-500/30 backdrop-blur rounded-xl p-4 md:p-6 border-2 border-red-400">
                    <div className="text-5xl md:text-6xl font-bold text-white">
                      {team2Goals}
                    </div>
                  </div>
                </div>

                {/* Artilheiros Time 2 */}
                {Object.keys(team2Scorers).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(team2Scorers).map(([name, count]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between bg-red-500/20 backdrop-blur rounded-lg p-2 md:p-3 border border-red-400"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-400 flex-shrink-0"></div>
                          <span className="font-medium text-white text-sm md:text-base truncate">
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xl md:text-2xl font-bold text-white">
                            {count}
                          </span>
                          <button
                            onClick={() =>
                              removeGoal(
                                participants.find(
                                  (p) => p.player.username === name
                                )?.player.id,
                                2
                              )
                            }
                            className="w-6 h-6 md:w-7 md:h-7 rounded bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                            title="Remover gol"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Times e Lista de Jogadoras */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Time 1 - Azul */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Time 1 - Jogadoras
              </h3>
              <div className="space-y-2">
                {team1Participants.length > 0 ? (
                  team1Participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between bg-surface-muted rounded-lg p-3 border border-blue-400/30 hover:border-blue-400/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400"></div>
                        <span className="text-primary font-medium">
                          {participant.player.username}
                        </span>
                      </div>
                      <button
                        onClick={() => addGoal(participant.player.id, 1)}
                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors text-white shadow-lg"
                        title="Adicionar gol"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm text-center py-4">
                    Nenhuma jogadora no Time 1
                  </p>
                )}
              </div>
            </div>

            {/* Time 2 - Vermelho */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Time 2 - Jogadoras
              </h3>
              <div className="space-y-2">
                {team2Participants.length > 0 ? (
                  team2Participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between bg-surface-muted rounded-lg p-3 border border-red-400/30 hover:border-red-400/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-400"></div>
                        <span className="text-primary font-medium">
                          {participant.player.username}
                        </span>
                      </div>
                      <button
                        onClick={() => addGoal(participant.player.id, 2)}
                        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors text-white shadow-lg"
                        title="Adicionar gol"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm text-center py-4">
                    Nenhuma jogadora no Time 2
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="mb-6">
            <label className="block text-primary font-semibold mb-2">
              Notas do Jogo (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o jogo..."
              className="w-full px-4 py-3 border border-default rounded-lg bg-surface text-primary min-h-[100px] resize-none"
            />
          </div>

          {/* Botão Finalizar */}
          <button
            onClick={handleFinishGame}
            disabled={submitting}
            className="w-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-4 rounded-lg font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-400"
          >
            {submitting ? "Finalizando..." : "Finalizar jogo"}
          </button>
        </div>
      </main>
    </div>
  );
}
