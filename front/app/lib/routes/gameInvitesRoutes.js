// app/lib/routes/gameInvitesRoutes.js
const createGameInvitesRoutes = (fetchApi) => ({
  send: (data) =>
    fetchApi("/game-invites/send", { method: "POST", body: data }),
  accept: (inviteId) =>
    fetchApi(`/game-invites/accept/${inviteId}`, { method: "POST" }),
  reject: (inviteId) =>
    fetchApi(`/game-invites/reject/${inviteId}`, { method: "POST" }),
  cancel: (inviteId) =>
    fetchApi(`/game-invites/cancel/${inviteId}`, { method: "DELETE" }),
  getByGame: (gameId) => fetchApi(`/game-invites/game/${gameId}`),
  getByOrganization: (orgId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/game-invites/organization/${orgId}?page=${page}&size=${size}`),
  getByTeam: (teamId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/game-invites/team/${teamId}?page=${page}&size=${size}`),
  getPending: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/game-invites/pending?page=${page}&size=${size}`),
  getSent: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/game-invites/sent?page=${page}&size=${size}`),
});

export default createGameInvitesRoutes;
