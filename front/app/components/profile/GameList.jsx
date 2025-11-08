"use client";

import GameCard from "@/app/components/cards/GameCard";
import { Calendar } from "lucide-react";

export default function GameList({ games = [], isLoading = false, onGameUpdate }) {
  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="bg-surface border border-default rounded-2xl p-6 animate-pulse"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                <div className="h-6 bg-surface-elevated rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-surface-elevated rounded w-full mb-2"></div>
                <div className="h-4 bg-surface-elevated rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-surface-elevated rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-surface-elevated rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!games || games.length === 0) {
    return (
      <div className="bg-surface-muted border border-default rounded-2xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-surface-elevated rounded-full">
            <Calendar className="h-12 w-12 md:h-16 md:w-16 text-secondary opacity-50" />
          </div>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">
          Nenhum jogo encontrado
        </h3>
        <p className="text-secondary text-sm md:text-base mb-6">
          Este perfil ainda não participou de nenhum jogo.
        </p>
      </div>
    );
  }

  // Display games in list
  return (
    <div className="space-y-4">
      {games.map((game) => (
        <GameCard
          key={game.id || game.gameId}
          game={game}
          onGameUpdate={onGameUpdate}
        />
      ))}
    </div>
  );
}
