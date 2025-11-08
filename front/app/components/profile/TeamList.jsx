"use client";

import TeamCard from "@/app/components/cards/TeamCard";
import { Users } from "lucide-react";

export default function TeamList({ teams = [], isLoading = false }) {
  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="bg-surface border border-default rounded-xl p-5 animate-pulse"
          >
            <div className="h-6 bg-surface-elevated rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-surface-elevated rounded w-full mb-2"></div>
            <div className="h-4 bg-surface-elevated rounded w-5/6 mb-3"></div>
            <div className="h-4 bg-surface-elevated rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!teams || teams.length === 0) {
    return (
      <div className="bg-surface-muted border border-default rounded-2xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-surface-elevated rounded-full">
            <Users className="h-12 w-12 md:h-16 md:w-16 text-secondary opacity-50" />
          </div>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">
          Nenhum time encontrado
        </h3>
        <p className="text-secondary text-sm md:text-base mb-6">
          Este perfil ainda não participa de nenhum time.
        </p>
      </div>
    );
  }

  // Display teams in grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <TeamCard key={team.id || team.teamId} team={team} />
      ))}
    </div>
  );
}
