export const getGameTypeLabel = (gameType) => {
  if (!gameType) return "Indefinido";

  switch (gameType) {
    case "FRIENDLY":
      return "Amistoso";
    case "CHAMPIONSHIP":
      return "Campeonato";
    case "CUP":
      return "Copa";
    default:
      return gameType;
  }
};
