const createTeamRoutes = (fetchApi) => ({
  create: (data) => fetchApi("/teams", { body: data }),
  getAll: ({
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  } = {}) =>
    fetchApi(
      `/teams?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    ),
  getById: (id) => fetchApi(`/teams/${id}`),
  search: (name, { page = 0, size = 10 } = {}) =>
    fetchApi(`/teams/search?name=${name}&page=${page}&size=${size}`),
  sendInvite: (teamId, invitedPlayerId) =>
    fetchApi(`/teams/${teamId}/invites`, {
      method: "POST",
      body: { invitedPlayerId },
    }),
  getTeamInvites: (teamId) => fetchApi(`/teams/${teamId}/invites`),
  getMyPendingInvites: () => fetchApi(`/teams/my-invites`),
  acceptInvite: (inviteId) =>
    fetchApi(`/teams/invites/${inviteId}/accept`, { method: "POST" }),
  rejectInvite: (inviteId) =>
    fetchApi(`/teams/invites/${inviteId}/reject`, { method: "POST" }),
  cancelInvite: (inviteId) =>
    fetchApi(`/teams/invites/${inviteId}`, { method: "DELETE" }),
  leaveTeam: (teamId) => fetchApi(`/teams/${teamId}/leave`, { method: "POST" }),
  removePlayer: (teamId, playerId) =>
    fetchApi(`/teams/${teamId}/players/${playerId}`, { method: "DELETE" }),
});

export default createTeamRoutes;
