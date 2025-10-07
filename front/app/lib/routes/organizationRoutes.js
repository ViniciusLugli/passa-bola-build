const createOrganizationRoutes = (fetchApi, fetchApiFormData) => ({
  getAll: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/organizations?page=${page}&size=${size}`),
  getById: (id) => fetchApi(`/organizations/${id}`),
  search: (name, { page = 0, size = 10 } = {}) =>
    fetchApi(`/organizations/search?name=${name}&page=${page}&size=${size}`),
  update: (id, data) =>
    fetchApi(`/organizations/${id}`, { method: "PUT", body: data }),
  uploadProfilePhoto: (id, formData) =>
    fetchApiFormData(`/organizations/${id}/profile-photo`, formData),
  uploadBanner: (id, formData) =>
    fetchApiFormData(`/organizations/${id}/banner`, formData),
  delete: (id) => fetchApi(`/organizations/${id}`, { method: "DELETE" }),
});

export default createOrganizationRoutes;
