import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Player from "@/app/models/player";
import Organization from "@/app/models/organization";
import { api } from "@/app/lib/api";

export default function ProfileHeader({ user, loggedInUser, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers || 0);
  const [followingCount, setFollowingCount] = useState(user.following || 0);

  const isPlayer = user instanceof Player;
  const isOrganization = user instanceof Organization;

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (loggedInUser && user.userId && loggedInUser.userId !== user.userId) {
        try {
          const response = await api.follow.checkFollowing(
            user.userId,
            user.userType.toUpperCase()
          );
          setIsFollowing(response);
        } catch (error) {
          console.error("Erro ao verificar status de seguimento:", error);
          setIsFollowing(false);
        }
      } else {
        setIsFollowing(false);
      }
    };

    checkFollowingStatus();
    setFollowersCount(user.followers || 0);
    setFollowingCount(user.following || 0);
  }, [user, loggedInUser]);

  const handleFollow = async () => {
    try {
      await api.follow.follow(user.userId, user.userType.toUpperCase());
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Erro ao seguir usuário:", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.follow.unfollow(user.userId, user.userType.toUpperCase());
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Erro ao deixar de seguir usuário:", error);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-400 shadow-xl overflow-hidden relative">
      <div className="relative w-full h-40 md:h-64">
        <Image
          src={user.bannerUrl || "/icons/banner-default.jpeg"}
          alt="Banner do perfil"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="p-4 md:p-8 relative">
        <div className="flex justify-between items-start">
          <div
            className="
            relative 
            -mt-12 md:-mt-24 
            w-24 h-24 md:w-36 md:h-36 
            rounded-full 
            border-4 
            border-gray-200 
            bg-white
            overflow-hidden
          "
          >
            <Image
              src={user.profilePhotoUrl || "/icons/user-default.png"}
              alt="Avatar do perfil"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 24vw, 15vw"
            />
          </div>
          {loggedInUser &&
          loggedInUser.userId === user.userId &&
          loggedInUser.userType === user.userType ? (
            <Link
              href={`/user/${user.userType.toLowerCase()}/${user.id}/config`}
              passHref
            >
              <button className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                <img
                  src="/icons/config.svg"
                  alt="Configurações"
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </button>
            </Link>
          ) : (
            loggedInUser &&
            user.userId &&
            loggedInUser.userId !== user.userId && (
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                className={`
                  px-4 py-2 rounded-full text-sm font-semibold
                  ${
                    isFollowing
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }
                  transition-colors duration-200
                `}
              >
                {isFollowing ? "Deixar de Seguir" : "Seguir"}
              </button>
            )
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900">
              {user.name}
            </h1>
            <p className="text-md text-gray-500">@{user.username}</p>
          </div>
          <div
            className="
            mt-4 md:mt-0 
            flex 
            justify-around 
            md:justify-end 
            md:gap-8 
            w-full 
            md:w-auto
          "
          >
            <Link
              href={`/user/${user.userType.toLowerCase()}/${user.id}/followers`}
              passHref
            >
              <div className="text-center cursor-pointer hover:underline">
                <p className="text-lg md:text-xl font-bold text-gray-900">
                  {followersCount}
                </p>
                <p className="text-sm text-gray-500">Seguidores</p>
              </div>
            </Link>
            <Link
              href={`/user/${user.userType.toLowerCase()}/${user.id}/following`}
              passHref
            >
              <div className="text-center cursor-pointer hover:underline">
                <p className="text-lg md:text-xl font-bold text-gray-900">
                  {followingCount}
                </p>
                <p className="text-sm text-gray-500">Seguindo</p>
              </div>
            </Link>
            {(isPlayer || isOrganization) && (
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold text-gray-900">
                  {user.subscribedGames ? user.subscribedGames.length : 0}
                </p>
                <p className="text-sm text-gray-500">Jogos</p>
              </div>
            )}
            {isPlayer && user.pastOrganization && (
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold text-gray-900">
                  {user.pastOrganization}
                </p>
                <p className="text-sm text-gray-500">Organização Anterior</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-700">{user.bio}</p>
        </div>
      </div>
    </div>
  );
}
