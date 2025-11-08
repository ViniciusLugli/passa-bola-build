"use client";

import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

function TeamCard({ team }) {
  const teamName = team?.name ?? team?.nameTeam ?? team?.teamName ?? "Equipe sem nome";
  const teamBio = team?.bio ?? team?.description ?? "";
  const teamLogoUrl = team?.logoUrl || team?.logo || null;
  const followersCount = team?.followers ?? team?.playerCount ?? team?.players?.length ?? 0;

  return (
    <Link
      href={`/teams/${team.id}`}
      className="block bg-surface border border-default rounded-xl hover:border-accent hover:bg-surface-elevated hover:shadow-elevated transition-all duration-200 ease-in-out overflow-hidden"
    >
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-surface-muted border border-default flex-shrink-0">
            {teamLogoUrl ? (
              <Image
                src={teamLogoUrl}
                alt={`Logo do ${teamName}`}
                fill
                sizes="48px"
                className="object-cover"
                onLoad={() => console.log("Team logo loaded:", teamLogoUrl)}
                onError={() => console.log("Team logo failed to load:", teamLogoUrl)}
              />
            ) : (
              <div className="w-full h-full bg-surface-elevated rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-primary mb-1 truncate">
              {teamName}
            </h2>
            <div className="flex items-center text-zinc-500 dark:text-gray-300 text-xs sm:text-sm font-medium">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" strokeWidth={2} />
              <span>{followersCount} jogadoras</span>
            </div>
          </div>
        </div>
        
        {teamBio && (
          <p className="text-secondary text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {teamBio}
          </p>
        )}
      </div>
    </Link>
  );
}

export default TeamCard;
