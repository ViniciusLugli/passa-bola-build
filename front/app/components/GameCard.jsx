"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { getGameTypeLabel } from "@/app/lib/gameUtils";

export default function GameCard({ game, onGameUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user: loggedInUser } = useAuth();
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

  const [isJoined, setIsJoined] = useState(game.isJoined);

  const handleJoinLeaveGame = async (e) => {
    e.stopPropagation();
    if (!loggedInUser) {
      router.push("/login");
      return;
    }

    try {
      if (isJoined) {
        await api.gameParticipants.leave(game.id);
        setIsJoined(false);
      } else {
        await api.gameParticipants.join({
          gameId: game.id,
          participationType: "INDIVIDUAL",
          teamSide: 1,
        });
        setIsJoined(true);
      }
      if (onGameUpdate) {
        onGameUpdate();
      }
    } catch (error) {
      console.error("Erro ao participar/sair do jogo:", error);
    }
  };

  const handleEditGame = (e) => {
    e.stopPropagation();
    router.push(`/games/edit/${game.id}`);
  };

  const isGameCreator = loggedInUser && loggedInUser.userId === game.hostId;

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        relative
        w-full
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        flex
        flex-col
        cursor-pointer
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
        ${isExpanded ? "shadow-2xl" : ""}
      `}
    >
      {/* Marcador de Tipo de Jogo (Flag/Banner) */}
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
          ${isExpanded ? "w-40 rounded-none rounded-t-2xl px-6 py-2" : ""}
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
            {gameAddress} / {gameDateFormatted}
          </p>
          {organizer && (
            <p className="text-sm text-gray-500">Organizador: {organizer}</p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 pt-4 z-10">
          <p className="text-gray-700 leading-relaxed">
            {game.description || "Nenhuma descrição disponível."}
          </p>
        </div>
      )}

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
      >
        {isGameCreator && (
          <button
            onClick={handleEditGame}
            className="p-1 rounded-full hover:bg-gray-300"
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
          className="p-1 rounded-full hover:bg-gray-300"
        >
          <Image
            src={isJoined ? "/icons/check.svg" : "/icons/adicionar.svg"}
            alt={isJoined ? "Adicionado" : "Adicionar"}
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
}
