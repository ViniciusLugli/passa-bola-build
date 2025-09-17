// app/lib/routes/playerRoutes.js
const createPlayerRoutes = (fetchApi, fetchApiFormData) => ({
  getAll: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/players?page=${page}&size=${size}`),
  getById: (id) => fetchApi(`/players/${id}`),
  getByUsername: (username) => fetchApi(`/players/username/${username}`),
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
});

export default createPlayerRoutes;
