import User from "./user.js";

export default class Spectator extends User {
  constructor(
    id,
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
      "spectator", // Define o userType como 'spectator'
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
