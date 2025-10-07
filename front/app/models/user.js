export default class User {
  constructor(
    id,
    userId,
    userType,
    username,
    name,
    email,
    password,
    bio,
    followers,
    following,
    profilePhotoUrl,
    bannerUrl,
    phone,
    posts,
    subscribedGames
  ) {
    this.id = id;
    this.userId = userId;
    this.userType = userType;
    this.username = username;
    this.name = name;
    this.email = email;
    this.password = password;
    this.bio = bio;
    this.followers = followers;
    this.following = following;
    this.profilePhotoUrl = profilePhotoUrl;
    this.bannerUrl = bannerUrl;
    this.phone = phone;
    this.posts = posts;
    this.subscribedGames = subscribedGames;
  }
}
