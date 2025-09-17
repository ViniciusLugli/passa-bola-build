"use client";

import Link from "next/link";

function TeamCard({ team }) {
  return (
    <Link
      href={`/user/${team.id}`}
      className="
        block 
        bg-white 
        rounded-lg 
        shadow-md 
        hover:shadow-lg 
        transition-shadow 
        duration-200 
        ease-in-out 
        overflow-hidden
      "
    >
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {team.name}
        </h2>
        <p className="text-gray-600 text-sm mb-2">{team.bio}</p>
        <div className="flex items-center text-gray-500 text-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <span>{team.followers} seguidores</span>
        </div>
      </div>
    </Link>
  );
}

export default TeamCard;
