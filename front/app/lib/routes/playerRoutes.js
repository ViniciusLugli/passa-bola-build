const createPlayerRoutes = (fetchApi, fetchApiFormData) => ({
  getAll: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/players?page=${page}&size=${size}`),
  getById: (id) => fetchApi(`/players/${id}`),
  getByUsername: (username) => fetchApi(`/players/username/${username}`),
  getStats: (id) => fetchApi(`/players/${id}/stats`),
  search: (name, { page = 0, size = 10 } = {}) =>
    fetchApi(`/players/search?name=${name}&page=${page}&size=${size}`),
  getByOrganization: (orgId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/players/organization/${orgId}?page=${page}&size=${size}`),
  update: (id, data) =>
    fetchApi(`/players/${id}`, { method: "PUT", body: data }),
  uploadProfilePhoto: (id, formData) =>
    fetchApiFormData(`/players/${id}/profile-photo`, formData),
  uploadBanner: (id, formData) =>
    fetchApiFormData(`/players/${id}/banner`, formData),
  delete: (id) => fetchApi(`/players/${id}`, { method: "DELETE" }),
  addGoal: (playerId, gameId) =>
    fetchApi(`/players/${playerId}/goals?gameId=${gameId}`, {
      method: "POST",
    }),
  removeGoal: (playerId, gameId) =>
    fetchApi(`/players/${playerId}/goals?gameId=${gameId}`, {
      method: "DELETE",
    }),
  getGoalsByGame: (playerId, gameId) =>
    fetchApi(`/players/${playerId}/goals?gameId=${gameId}`),
  getTotalGoals: (playerId) => fetchApi(`/players/${playerId}/goals/total`),
});

export default createPlayerRoutes;
