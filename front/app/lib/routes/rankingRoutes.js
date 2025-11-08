const createRankingRoutes = (fetchApi) => ({
  // ========== RANKINGS DE JOGADORAS ==========

  // Ver ranking de uma jogadora específica
  getPlayerRanking: (playerId) => fetchApi(`/rankings/players/${playerId}`),

  // Ranking global de jogadoras (paginado)
  getPlayersRanking: ({ page = 0, size = 50 } = {}) =>
    fetchApi(`/rankings/players?page=${page}&size=${size}`),

  // Ranking por divisão
  getPlayersByDivision: (division, { page = 0, size = 50 } = {}) =>
    fetchApi(
      `/rankings/players/division/${division}?page=${page}&size=${size}`
    ),

  // Top jogadoras
  getTopPlayers: ({ size = 10 } = {}) =>
    fetchApi(`/rankings/players/top?size=${size}`),

  // Melhores sequências de vitórias
  getPlayersByWinStreak: ({ size = 10 } = {}) =>
    fetchApi(`/rankings/players/win-streak?size=${size}`),

  // Maior taxa de vitória
  getPlayersByWinRate: ({ minGames = 10, size = 10 } = {}) =>
    fetchApi(`/rankings/players/win-rate?minGames=${minGames}&size=${size}`),

  // ========== RANKINGS DE TIMES ==========

  // Ver ranking de um time específico
  getTeamRanking: (teamId) => fetchApi(`/rankings/teams/${teamId}`),

  // Ranking global de times (paginado)
  getTeamsRanking: ({ page = 0, size = 50 } = {}) =>
    fetchApi(`/rankings/teams?page=${page}&size=${size}`),

  // Ranking por divisão
  getTeamsByDivision: (division, { page = 0, size = 50 } = {}) =>
    fetchApi(`/rankings/teams/division/${division}?page=${page}&size=${size}`),

  // Top times
  getTopTeams: ({ size = 10 } = {}) =>
    fetchApi(`/rankings/teams/top?size=${size}`),

  // Melhores sequências de vitórias
  getTeamsByWinStreak: ({ size = 10 } = {}) =>
    fetchApi(`/rankings/teams/win-streak?size=${size}`),

  // Maior taxa de vitória
  getTeamsByWinRate: ({ minGames = 20, size = 10 } = {}) =>
    fetchApi(`/rankings/teams/win-rate?minGames=${minGames}&size=${size}`),
});

export default createRankingRoutes;
