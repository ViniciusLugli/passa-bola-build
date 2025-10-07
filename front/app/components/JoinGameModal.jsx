"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function JoinGameModal({
  isOpen,
  onClose,
  gameId,
  game,
  onSuccess,
}) {
  const { user } = useAuth();
  const [step, setStep] = useState("participationType");
  const [participationType, setParticipationType] = useState(null);
  const [teamSide, setTeamSide] = useState(null);
  const [playerTeams, setPlayerTeams] = useState([]);
  const [selectedPlayerTeam, setSelectedPlayerTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (
      isOpen &&
      participationType === "WITH_TEAM" &&
      step === "selectPlayerTeam"
    ) {
      fetchPlayerTeams();
    }
  }, [isOpen, participationType, step]);

  const fetchPlayerTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.teams.getAll({ page: 0, size: 100 });
      const allTeams = response.content || [];

      const leaderTeams = allTeams.filter((team) => {
        if (!team.leader) return false;

        const leaderId = String(
          team.leader.id || team.leader.playerId || team.leaderId
        );
        const currentUserId = String(user.id || user.playerId);

        return leaderId === currentUserId;
      });

      setPlayerTeams(leaderTeams);
    } catch (err) {
      console.error("Erro ao buscar times:", err);
      setError("Erro ao carregar seus times.");
    } finally {
      setLoading(false);
    }
  };

  const handleParticipationTypeSelect = (type) => {
    setParticipationType(type);
    if (type === "INDIVIDUAL") {
      setStep("selectTeamSide");
    } else {
      setStep("selectPlayerTeam");
    }
  };

  const validateTeamCapacity = (side, teamPlayerCount) => {
    if (!game || !game.maxPlayers) return true;

    const halfCapacity = Math.floor(game.maxPlayers / 2);
    const currentTeamCount =
      side === 1 ? game.team1Count || 0 : game.team2Count || 0;
    const newTotalCount = currentTeamCount + teamPlayerCount;

    if (newTotalCount > halfCapacity) {
      setError(
        `Este time já tem ${currentTeamCount} jogadora${
          currentTeamCount !== 1 ? "s" : ""
        }. ` +
          `Você está tentando adicionar ${teamPlayerCount} jogadora${
            teamPlayerCount !== 1 ? "s" : ""
          }, ` +
          `mas o limite é ${halfCapacity} jogadoras por time (metade de ${game.maxPlayers}).`
      );
      return false;
    }

    return true;
  };

  const validateTeamBalance = (side) => {
    if (!game) return { valid: true, message: "" };

    const team1Count = game.team1Count || 0;
    const team2Count = game.team2Count || 0;

    // Se os times estão balanceados ou o time escolhido tem menos jogadores, permitir
    if (team1Count === team2Count) {
      return { valid: true, message: "" };
    }

    // Se tentar se inscrever no time com MAIS jogadores, bloquear
    if (side === 1 && team1Count > team2Count) {
      return {
        valid: false,
        message: `Os times estão desbalanceados. Time 1 tem ${team1Count} jogadora${
          team1Count !== 1 ? "s" : ""
        } e Time 2 tem ${team2Count}. Você só pode se inscrever no Time 2 para equilibrar.`,
      };
    }

    if (side === 2 && team2Count > team1Count) {
      return {
        valid: false,
        message: `Os times estão desbalanceados. Time 2 tem ${team2Count} jogadora${
          team2Count !== 1 ? "s" : ""
        } e Time 1 tem ${team1Count}. Você só pode se inscrever no Time 1 para equilibrar.`,
      };
    }

    return { valid: true, message: "" };
  };

  const handleTeamSideSelect = async (side) => {
    setTeamSide(side);
    setError(null);

    // Validar balanceamento dos times PRIMEIRO
    const balanceValidation = validateTeamBalance(side);
    if (!balanceValidation.valid) {
      setError(balanceValidation.message);
      return; // Bloqueia a inscrição
    }

    // Determinar quantas jogadoras serão adicionadas
    let playerCount = 1; // Individual
    if (participationType === "WITH_TEAM" && selectedPlayerTeam) {
      const selectedTeam = playerTeams.find((t) => t.id === selectedPlayerTeam);
      playerCount = selectedTeam ? selectedTeam.playerCount || 0 : 0;
    }

    // Validar capacidade do time
    if (!validateTeamCapacity(side, playerCount)) {
      return; // Bloqueia a inscrição
    }

    if (participationType === "INDIVIDUAL") {
      await handleJoinGame(side, "INDIVIDUAL", null);
    } else if (participationType === "WITH_TEAM") {
      await handleJoinGame(side, "WITH_TEAM", selectedPlayerTeam);
    }
  };

  const handlePlayerTeamSelect = (teamId) => {
    setSelectedPlayerTeam(teamId);
    setStep("selectTeamSide");
  };

  const handleJoinGame = async (side, type, playerTeamId) => {
    try {
      setLoading(true);
      setError(null);

      await api.gameParticipants.join({
        gameId: gameId,
        participationType: type,
        teamSide: side,
      });

      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao se inscrever:", err);
      setError(err.message || "Erro ao se inscrever no jogo.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("participationType");
    setParticipationType(null);
    setTeamSide(null);
    setSelectedPlayerTeam(null);
    setPlayerTeams([]);
    setError(null);
    onClose();
  };

  const handleBack = () => {
    if (step === "selectTeamSide" && participationType === "INDIVIDUAL") {
      setStep("participationType");
      setParticipationType(null);
    } else if (step === "selectTeamSide" && participationType === "WITH_TEAM") {
      setStep("selectPlayerTeam");
      setTeamSide(null);
    } else if (step === "selectPlayerTeam") {
      setStep("participationType");
      setParticipationType(null);
      setSelectedPlayerTeam(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "participationType"
          ? "Como deseja participar?"
          : step === "selectPlayerTeam"
          ? "Selecione sua equipe"
          : "Escolha seu time"
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {step === "participationType" && (
        <div className="flex flex-col gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleParticipationTypeSelect("INDIVIDUAL");
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            Participar Sozinho(a)
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleParticipationTypeSelect("WITH_TEAM");
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            Participar com Equipe
          </button>
        </div>
      )}

      {step === "selectPlayerTeam" && (
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-center text-gray-500">Carregando equipes...</p>
          ) : playerTeams.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Selecione a equipe que você lidera:
              </p>
              {playerTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayerTeamSelect(team.id);
                  }}
                  className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-purple-500 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span>{team.nameTeam}</span>
                    <span className="text-sm text-gray-500">
                      {team.playerCount} jogadora
                      {team.playerCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors mt-2"
              >
                Voltar
              </button>
            </>
          ) : (
            <>
              <p className="text-center text-gray-500">
                Você não é líder de nenhuma equipe ainda.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Voltar
              </button>
            </>
          )}
        </div>
      )}

      {step === "selectTeamSide" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 mb-2">
            Em qual time você quer jogar?
          </p>

          {game && (
            <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
              <span>
                Time 1: {game.team1Count || 0} jogadora
                {(game.team1Count || 0) !== 1 ? "s" : ""}
              </span>
              <span>
                Time 2: {game.team2Count || 0} jogadora
                {(game.team2Count || 0) !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTeamSideSelect(1);
            }}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
              game && (game.team1Count || 0) > (game.team2Count || 0)
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            disabled={
              loading ||
              (game && (game.team1Count || 0) > (game.team2Count || 0))
            }
            title={
              game && (game.team1Count || 0) > (game.team2Count || 0)
                ? "Este time tem mais jogadores. Escolha o Time 2 para equilibrar."
                : ""
            }
          >
            {loading && teamSide === 1 ? "Inscrevendo..." : "Time 1"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTeamSideSelect(2);
            }}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
              game && (game.team2Count || 0) > (game.team1Count || 0)
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
            disabled={
              loading ||
              (game && (game.team2Count || 0) > (game.team1Count || 0))
            }
            title={
              game && (game.team2Count || 0) > (game.team1Count || 0)
                ? "Este time tem mais jogadores. Escolha o Time 1 para equilibrar."
                : ""
            }
          >
            {loading && teamSide === 2 ? "Inscrevendo..." : "Time 2"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors mt-2"
            disabled={loading}
          >
            Voltar
          </button>
        </div>
      )}
    </Modal>
  );
}
