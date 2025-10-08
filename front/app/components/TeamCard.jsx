"use client";

import Link from "next/link";

function TeamCard({ team }) {
  const teamName =
    team?.name ?? team?.nameTeam ?? team?.teamName ?? "Equipe sem nome";
  const teamBio = team?.bio ?? team?.description ?? "";
  const followersCount =
    team?.followers ?? team?.playerCount ?? team?.players?.length ?? 0;

  return (
    <Link
      href={`/teams/${team.id}`}
      className="
        block 
        bg-gray-50
        border
        border-zinc-200
        rounded-xl
        hover:border-purple-300
        hover:bg-white
        hover:shadow-md
        transition-all
        duration-200 
        ease-in-out 
        overflow-hidden
      "
    >
      <div className="p-3 sm:p-4 md:p-5">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2 truncate">
          {teamName}
        </h2>
        {teamBio && (
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
            {teamBio}
          </p>
        )}
        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <span>{followersCount} seguidores</span>
        </div>
      </div>
    </Link>
  );
}

export default TeamCard;
