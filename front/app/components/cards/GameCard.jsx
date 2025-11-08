"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Check, ClipboardCheck } from "lucide-react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { getGameTypeLabel } from "@/app/lib/gameUtils";
import JoinGameModal from "@/app/components/ui/JoinGameModal";
import GameVideos from "@/app/components/games/GameVideos";

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
    // If current user is SPECTATOR, we should verify spectator subscription via games endpoint
    const setInitialJoined = async () => {
      try {
        if (
          loggedInUser &&
          String(loggedInUser.userType).toUpperCase() === "SPECTATOR"
        ) {
          const resp = await api.games.isSpectatorSubscribed(game.id);
          // API may return { subscribed: true } or a boolean
          const subscribed =
            resp && (resp.subscribed === true || resp === true);
          setIsJoined(Boolean(subscribed));
        } else {
          setIsJoined(game.isJoined || false);
        }
      } catch (err) {
        // Fallback to game.isJoined if check fails
        setIsJoined(game.isJoined || false);
      }
    };

    setInitialJoined();
  }, [game.isJoined, game.id]);

  useEffect(() => {
    if (isExpanded) {
      fetchParticipants();
    }
  }, [isExpanded, game.id]);

  const [activeTab, setActiveTab] = useState("details");

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
        if (
          loggedInUser &&
          String(loggedInUser.userType).toUpperCase() === "SPECTATOR"
        ) {
          await api.games.unspectate(game.id);
        } else {
          await api.gameParticipants.leave(game.id);
        }
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

  const handleGameInfo = (e) => {
    e.stopPropagation();
    router.push(`/games/info/${game.id}`);
  };

  const requiredHostType =
    game && game.gameType === "CUP" ? "ORGANIZATION" : "PLAYER";
  const isGameCreator =
    loggedInUser &&
    String(loggedInUser.userType || "").toUpperCase() === requiredHostType &&
    String(loggedInUser.id || loggedInUser.playerId) === String(game.hostId);

  return (
    <div
      className={`
        relative
        w-full
        bg-surface
        border
        border-default
        rounded-2xl
        p-4 sm:p-5 md:p-6
        flex
        flex-col
        
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
        hover:border-accent
        hover:bg-surface-elevated
        hover:shadow-elevated
        ${
          isExpanded
            ? "border-accent bg-surface-elevated shadow-elevated pb-20 sm:pb-24"
            : "pb-20 sm:pb-24"
        }
      `}
    >
      <div
        className={`
          absolute 
          top-0 
          right-0 
          py-1.5 sm:py-2
          px-3 sm:px-4 md:px-5
          rounded-bl-2xl 
          text-xs sm:text-sm
          font-bold 
          text-white 
          transition-all 
          duration-300
          ${typeColors[game.gameType]}
          ${
            isExpanded
              ? "sm:w-40 rounded-none rounded-bl-2xl sm:px-6 sm:py-2.5"
              : ""
          }
        `}
      >
        {isExpanded ? (
          <div className="flex justify-center items-center gap-2">
            {statusIcons[game.gameType] && (
              <Image
                src={statusIcons[game.gameType]}
                alt={getGameTypeLabel(game.gameType)}
                width={18}
                height={18}
                className="hidden sm:block"
              />
            )}
            <span className="hidden sm:inline">
              {getGameTypeLabel(game.gameType).toUpperCase()}
            </span>
            <span className="sm:hidden">{getGameTypeLabel(game.gameType)}</span>
          </div>
        ) : (
          <span>{getGameTypeLabel(game.gameType)}</span>
        )}
      </div>

      <div
        className="flex justify-between items-start gap-3 sm:gap-4 z-10 pr-16 sm:pr-20 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsExpanded(!isExpanded);
        }}
      >
        <div className="grow min-w-0">
          <h3 className="font-bold text-base sm:text-lg md:text-xl text-primary leading-tight truncate sm:whitespace-normal">
            {gameTitle}
          </h3>
          <p className="text-xs sm:text-sm text-secondary mt-1 wrap-break-word">
            <span className="inline-block mr-1">📍</span>
            {gameAddress}
          </p>
          <p className="text-xs sm:text-sm text-secondary mt-0.5">
            <span className="inline-block mr-1">🕐</span>
            {gameDateFormatted}
          </p>
          {organizer && (
            <p className="text-xs sm:text-sm text-secondary mt-0.5">
              <span className="inline-block mr-1">👤</span>
              <span className="font-medium">Organizador:</span> {organizer}
            </p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 sm:mt-4 border-t border-default pt-3 sm:pt-4 z-10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === "details" ? "bg-accent text-on-brand" : "bg-surface text-primary border border-default"
              }`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === "videos" ? "bg-accent text-on-brand" : "bg-surface text-primary border border-default"
              }`}
            >
              Vídeos
            </button>
          </div>

          {activeTab === "details" && (
            <>
              <p className="text-sm sm:text-base text-secondary leading-relaxed mb-4 sm:mb-5">
                {game.description || "Nenhuma descrição disponível."}
              </p>

              {(game.gameType === "FRIENDLY" ||
                game.gameType === "CHAMPIONSHIP") && (
                <div className="mb-5 sm:mb-6 p-3 sm:p-4 md:p-5 bg-surface-muted rounded-xl border border-default shadow-elevated">
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-primary mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-accent">ℹ️</span>
                    Informações da Partida
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="bg-surface p-2.5 sm:p-3 rounded-lg shadow-elevated border border-default hover:border-accent transition-colors">
                      <div className="text-secondary text-[10px] sm:text-xs mb-1">Jogadoras</div>
                      <div className="font-bold text-base sm:text-lg text-primary">
                        {game.currentPlayerCount || participants.team1.length + participants.team2.length}
                        <span className="text-xs sm:text-sm text-secondary font-normal"> {" / "} {game.maxPlayers || "∞"}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-tertiary mt-0.5 sm:mt-1">Mínimo: {game.minPlayers || "N/A"}</div>
                    </div>

                    <div className="bg-surface p-2.5 sm:p-3 rounded-lg shadow-elevated border border-default hover:border-accent transition-colors">
                      <div className="text-secondary text-[10px] sm:text-xs mb-1">Distribuição</div>
                      <div className="font-bold text-base sm:text-lg text-primary">{game.team1Count || participants.team1.length} vs {game.team2Count || participants.team2.length}</div>
                      <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">{(game.team1Count || participants.team1.length) === 0 && (game.team2Count || participants.team2.length) === 0 ? <span className="text-tertiary">Sem jogadores</span> : game.isTeamsBalanced || participants.team1.length === participants.team2.length ? <span className="text-green-600 font-semibold">✓ Balanceado</span> : <span className="text-orange-500 font-semibold">⚠ Desbalanceado</span>}</div>
                    </div>

                    <div className="bg-surface p-2.5 sm:p-3 rounded-lg shadow-elevated border border-default hover:border-accent transition-colors">
                      <div className="text-secondary text-[10px] sm:text-xs mb-1">Pode Iniciar?</div>
                      <div className="font-bold text-base sm:text-lg">{game.canStart ? <span className="text-green-600">✓ Sim</span> : <span className="text-red-500">✗ Não</span>}</div>
                      {!game.canStart && (<div className="text-[10px] sm:text-xs text-tertiary mt-0.5 sm:mt-1 line-clamp-2">{game.currentPlayerCount < game.minPlayers ? `Faltam ${game.minPlayers - game.currentPlayerCount} jogadoras` : "Times desbalanceados"}</div>)}
                    </div>

                    <div className="bg-surface p-2.5 sm:p-3 rounded-lg shadow-elevated border border-default hover:border-accent transition-colors">
                      <div className="text-secondary text-[10px] sm:text-xs mb-1">Espectadores</div>

                      {game.hasSpectators ? (
                        <>
                          <div className="font-bold text-base sm:text-lg text-primary">{game.currentSpectatorCount ?? 0}<span className="text-xs sm:text-sm text-secondary font-normal"> {" / "} {game.maxSpectators || "∞"}</span></div>
                          <div className="text-[10px] sm:text-xs text-green-600 font-semibold mt-0.5 sm:mt-1">✓ Permitido</div>
                          {game.minSpectators && (<div className="text-[10px] sm:text-xs text-tertiary mt-0.5 sm:mt-1">Mínimo: {game.minSpectators}</div>)}
                        </>
                      ) : (
                        <div className="font-bold text-base sm:text-lg text-tertiary">✗ Não</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Jogadoras */}
              {(game.gameType === "FRIENDLY" || game.gameType === "CHAMPIONSHIP") && (
                <div className="mt-5 sm:mt-6">
                  <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 flex items-center gap-2"><span className="text-xl sm:text-2xl">👥</span>Jogadoras Inscritas</h4>

                  {loadingParticipants ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-3 border-accent border-t-transparent"></div>
                      <span className="ml-3 text-secondary font-medium text-sm sm:text-base">Carregando participantes...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="rounded-xl p-3 sm:p-4 border border-[rgb(59_130_246/0.35)] bg-[rgb(59_130_246/0.08)] shadow-elevated">
                        <h5 className="font-bold text-blue-700 mb-2 sm:mb-3 text-center text-sm sm:text-base flex items-center justify-center gap-2"><span className="text-lg sm:text-xl">🔵</span>Time 1 ({participants.team1.length})</h5>
                        {participants.team1.length > 0 ? (
                          <ul className="space-y-1.5 sm:space-y-2 max-h-60 overflow-y-auto">{participants.team1.map((participant, index) => (<li key={index} className="bg-surface rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm text-primary border border-[rgb(59_130_246/0.35)] hover:border-[rgb(37_99_235/0.6)] transition-colors shadow-elevated"><div className="font-semibold truncate">{participant.player?.name || participant.player?.username || "Jogadora"}</div>{participant.participationType === "WITH_TEAM" && (<div className="text-[10px] sm:text-xs text-secondary italic mt-0.5">(Com equipe)</div>)}</li>))}</ul>
                        ) : (
                          <div className="text-center py-6 sm:py-8"><p className="text-secondary text-xs sm:text-sm">Nenhuma jogadora</p></div>
                        )}
                      </div>

                      <div className="rounded-xl p-3 sm:p-4 border border-[rgb(244_63_94/0.35)] bg-[rgb(244_63_94/0.08)] shadow-elevated">
                        <h5 className="font-bold text-rose-700 mb-2 sm:mb-3 text-center text-sm sm:text-base flex items-center justify-center gap-2"><span className="text-lg sm:text-xl">🔴</span>Time 2 ({participants.team2.length})</h5>
                        {participants.team2.length > 0 ? (
                          <ul className="space-y-1.5 sm:space-y-2 max-h-60 overflow-y-auto">{participants.team2.map((participant, index) => (<li key={index} className="bg-surface rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm text-primary border border-[rgb(244_63_94/0.35)] hover:border-[rgb(225_29_72/0.6)] transition-colors shadow-elevated"><div className="font-semibold truncate">{participant.player?.name || participant.player?.username || "Jogadora"}</div>{participant.participationType === "WITH_TEAM" && (<div className="text-[10px] sm:text-xs text-secondary italic mt-0.5">(Com equipe)</div>)}</li>))}</ul>
                        ) : (
                          <div className="text-center py-6 sm:py-8"><p className="text-secondary text-xs sm:text-sm">Nenhuma jogadora</p></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "videos" && (
            <div className="mt-2">
              <GameVideos gameId={game.id} />
            </div>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div
        className="
          absolute 
          bottom-3 sm:bottom-4 
          right-3 sm:right-4 
          flex
          items-center 
          gap-1.5 sm:gap-2
          z-30
        "
        onClick={(e) => e.stopPropagation()}
      >
        {isGameCreator && (
          <>
            <button
              onClick={handleGameInfo}
              className="
                p-2 sm:p-2.5
                bg-green-500/20
                text-gray-800
                dark:text-gray-300
                rounded-full
                transition-all
                duration-200
                hover:scale-110
                hover:text-gray-900
                dark:hover:text-white
                active:scale-95
                shadow-elevated
                hover:shadow-lg
                border-2
                border-green-500/60
              "
              title="Informações do Jogo"
            >
              <ClipboardCheck
                className="w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={2}
              />
            </button>
            <button
              onClick={handleEditGame}
              className="
                p-2 sm:p-2.5
                bg-accent-soft
                text-gray-800
                dark:text-gray-300
                rounded-full
                transition-all
                duration-200
                hover:scale-110
                hover:text-gray-900
                dark:hover:text-white
                active:scale-95
                shadow-elevated
                hover:shadow-lg
                border-2
                border-accent
              "
              title="Editar Jogo"
            >
              <Pencil className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            </button>
          </>
        )}
        <button
          onClick={handleJoinLeaveGame}
          disabled={isProcessing}
          className={`
            p-2 sm:p-2.5
            rounded-full
            transition-all
            duration-200
            shadow-elevated
            hover:shadow-lg
            border-2
            ${
              isJoined
                ? "bg-[rgb(34_197_94/0.18)] hover:bg-[rgb(34_197_94/0.28)] border-[rgb(34_197_94/0.55)] text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                : "bg-accent border-accent text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }
            ${
              isProcessing
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-110 active:scale-95"
            }
          `}
          title={
            isProcessing
              ? "Processando..."
              : isJoined
              ? "Sair do jogo"
              : "Inscrever-se no jogo"
          }
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-[rgb(var(--color-text-primary))] border-t-transparent"></div>
          ) : isJoined ? (
            <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          ) : (
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          )}
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
