// app/lib/routes/postRoutes.js
const createPostRoutes = (fetchApi) => ({
  getAll: ({ page = 0, size = 20 } = {}) =>
    fetchApi(`/posts?page=${page}&size=${size}`),
  getById: (id) => fetchApi(`/posts/${id}`),
  getByAuthor: (authorId, { page = 0, size = 10 } = {}) =>
    fetchApi(`/posts/author/${authorId}?page=${page}&size=${size}`),
  getMyPosts: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/posts/my-posts?page=${page}&size=${size}`),
  getByRole: (role, { page = 0, size = 10 } = {}) =>
    fetchApi(`/posts/role/${role}?page=${page}&size=${size}`),
  getByType: (type, { page = 0, size = 10 } = {}) =>
    fetchApi(`/posts/type/${type}?page=${page}&size=${size}`),
  getMostLiked: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/posts/most-liked?page=${page}&size=${size}`),
  getWithImages: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/posts/with-images?page=${page}&size=${size}`),
  search: (content, { page = 0, size = 10 } = {}) =>
    fetchApi(`/posts/search?content=${content}&page=${page}&size=${size}`),
  create: (data) => fetchApi("/posts", { body: data }),
  update: (id, data) => fetchApi(`/posts/${id}`, { method: "PUT", body: data }),
  delete: (id) => fetchApi(`/posts/${id}`, { method: "DELETE" }),
  like: (id) => fetchApi(`/posts/${id}/like`, { method: "POST" }),
  unlike: (id) => fetchApi(`/posts/${id}/like`, { method: "DELETE" }),
  comment: (id, comment) =>
    fetchApi(`/posts/${id}/comment`, { body: { comment } }),
  share: (id) => fetchApi(`/posts/${id}/share`, { method: "POST" }),

  // Sistema de Likes
  getLikedStatus: (id) => fetchApi(`/posts/${id}/liked`),
  getLikes: (id) => fetchApi(`/posts/${id}/likes`),
  getLikesCount: (id) => fetchApi(`/posts/${id}/likes/count`),
  getMyLikedPosts: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/post-likes/my-likes?page=${page}&size=${size}`),
  checkLikedPosts: (postIds) =>
    fetchApi("/post-likes/check-liked", { method: "POST", body: postIds }),
});

export default createPostRoutes;
