export default class Team {
  constructor(id, nameTeam, leaderId, players = [], invites = []) {
    this.id = id;
    this.nameTeam = nameTeam;
    this.leaderId = leaderId;
    this.players = players;
    this.invites = invites;
  }
}
