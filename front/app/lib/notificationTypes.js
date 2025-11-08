/**
 * Constantes para tipos de notificação
 * Baseado na documentação do sistema de notificações
 */

export const NOTIFICATION_TYPES = {
  TEAM_INVITE_RECEIVED: "TEAM_INVITE_RECEIVED",
  TEAM_INVITE_ACCEPTED: "TEAM_INVITE_ACCEPTED",
  NEW_FOLLOWER: "NEW_FOLLOWER",
  POST_LIKED: "POST_LIKED",
  GAME_INVITATION: "GAME_INVITATION",
  GAME_REMINDER: "GAME_REMINDER",
  TEAM_JOINED: "TEAM_JOINED",
  TEAM_LEFT: "TEAM_LEFT",
  MATCH_RESULT: "MATCH_RESULT",
  ACHIEVEMENT_UNLOCKED: "ACHIEVEMENT_UNLOCKED",
};

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED]: "👥",
  [NOTIFICATION_TYPES.TEAM_INVITE_ACCEPTED]: "✅",
  [NOTIFICATION_TYPES.NEW_FOLLOWER]: "👤",
  [NOTIFICATION_TYPES.POST_LIKED]: "❤️",
  [NOTIFICATION_TYPES.GAME_INVITATION]: "⚽",
  [NOTIFICATION_TYPES.GAME_REMINDER]: "⏰",
  [NOTIFICATION_TYPES.TEAM_JOINED]: "🎯",
  [NOTIFICATION_TYPES.TEAM_LEFT]: "👋",
  [NOTIFICATION_TYPES.MATCH_RESULT]: "🏆",
  [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: "🎖️",
};

export const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED]:
    "bg-blue-100 border-blue-200 text-blue-800",
  [NOTIFICATION_TYPES.TEAM_INVITE_ACCEPTED]:
    "bg-green-100 border-green-200 text-green-800",
  [NOTIFICATION_TYPES.NEW_FOLLOWER]:
    "bg-purple-100 border-purple-200 text-purple-800",
  [NOTIFICATION_TYPES.POST_LIKED]: "bg-red-100 border-red-200 text-red-800",
  [NOTIFICATION_TYPES.GAME_INVITATION]:
    "bg-orange-100 border-orange-200 text-orange-800",
  [NOTIFICATION_TYPES.GAME_REMINDER]:
    "bg-yellow-100 border-yellow-200 text-yellow-800",
  [NOTIFICATION_TYPES.TEAM_JOINED]:
    "bg-indigo-100 border-indigo-200 text-indigo-800",
  [NOTIFICATION_TYPES.TEAM_LEFT]: "bg-gray-100 border-gray-200 text-gray-800",
  [NOTIFICATION_TYPES.MATCH_RESULT]:
    "bg-emerald-100 border-emerald-200 text-emerald-800",
  [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]:
    "bg-amber-100 border-amber-200 text-amber-800",
};

export const NOTIFICATION_PRIORITIES = {
  [NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED]: "high",
  [NOTIFICATION_TYPES.TEAM_INVITE_ACCEPTED]: "medium",
  [NOTIFICATION_TYPES.NEW_FOLLOWER]: "low",
  [NOTIFICATION_TYPES.POST_LIKED]: "low",
  [NOTIFICATION_TYPES.GAME_INVITATION]: "high",
  [NOTIFICATION_TYPES.GAME_REMINDER]: "medium",
  [NOTIFICATION_TYPES.TEAM_JOINED]: "medium",
  [NOTIFICATION_TYPES.TEAM_LEFT]: "low",
  [NOTIFICATION_TYPES.MATCH_RESULT]: "medium",
  [NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED]: "low",
};

/**
 * Retorna as configurações de estilo para um tipo de notificação
 */
export function getNotificationConfig(type) {
  return {
    icon: NOTIFICATION_ICONS[type] || "📢",
    colors:
      NOTIFICATION_COLORS[type] || "bg-gray-100 border-gray-200 text-gray-800",
    priority: NOTIFICATION_PRIORITIES[type] || "low",
  };
}

/**
 * Gera mensagens padronizadas baseadas no tipo e metadata
 */
export function generateNotificationMessage(
  type,
  metadata = {},
  senderName = "Usuário"
) {
  switch (type) {
    case NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED:
      return `${senderName} convidou você para entrar no time ${
        metadata.teamName || "um time"
      }`;

    case NOTIFICATION_TYPES.TEAM_INVITE_ACCEPTED:
      return `${senderName} aceitou seu convite para entrar no time ${
        metadata.teamName || "seu time"
      }`;

    case NOTIFICATION_TYPES.NEW_FOLLOWER:
      return `${senderName} começou a seguir você`;

    case NOTIFICATION_TYPES.POST_LIKED:
      return `${senderName} curtiu seu post: "${
        metadata.postTitle || "seu post"
      }"`;

    case NOTIFICATION_TYPES.GAME_INVITATION:
      return `${senderName} convidou você para participar da partida "${
        metadata.gameName || "uma partida"
      }"`;

    case NOTIFICATION_TYPES.GAME_REMINDER:
      return `Lembrete: A partida "${
        metadata.gameName || "sua partida"
      }" começa em ${metadata.timeUntilStart || "1 hora"}`;

    case NOTIFICATION_TYPES.TEAM_JOINED:
      return `${senderName} entrou no time ${metadata.teamName || "um time"}`;

    case NOTIFICATION_TYPES.TEAM_LEFT:
      return `${senderName} saiu do time ${metadata.teamName || "um time"}`;

    case NOTIFICATION_TYPES.MATCH_RESULT:
      return `Resultado da partida: ${metadata.homeTeam || "Time A"} ${
        metadata.homeScore || "0"
      } x ${metadata.awayScore || "0"} ${metadata.awayTeam || "Time B"}`;

    case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED:
      return `🎉 Você desbloqueou a conquista: ${
        metadata.achievementName || "Nova conquista"
      }`;

    default:
      return metadata.message || "Você tem uma nova notificação";
  }
}

/**
 * Gera URLs de ação baseadas no tipo e metadata
 */
export function generateNotificationActionUrl(type, metadata = {}) {
  switch (type) {
    case NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED:
      return `/teams/${metadata.teamId}/invites/${metadata.inviteId}`;

    case NOTIFICATION_TYPES.TEAM_INVITE_ACCEPTED:
      return `/teams/${metadata.teamId}`;

    case NOTIFICATION_TYPES.NEW_FOLLOWER:
      return `/user/${metadata.followerId}`;

    case NOTIFICATION_TYPES.POST_LIKED:
      return `/feed/post/${metadata.postId}`;

    case NOTIFICATION_TYPES.GAME_INVITATION:
      return `/games/${metadata.gameId}/invite/${metadata.inviteId}`;

    case NOTIFICATION_TYPES.GAME_REMINDER:
      return `/games/${metadata.gameId}`;

    case NOTIFICATION_TYPES.TEAM_JOINED:
    case NOTIFICATION_TYPES.TEAM_LEFT:
      return `/teams/${metadata.teamId}`;

    case NOTIFICATION_TYPES.MATCH_RESULT:
      return `/games/${metadata.gameId}/results`;

    case NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED:
      return `/user/achievements/${metadata.achievementId}`;

    default:
      return metadata.actionUrl || "/notifications";
  }
}

/**
 * Determina se uma notificação requer ação do usuário
 */
export function requiresUserAction(type) {
  const actionableTypes = [
    NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED,
    NOTIFICATION_TYPES.GAME_INVITATION,
  ];

  return actionableTypes.includes(type);
}

/**
 * Determina se uma notificação deve ser exibida como toast
 */
export function shouldShowAsToast(type, priority = "low") {
  const toastTypes = [
    NOTIFICATION_TYPES.TEAM_INVITE_RECEIVED,
    NOTIFICATION_TYPES.GAME_INVITATION,
    NOTIFICATION_TYPES.GAME_REMINDER,
    NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCKED,
  ];

  return toastTypes.includes(type) || priority === "high";
}

/**
 * Ordena notificações por prioridade e timestamp
 */
export function sortNotificationsByPriority(notifications) {
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  return [...notifications].sort((a, b) => {
    const aPriority = NOTIFICATION_PRIORITIES[a.type] || "low";
    const bPriority = NOTIFICATION_PRIORITIES[b.type] || "low";

    // Primeiro, ordena por prioridade
    const priorityDiff = priorityOrder[bPriority] - priorityOrder[aPriority];
    if (priorityDiff !== 0) return priorityDiff;

    // Depois, por timestamp (mais recente primeiro)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}
