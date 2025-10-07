const createGameParticipantsRoutes = (fetchApi) => ({
  join: (data) =>
    fetchApi("/game-participants/join", { method: "POST", body: data }),
  leave: (gameId) =>
    fetchApi(`/game-participants/leave/${gameId}`, { method: "DELETE" }),
  getByGame: (gameId) => fetchApi(`/game-participants/game/${gameId}`),
  getMyParticipations: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/game-participants/my-participations?page=${page}&size=${size}`),
  getByPlayer: (playerId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/game-participants/player/${playerId}?page=${page}&size=${size}`),
  getByTeam: (teamId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/game-participants/team/${teamId}?page=${page}&size=${size}`),
});

export default createGameParticipantsRoutes;
