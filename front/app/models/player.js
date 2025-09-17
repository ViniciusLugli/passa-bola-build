import User from "./user.js";

export default class Player extends User {
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
    gamesPlayed,
    birthDate,
    organizationId,
    pastOrganization,
    teams,
    createdGames
  ) {
    super(
      id,
      "player", // Define o userType como 'player'
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
    this.gamesPlayed = gamesPlayed;
    this.birthDate = birthDate;
    this.organizationId = organizationId;
    this.pastOrganization = pastOrganization;
    this.teams = teams;
    this.createdGames = createdGames;
  }
}
