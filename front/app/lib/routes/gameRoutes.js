const createGameRoutes = (fetchApi) => ({
  getAll: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/games?page=${page}&size=${size}`),
  getById: (id) => fetchApi(`/games/${id}`),
  getByOrganization: (orgId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/games/organization/${orgId}?page=${page}&size=${size}`),
  getByStatus: (status, { page = 0, size = 10 } = {}) =>
    fetchApi(`/games/status/${status}?page=${page}&size=${size}`),
  getByChampionship: (championship, { page = 0, size = 10 } = {}) =>
    fetchApi(
      `/games/championship?championship=${championship}&page=${page}&size=${size}`
    ),
  getByType: (type, { page = 0, size = 10 } = {}) =>
    fetchApi(`/games/type/${type}?page=${page}&size=${size}`),
  getByHost: (hostId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/games/host/${hostId}?page=${page}&size=${size}`),
  getByDateRange: (startDate, endDate, { page = 0, size = 10 } = {}) =>
    fetchApi(
      `/games/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    ),
  createFriendly: (data) => fetchApi("/games/friendly", { body: data }),
  createChampionship: (data) => fetchApi("/games/championship", { body: data }),
  createCup: (data) => fetchApi("/games/cup", { body: data }),
  update: (id, data) => fetchApi(`/games/${id}`, { method: "PUT", body: data }),
  updateFriendly: (id, data) =>
    fetchApi(`/games/friendly/${id}`, { method: "PUT", body: data }),
  updateChampionship: (id, data) =>
    fetchApi(`/games/championship/${id}`, { method: "PUT", body: data }),
  updateCup: (id, data) =>
    fetchApi(`/games/cup/${id}`, { method: "PUT", body: data }),
  delete: (id) => fetchApi(`/games/${id}`, { method: "DELETE" }),
  updateScore: (id, { homeGoals, awayGoals }) =>
    fetchApi(
      `/games/${id}/score?homeGoals=${homeGoals}&awayGoals=${awayGoals}`,
      { method: "PATCH" }
    ),
  // Spectator endpoints
  spectate: (gameId) =>
    fetchApi(`/games/${gameId}/spectate`, { method: "POST" }),
  unspectate: (gameId) =>
    fetchApi(`/games/${gameId}/spectate`, { method: "DELETE" }),
  getSpectators: (gameId, { page = 0, size = 50 } = {}) =>
    fetchApi(`/games/${gameId}/spectators?page=${page}&size=${size}`),
  getSpectatorsCount: (gameId) => fetchApi(`/games/${gameId}/spectators/count`),
  isSpectatorSubscribed: (gameId) =>
    fetchApi(`/games/${gameId}/spectators/is-subscribed`),
  mySpectatorSubscriptions: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/games/spectators/my-subscriptions?page=${page}&size=${size}`),
});

export default createGameRoutes;
