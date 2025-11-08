const createPostCommentsRoutes = (fetchApi) => ({
  create: (postId, data) =>
    fetchApi(`/post-comments/post/${postId}`, { body: data }),
  update: (commentId, data) =>
    fetchApi(`/post-comments/${commentId}`, { method: "PUT", body: data }),
  delete: (commentId) => fetchApi(`/post-comments/${commentId}`, { method: "DELETE" }),
  list: (postId, { page = 0, size = 20 } = {}) =>
    fetchApi(`/post-comments/post/${postId}?page=${page}&size=${size}`),
  recent: (postId, { limit = 5 } = {}) =>
    fetchApi(`/post-comments/post/${postId}/recent?limit=${limit}`),
  count: (postId) => fetchApi(`/post-comments/post/${postId}/count`),
  hasCommented: (postId) =>
    fetchApi(`/post-comments/post/${postId}/has-commented`),
  myComments: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/post-comments/my-comments?page=${page}&size=${size}`),
});

export default createPostCommentsRoutes;
