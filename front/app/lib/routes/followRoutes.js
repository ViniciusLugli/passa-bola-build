const createFollowRoutes = (fetchApi) => ({
  // Endpoints privados - requerem autenticação
  follow: (targetUserId, targetUserType) =>
    fetchApi("/follow", {
      method: "POST",
      body: { targetUserId, targetUserType },
    }),
  unfollow: (targetUserId, targetUserType) =>
    fetchApi("/follow", {
      method: "DELETE",
      body: { targetUserId, targetUserType },
    }),
  checkFollowing: (targetUserId, targetUserType) =>
    fetchApi("/follow/check", {
      method: "POST",
      body: { targetUserId, targetUserType },
    }),
  getMyFollowers: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/follow/my-followers?page=${page}&size=${size}`),
  getMyFollowing: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/follow/my-following?page=${page}&size=${size}`),

  getFollowers: (userId, userType, { page = 0, size = 10 } = {}) =>
    fetchApi(
      `/follow/followers/${userId}/${userType}?page=${page}&size=${size}`
    ),
  getFollowing: (userId, userType, { page = 0, size = 10 } = {}) =>
    fetchApi(
      `/follow/following/${userId}/${userType}?page=${page}&size=${size}`
    ),
});

export default createFollowRoutes;
