const createAuthRoutes = (fetchApi) => ({
  registerPlayer: (data) => fetchApi("/auth/register/player", { body: data }),
  registerOrganization: (data) =>
    fetchApi("/auth/register/organization", { body: data }),
  registerSpectator: (data) =>
    fetchApi("/auth/register/spectator", { body: data }),
  login: (credentials) => fetchApi("/auth/login", { body: credentials }),
});

export default createAuthRoutes;
