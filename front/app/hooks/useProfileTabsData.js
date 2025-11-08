import { useState, useCallback } from "react";
import { api } from "@/app/lib/api";

/**
 * Hook para gerenciar dados das tabs do perfil (posts, teams, games)
 *
 * @param {string} userId - ID do usuário
 * @param {string} userType - Tipo do usuário (lowercase)
 * @returns {Object} Estado e métodos para gerenciar dados das tabs
 */
export function useProfileTabsData(userId, userType) {
  const [posts, setPosts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [tabLoading, setTabLoading] = useState({
    posts: false,
    teams: false,
    games: false,
  });
  const [loadedTabs, setLoadedTabs] = useState({
    posts: false,
    teams: false,
    games: false,
  });

  // Fetch posts
  const fetchPosts = useCallback(async (id, lowerCaseUserType) => {
    try {
      const postsResponse = await api.posts.getByAuthor(id);
      const filteredPosts = (postsResponse.content || []).filter(
        (post) => post.authorType.toLowerCase() === lowerCaseUserType
      );
      setPosts(filteredPosts);
      setLoadedTabs((prev) => ({ ...prev, posts: true }));
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }, []);

  // Fetch teams
  const fetchTeams = useCallback(async (id, lowerCaseUserType) => {
    if (lowerCaseUserType !== "player") return;

    try {
      const allTeamsResponse = await api.teams.getAll({ size: 100 });
      setTeams(allTeamsResponse.content || []);
      setLoadedTabs((prev) => ({ ...prev, teams: true }));
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  }, []);

  // Fetch games
  const fetchGames = useCallback(async (id, lowerCaseUserType) => {
    try {
      let gamesData = [];

      if (lowerCaseUserType === "player") {
        // Get player participations
        const participationsResponse = await api.gameParticipants.getByPlayer(
          id,
          { size: 100 }
        );
        const participations = participationsResponse.content || [];

        // Extract game IDs from participations
        const gameIds = participations
          .map((p) => p.gameId || p.game?.id)
          .filter(Boolean);

        if (gameIds.length > 0) {
          // Fetch all games and filter by participation
          const allGamesResponse = await api.games.getAll({
            page: 0,
            size: 1000,
          });
          const allGames = allGamesResponse.content || [];

          gamesData = allGames
            .filter((game) => gameIds.includes(game.id))
            .map((game) => ({ ...game, isJoined: true }));
        }
      } else if (lowerCaseUserType === "organization") {
        // Get games hosted by organization
        const gamesResponse = await api.games.getByOrganization(id, {
          size: 100,
        });
        gamesData = gamesResponse.content || [];
      } else if (lowerCaseUserType === "spectator") {
        // Get games spectated
        const gamesResponse = await api.games.mySpectatorSubscriptions({
          size: 100,
        });
        gamesData = gamesResponse.content || [];
      }

      // Sort by date
      gamesData.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

      setGames(gamesData);
      setLoadedTabs((prev) => ({ ...prev, games: true }));
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  }, []);

  // Fetch all tabs data
  const fetchAllTabsData = useCallback(
    async (id, lowerCaseUserType) => {
      await Promise.allSettled([
        fetchPosts(id, lowerCaseUserType),
        fetchTeams(id, lowerCaseUserType),
        fetchGames(id, lowerCaseUserType),
      ]);
    },
    [fetchPosts, fetchTeams, fetchGames]
  );

  // Refetch games (for updates)
  const refetchGames = useCallback(() => {
    if (userId && userType) {
      fetchGames(userId, userType.toLowerCase());
    }
  }, [userId, userType, fetchGames]);

  // Calculate tab counts
  const tabCounts = {
    posts: posts.length,
    teams: teams.length,
    games: games.length,
  };

  return {
    posts,
    teams,
    games,
    tabLoading,
    loadedTabs,
    tabCounts,
    fetchPosts,
    fetchTeams,
    fetchGames,
    fetchAllTabsData,
    refetchGames,
  };
}
