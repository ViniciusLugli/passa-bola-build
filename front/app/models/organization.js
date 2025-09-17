import User from "./user.js";

export default class Organization extends User {
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
    cnpj,
    gamesPlayed,
    teams,
    createdGames
  ) {
    super(
      id,
      "organization", // Define o userType como 'organization'
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
    this.cnpj = cnpj;
    this.gamesPlayed = gamesPlayed;
    this.teams = teams;
    this.createdGames = createdGames;
  }
}
