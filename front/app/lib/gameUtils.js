// app/lib/gameUtils.js

export const getGameTypeLabel = (gameType) => {
  switch (gameType) {
    case "FRIENDLY":
      return "Amistoso";
    case "CHAMPIONSHIP":
      return "Campeonato";
    case "CUP":
      return "Copa";
    default:
      return gameType; // Retorna o próprio tipo se não for reconhecido
  }
};
