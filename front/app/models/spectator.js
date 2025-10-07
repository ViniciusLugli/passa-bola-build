import User from "./user.js";

export default class Spectator extends User {
  constructor(
    id,
    userId,
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
    subscribedGames,
    birthDate,
    favoriteTeamId
  ) {
    super(
      id,
      userId,
      "spectator",
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
    );
    this.birthDate = birthDate;
    this.favoriteTeamId = favoriteTeamId;
  }
}
