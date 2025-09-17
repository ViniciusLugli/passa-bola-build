export default class TeamInvite {
  constructor(id, teamId, invitedPlayerId, status, senderId, createdAt) {
    this.id = id;
    this.teamId = teamId;
    this.invitedPlayerId = invitedPlayerId;
    this.status = status; // PENDING, ACCEPTED, REJECTED, CANCELLED
    this.senderId = senderId;
    this.createdAt = createdAt;
  }
}
