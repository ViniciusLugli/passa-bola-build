"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileTabs from "@/app/components/ProfileTabs";
import RankingTabContent from "@/app/components/profile/tabs/RankingTabContent";
import PostsTabContent from "@/app/components/profile/tabs/PostsTabContent";
import TeamsTabContent from "@/app/components/profile/tabs/TeamsTabContent";
import GamesTabContent from "@/app/components/profile/tabs/GamesTabContent";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useProfileTabsData } from "@/app/hooks/useProfileTabsData";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";
import ErrorState from "@/app/components/ui/ErrorState";
import { User } from "lucide-react";

export default function ProfilePage() {
  const {
    user: loggedInUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();

  const { userType, id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ranking");

  // Use custom hook for tabs data
  const {
    posts,
    teams,
    games,
    tabLoading,
    tabCounts,
    fetchAllTabsData,
    refetchGames,
  } = useProfileTabsData(id, userType);

  // Extrair valores estáveis do loggedInUser para evitar re-renders
  const loggedInUserId = loggedInUser?.userId;
  const loggedInUserType = loggedInUser?.userType;

  const fetchProfileData = useCallback(async () => {
    if (!id || !userType) {
      setLoading(false);
      setError("ID ou tipo de usuário não fornecido.");
      return;
    }

    setLoading(true);
    setError(null);

    let fetchedUser = null;
    const lowerCaseUserType = userType.toLowerCase();

    try {
      switch (lowerCaseUserType) {
        case "player":
          fetchedUser = await api.players.getById(id);
          try {
            const ranking = await api.rankings.getPlayerRanking(id);
            setPlayerStats(ranking);
          } catch (rankingError) {
            setPlayerStats(null);
          }
          break;
        case "organization":
          fetchedUser = await api.organizations.getById(id);
          break;
        case "spectator":
          fetchedUser = await api.spectators.getById(id);
          break;
        default:
          throw new Error("Tipo de usuário inválido.");
      }

      if (!fetchedUser) {
        throw new Error("Usuário não encontrado.");
      }

      const isOwnProfile =
        loggedInUserId &&
        loggedInUserId === fetchedUser.userId &&
        loggedInUserType?.toLowerCase() === lowerCaseUserType;

      let updatedProfileUser;
      if (isOwnProfile && loggedInUser) {
        // For own profile, use updated data from AuthContext
        console.log(
          "[ProfilePage] Using loggedInUser data for own profile:",
          loggedInUser
        );
        updatedProfileUser = {
          ...loggedInUser,
          userType: lowerCaseUserType.toUpperCase(),
        };
      } else {
        // For other profiles, use fetched data
        updatedProfileUser = {
          ...fetchedUser,
          userType: lowerCaseUserType.toUpperCase(),
        };
      }

      // Buscar listas de seguidores e seguindo com tratamento de erro
      let followersListResponse = { content: [], totalElements: 0 };
      let followingListResponse = { content: [], totalElements: 0 };

      try {
        if (isOwnProfile) {
          // Para o próprio perfil, usar endpoints privados
          followersListResponse = await api.follow.getMyFollowers();
          followingListResponse = await api.follow.getMyFollowing();
        } else {
          // Para outros perfis, usar endpoints públicos com userId
          if (fetchedUser.userId) {
            // Tenta buscar seguidores (endpoint público usa userId)
            try {
              followersListResponse = await api.follow.getFollowers(
                fetchedUser.userId,
                userType.toUpperCase()
              );
            } catch (followersError) {
              console.error("Erro ao buscar seguidores:", followersError);
              // Mantém valores padrão
            }

            // Tenta buscar seguindo (endpoint público usa userId)
            try {
              followingListResponse = await api.follow.getFollowing(
                fetchedUser.userId,
                userType.toUpperCase()
              );
            } catch (followingError) {
              console.error("Erro ao buscar seguindo:", followingError);
              // Mantém valores padrão
            }
          }
        }
      } catch (followError) {
        console.error("Erro ao buscar dados de follow:", followError);
        // Continua com valores padrão
      }

      // Sempre usar as contagens das listas retornadas
      updatedProfileUser.followersList = followersListResponse.content || [];
      updatedProfileUser.followingList = followingListResponse.content || [];
      updatedProfileUser.followers =
        followersListResponse.totalElements ||
        updatedProfileUser.followersList.length;
      updatedProfileUser.following =
        followingListResponse.totalElements ||
        updatedProfileUser.followingList.length;

      setProfileUser(updatedProfileUser);

      // Fetch ALL tab data upfront (posts, teams, games) for tab counts
      await fetchAllTabsData(id, lowerCaseUserType);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError(err.message || "Falha ao carregar o perfil. Tente novamente.");
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }, [
    id,
    userType,
    loggedInUserId,
    loggedInUserType,
    loggedInUser,
    fetchAllTabsData,
  ]);

  // Effect to update profile when logged user data changes (e.g., after avatar upload)
  useEffect(() => {
    if (
      profileUser &&
      loggedInUser &&
      loggedInUser.userId === profileUser.userId &&
      loggedInUser.userType?.toLowerCase() === userType?.toLowerCase()
    ) {
      console.log(
        "[ProfilePage] Syncing profileUser with updated loggedInUser data"
      );
      setProfileUser((prev) => ({
        ...prev,
        ...loggedInUser,
        userType: userType.toUpperCase(),
      }));
    }
  }, [
    loggedInUser?.profilePhotoUrl,
    loggedInUser?.bannerUrl,
    profileUser?.userId,
    userType,
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && id && userType) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userType, isAuthenticated, authLoading]);

  // Define callbacks BEFORE early returns (Rules of Hooks)
  const handleFollowChange = useCallback(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleGameUpdate = useCallback(() => {
    // Refetch games when a game is updated
    refetchGames();
  }, [refetchGames]);

  // Determine if ranking tab should be shown (only for PLAYER)
  const showRankingTab = profileUser?.userType === "PLAYER";

  const renderTabContent = () => {
    switch (activeTab) {
      case "ranking":
        return (
          <RankingTabContent
            profileUser={profileUser}
            playerStats={playerStats}
          />
        );

      case "posts":
        return (
          <PostsTabContent
            posts={posts}
            profileUser={profileUser}
            isLoading={tabLoading.posts}
          />
        );

      case "teams":
        return <TeamsTabContent teams={teams} isLoading={tabLoading.teams} />;

      case "games":
        return (
          <GamesTabContent
            games={games}
            isLoading={tabLoading.games}
            onGameUpdate={handleGameUpdate}
          />
        );

      default:
        return null;
    }
  };

  // Early returns AFTER all hooks
  if (authLoading || loading) {
    return (
      <div>
        <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
          <LoadingSkeleton count={1} variant="card" className="h-48 mb-8" />
          <LoadingSkeleton count={3} variant="post" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
          <ErrorState
            title="Erro ao carregar perfil"
            message={error}
            onRetry={() => window.location.reload()}
            variant="error"
          />
        </main>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div>
        <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
          <ErrorState
            icon={<User />}
            title="Perfil não encontrado"
            message="O perfil que você está procurando não existe ou foi removido."
            variant="warning"
          />
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
        <ProfileHeader
          user={profileUser}
          loggedInUser={loggedInUser}
          onFollowChange={handleFollowChange}
        />

        {/* Profile Tabs */}
        <section className="mt-8">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={tabCounts}
            showRankingTab={showRankingTab}
          />
        </section>

        {/* Tab Content */}
        <section className="mt-6">{renderTabContent()}</section>
      </main>
    </div>
  );
}
