// app/lib/routes/spectatorRoutes.js
const createSpectatorRoutes = (fetchApi) => ({
  getAll: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/spectators?page=${page}&size=${size}`),
  getById: (id) => fetchApi(`/spectators/${id}`),
  getByUsername: (username) => fetchApi(`/spectators/username/${username}`), // Adicionado
  search: (
    name,
    { page = 0, size = 20 } = {} // Adicionado, size=20 conforme doc
  ) => fetchApi(`/spectators/search?name=${name}&page=${page}&size=${size}`),
  getByFavoriteTeam: (teamId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/spectators/favorite-team/${teamId}?page=${page}&size=${size}`),
  update: (id, data) =>
    fetchApi(`/spectators/${id}`, { method: "PUT", body: data }),
  delete: (id) => fetchApi(`/spectators/${id}`, { method: "DELETE" }),
});

export default createSpectatorRoutes;
