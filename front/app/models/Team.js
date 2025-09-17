export default class Team {
  constructor(id, nameTeam, leaderId, players = [], invites = []) {
    this.id = id;
    this.nameTeam = nameTeam;
    this.leaderId = leaderId;
    this.players = players; // Array de IDs de jogadores
    this.invites = invites; // Array de objetos de convite (TeamInvite)
  }
}
