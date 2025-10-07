"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { getGameTypeLabel } from "@/app/lib/gameUtils";
import JoinGameModal from "./JoinGameModal";

export default function GameCard({ game, onGameUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [participants, setParticipants] = useState({ team1: [], team2: [] });
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const { user: loggedInUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const typeColors = {
    CHAMPIONSHIP: "bg-purple-800",
    FRIENDLY: "bg-green-600",
    CUP: "bg-blue-600",
  };

  const statusIcons = {
    CHAMPIONSHIP: "/icons/campeonato.svg",
    FRIENDLY: "/icons/amistoso.svg",
    CUP: "/icons/copa.svg",
  };

  const gameTitle = game.gameType === "CUP" ? game.championship : game.gameName;
  const gameAddress = game.venue;
  const gameDateFormatted = new Date(game.gameDate).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  let organizer = "";
  if (game.gameType === "CUP" && game.homeTeam && game.homeTeam.name) {
    organizer = game.homeTeam.name;
  } else if (game.hostUsername) {
    organizer = game.hostUsername;
  }

  const [isJoined, setIsJoined] = useState(game.isJoined || false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsJoined(game.isJoined || false);
  }, [game.isJoined, game.id]);

  useEffect(() => {
    if (isExpanded) {
      fetchParticipants();
    }
  }, [isExpanded, game.id]);

  const fetchParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const response = await api.gameParticipants.getByGame(game.id);

      const team1 = response.filter((p) => p.teamSide === 1);
      const team2 = response.filter((p) => p.teamSide === 2);

      setParticipants({ team1, team2 });
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleJoinLeaveGame = async (e) => {
    e.stopPropagation();

    if (!loggedInUser) {
      showToast(
        "Você precisa estar logado para se inscrever em jogos.",
        "error"
      );
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (isProcessing) return;

    if (isJoined) {
      setIsProcessing(true);
      try {
        await api.gameParticipants.leave(game.id);
        setIsJoined(false);
        showToast("Você saiu do jogo com sucesso!", "success");

        if (onGameUpdate) {
          onGameUpdate();
        }

        if (isExpanded) {
          fetchParticipants();
        }
      } catch (error) {
        console.error("Erro ao sair do jogo:", error);
        showToast(
          error.message || "Erro ao sair do jogo. Tente novamente.",
          "error"
        );
      } finally {
        setIsProcessing(false);
      }
    } else {
      setShowJoinModal(true);
    }
  };

  const handleJoinSuccess = () => {
    setIsJoined(true);
    showToast("Você se inscreveu no jogo com sucesso!", "success");

    if (onGameUpdate) {
      onGameUpdate();
    }

    if (isExpanded) {
      fetchParticipants();
    }
  };

  const handleEditGame = (e) => {
    e.stopPropagation();
    router.push(`/games/edit/${game.id}`);
  };

  // Usar user.id (ID do banco) ao invés de userId (ID do JWT)
  const isGameCreator =
    loggedInUser &&
    String(loggedInUser.id || loggedInUser.playerId) === String(game.hostId);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        relative
        w-full
        bg-gray-50
        border
        border-zinc-200
        rounded-xl
        p-6
        flex
        flex-col
        cursor-pointer
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
        hover:border-purple-300
        hover:bg-white
        ${isExpanded ? "border-purple-400 bg-white shadow-md" : ""}
      `}
    >
      <div
        className={`
          absolute 
          top-0 
          right-0 
          py-1 
          px-4 
          rounded-bl-2xl 
          text-sm 
          font-bold 
          text-white 
          transition-all 
          duration-300
          ${typeColors[game.gameType]}
          ${isExpanded ? "w-40 rounded-none rounded-bl-2xl px-6 py-2" : ""}
        `}
      >
        {isExpanded ? (
          <div className="flex justify-center items-center gap-2">
            {statusIcons[game.gameType] && (
              <Image
                src={statusIcons[game.gameType]}
                alt={getGameTypeLabel(game.gameType)}
                width={20}
                height={20}
              />
            )}
            <span>{getGameTypeLabel(game.gameType).toUpperCase()}</span>
          </div>
        ) : (
          <span>{getGameTypeLabel(game.gameType)}</span>
        )}
      </div>

      <div className="flex justify-between items-start gap-4 z-10">
        <div className="flex-grow">
          <h3 className="font-bold text-lg md:text-xl text-gray-900 leading-tight">
            {gameTitle}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {gameAddress} - {gameDateFormatted}
          </p>
          {organizer && (
            <p className="text-sm text-gray-500">Organizador: {organizer}</p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 pt-4 z-10">
          <p className="text-gray-700 leading-relaxed mb-4">
            {game.description || "Nenhuma descrição disponível."}
          </p>

          {(game.gameType === "FRIENDLY" ||
            game.gameType === "CHAMPIONSHIP") && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-purple-600">ℹ️</span>
                Informações da Partida
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">Jogadoras</div>
                  <div className="font-bold text-lg text-gray-800">
                    {game.currentPlayerCount ||
                      participants.team1.length + participants.team2.length}
                    <span className="text-sm text-gray-500 font-normal">
                      {" "}
                      / {game.maxPlayers || "∞"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Mínimo: {game.minPlayers || "N/A"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">Distribuição</div>
                  <div className="font-bold text-lg text-gray-800">
                    {game.team1Count || participants.team1.length} vs{" "}
                    {game.team2Count || participants.team2.length}
                  </div>
                  <div className="text-xs mt-1">
                    {(game.team1Count || participants.team1.length) === 0 &&
                    (game.team2Count || participants.team2.length) === 0 ? (
                      <span className="text-gray-400">Sem jogadores</span>
                    ) : game.isTeamsBalanced ||
                      participants.team1.length ===
                        participants.team2.length ? (
                      <span className="text-green-600 font-semibold">
                        ✓ Balanceado
                      </span>
                    ) : (
                      <span className="text-orange-600 font-semibold">
                        ⚠ Desbalanceado
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">
                    Pode Iniciar?
                  </div>
                  <div className="font-bold text-lg">
                    {game.canStart ? (
                      <span className="text-green-600">✓ Sim</span>
                    ) : (
                      <span className="text-red-600">✗ Não</span>
                    )}
                  </div>
                  {!game.canStart && (
                    <div className="text-xs text-gray-400 mt-1">
                      {game.currentPlayerCount < game.minPlayers
                        ? `Faltam ${
                            game.minPlayers - game.currentPlayerCount
                          } jogadoras`
                        : "Times desbalanceados"}
                    </div>
                  )}
                </div>

                {game.hasSpectators && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-gray-500 text-xs mb-1">
                      Espectadores
                    </div>
                    <div className="font-bold text-lg text-gray-800">
                      {game.hasSpectators ? (
                        <span className="text-green-600">✓ Permitido</span>
                      ) : (
                        <span className="text-gray-400">✗ Não</span>
                      )}
                    </div>
                    {game.minSpectators && (
                      <div className="text-xs text-gray-400 mt-1">
                        Mínimo: {game.minSpectators}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Jogadoras */}
          {(game.gameType === "FRIENDLY" ||
            game.gameType === "CHAMPIONSHIP") && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Jogadoras Inscritas
              </h4>

              {loadingParticipants ? (
                <p className="text-center text-gray-500 py-4">
                  Carregando participantes...
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
                    <h5 className="font-bold text-blue-800 mb-3 text-center">
                      Time 1 ({participants.team1.length})
                    </h5>
                    {participants.team1.length > 0 ? (
                      <ul className="space-y-2">
                        {participants.team1.map((participant, index) => (
                          <li
                            key={index}
                            className="bg-white rounded p-2 text-sm text-gray-800 border border-blue-200"
                          >
                            <div className="font-semibold">
                              {participant.player?.name ||
                                participant.player?.username ||
                                "Jogadora"}
                            </div>
                            {participant.participationType === "WITH_TEAM" && (
                              <div className="text-xs text-gray-500 italic">
                                (Com equipe)
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500 text-sm">
                        Nenhuma jogadora
                      </p>
                    )}
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-300">
                    <h5 className="font-bold text-red-800 mb-3 text-center">
                      Time 2 ({participants.team2.length})
                    </h5>
                    {participants.team2.length > 0 ? (
                      <ul className="space-y-2">
                        {participants.team2.map((participant, index) => (
                          <li
                            key={index}
                            className="bg-white rounded p-2 text-sm text-gray-800 border border-red-200"
                          >
                            <div className="font-semibold">
                              {participant.player?.name ||
                                participant.player?.username ||
                                "Jogadora"}
                            </div>
                            {participant.participationType === "WITH_TEAM" && (
                              <div className="text-xs text-gray-500 italic">
                                (Com equipe)
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500 text-sm">
                        Nenhuma jogadora
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div
        className="
          absolute 
          bottom-4 
          right-4 
          p-2 
          bg-gray-200/50 
          rounded-full 
          z-20
          transition-all 
          duration-200
          hover:scale-110
          flex items-center gap-2
        "
        onClick={(e) => e.stopPropagation()}
      >
        {isGameCreator && (
          <button
            onClick={handleEditGame}
            className="p-1 rounded-full hover:bg-gray-300"
            title="Editar Jogo"
          >
            <Image
              src="/icons/pencil.svg"
              alt="Editar Jogo"
              width={24}
              height={24}
            />
          </button>
        )}
        <button
          onClick={handleJoinLeaveGame}
          disabled={isProcessing}
          className={`p-1 rounded-full hover:bg-gray-300 ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title={
            isProcessing
              ? "Processando..."
              : isJoined
              ? "Sair do jogo"
              : "Inscrever-se no jogo"
          }
        >
          <Image
            src={isJoined ? "/icons/check.svg" : "/icons/adicionar.svg"}
            alt={isJoined ? "Inscrito" : "Inscrever-se"}
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Modal de inscrição */}
      <JoinGameModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        gameId={game.id}
        game={game}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}
