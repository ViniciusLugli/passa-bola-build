const createFollowRoutes = (fetchApi) => ({
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
  getFollowers: (id, userType, { page = 0, size = 10 } = {}) =>
    fetchApi(`/follow/followers/${id}/${userType}?page=${page}&size=${size}`),
  getFollowing: (id, userType, { page = 0, size = 10 } = {}) =>
    fetchApi(`/follow/following/${id}/${userType}?page=${page}&size=${size}`),
  getMyFollowers: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/follow/my-followers?page=${page}&size=${size}`),
  getMyFollowing: ({ page = 0, size = 10 } = {}) =>
    fetchApi(`/follow/my-following?page=${page}&size=${size}`),
});

export default createFollowRoutes;
