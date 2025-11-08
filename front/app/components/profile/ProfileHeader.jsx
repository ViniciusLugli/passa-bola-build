import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Settings, MessageCircle } from "lucide-react";
import Player from "@/app/models/player";
import Organization from "@/app/models/organization";
import { api } from "@/app/lib/api";
import Button from "@/app/components/ui/Button";
import { useChat } from "@/app/context/ChatContext";

export default function ProfileHeader({ user, loggedInUser, onFollowChange }) {
  const router = useRouter();
  const { setActiveConversation, conversations, setConversations } = useChat();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers || 0);
  const [followingCount, setFollowingCount] = useState(user.following || 0);

  // Debug: Log user data
  useEffect(() => {
    console.log("[ProfileHeader] User data received:", user);
    console.log("[ProfileHeader] User profilePhotoUrl:", user?.profilePhotoUrl);
  }, [user?.profilePhotoUrl]);

  const isPlayer = user instanceof Player;
  const isOrganization = user instanceof Organization;

  // Extrair valores primitivos para dependências estáveis
  const userId = user?.userId;
  const userType = user?.userType;
  const userFollowers = user?.followers;
  const userFollowing = user?.following;
  const loggedInUserId = loggedInUser?.userId;

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (loggedInUserId && userId && loggedInUserId !== userId) {
        try {
          const response = await api.follow.checkFollowing(
            userId,
            userType.toUpperCase()
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
    setFollowersCount(userFollowers || 0);
    setFollowingCount(userFollowing || 0);
  }, [userId, userType, userFollowers, userFollowing, loggedInUserId]);

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

  const handleStartConversation = () => {
    // Create or find existing conversation
    const existingConversation = conversations.find(
      (c) => c.otherUserId === user.userId
    );

    if (existingConversation) {
      // Set as active conversation
      setActiveConversation(existingConversation);
    } else {
      // Create new conversation object
      const newConversation = {
        otherUserId: user.userId,
        otherUsername: user.username,
        otherName: user.name,
        otherProfilePhotoUrl: user.profilePhotoUrl,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0,
      };

      // Add to conversations list
      setConversations([newConversation, ...conversations]);
      setActiveConversation(newConversation);
    }

    // Navigate to chat page
    router.push("/chat");
  };

  return (
    <div className="w-full bg-surface rounded-2xl border border-default shadow-elevated overflow-hidden relative">
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
        <div className="flex justify-between items-start gap-4">
          <div
            className="
            relative 
            -mt-12 md:-mt-24 
            w-24 h-24 md:w-36 md:h-36
            min-w-[96px] md:min-w-[144px]
            rounded-full 
            border-4 
            border-default 
            bg-surface
            overflow-hidden
            flex-shrink-0
          "
          >
            <Image
              src={user.profilePhotoUrl || "/icons/user-default.png"}
              alt="Avatar do perfil"
              width={144}
              height={144}
              className="w-full h-full object-cover"
              style={{ objectFit: "cover" }}
              onLoad={() =>
                console.log(
                  "[ProfileHeader] Avatar loaded:",
                  user.profilePhotoUrl
                )
              }
              onError={(e) =>
                console.error(
                  "[ProfileHeader] Avatar failed to load:",
                  e,
                  "URL:",
                  user.profilePhotoUrl
                )
              }
            />
          </div>
          {loggedInUser &&
          loggedInUser.userId === user.userId &&
          loggedInUser.userType === user.userType ? (
            <Link
              href={`/user/${user.userType.toLowerCase()}/${user.id}/config`}
              passHref
            >
              <button className="text-zinc-500 dark:text-gray-300 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer flex-shrink-0">
                <Settings
                  className="w-6 h-6 md:w-8 md:h-8"
                  strokeWidth={2}
                  aria-label="Configurações"
                />
              </button>
            </Link>
          ) : (
            loggedInUser &&
            user.userId &&
            loggedInUser.userId !== user.userId && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Message Button */}
                <button
                  onClick={handleStartConversation}
                  className="
                    p-2
                    rounded-full
                    bg-surface-muted
                    hover:bg-accent/20
                    text-secondary
                    hover:text-accent
                    transition-all
                    duration-200
                    min-w-[44px]
                    min-h-[44px]
                    flex
                    items-center
                    justify-center
                    border
                    border-default
                    hover:border-accent
                    group
                  "
                  aria-label="Enviar mensagem"
                  title="Enviar mensagem"
                >
                  <MessageCircle
                    className="w-5 h-5 transition-transform group-hover:scale-110"
                    strokeWidth={2}
                  />
                </button>

                {/* Follow/Unfollow Button */}
                <button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  className={`
                    px-4 py-1.5 
                    rounded-full 
                    text-sm 
                    font-medium 
                    whitespace-nowrap 
                    transition-colors
                    min-h-[44px]
                    ${
                      isFollowing
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }
                  `}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </button>
              </div>
            )
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight text-primary">
              {user.name}
            </h1>
            <p className="text-md text-secondary">@{user.username}</p>
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
                <p className="text-lg md:text-xl font-bold text-primary">
                  {followersCount}
                </p>
                <p className="text-sm text-secondary">Seguidores</p>
              </div>
            </Link>
            <Link
              href={`/user/${user.userType.toLowerCase()}/${user.id}/following`}
              passHref
            >
              <div className="text-center cursor-pointer hover:underline">
                <p className="text-lg md:text-xl font-bold text-primary">
                  {followingCount}
                </p>
                <p className="text-sm text-secondary">Seguindo</p>
              </div>
            </Link>
            {(isPlayer || isOrganization) && (
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold text-primary">
                  {user.subscribedGames ? user.subscribedGames.length : 0}
                </p>
                <p className="text-sm text-secondary">Jogos</p>
              </div>
            )}
            {isPlayer && user.pastOrganization && (
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold text-primary">
                  {user.pastOrganization}
                </p>
                <p className="text-sm text-secondary">Organização Anterior</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-secondary">{user.bio}</p>
        </div>
      </div>
    </div>
  );
}
