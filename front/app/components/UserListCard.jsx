"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Componente para exibir um card de usuário em listas
 * (seguidores, seguindo, etc.)
 */
export default function UserListCard({ user }) {
  const getUserTypeLabel = (type) => {
    const types = {
      PLAYER: "Jogadora",
      ORGANIZATION: "Organização",
      SPECTATOR: "Espectador",
    };
    return types[type] || type;
  };

  return (
    <Link
      href={`/user/${user.userType.toLowerCase()}/${user.id}`}
      className="block"
    >
      <div className="bg-gray-50 border border-zinc-200 rounded-xl p-4 hover:border-purple-300 hover:bg-white hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
            <Image
              src={user.profilePhotoUrl || "/icons/user-default.png"}
              alt={user.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          {/* Informações do usuário */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
              {getUserTypeLabel(user.userType)}
            </span>
          </div>

          {/* Bio (opcional) */}
          {user.bio && (
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
