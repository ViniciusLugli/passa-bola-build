"use client";

export default function DayCell({ cell, isSelected, onSelect, selectedTypes }) {
  const hasGames = cell && cell.games && cell.games.length > 0;
  const key = cell ? cell.date.toISOString().slice(0, 10) : null;

  const handleClick = () => {
    if (!cell) return;
    if (isSelected) onSelect(null);
    else onSelect(key);
  };

  return (
    <div
      onClick={handleClick}
      role={cell ? "button" : undefined}
      tabIndex={cell ? 0 : -1}
      className={`min-h-[64px] sm:min-h-[90px] md:min-h-[120px] p-2 sm:p-3 rounded-lg border cursor-pointer transition-shadow ${
        cell
          ? `${
              hasGames
                ? "bg-green-600/8 border-success hover:bg-green-600/16"
                : "bg-surface hover:shadow-lg"
            } ${isSelected ? "ring-2 ring-accent" : ""}`
          : "bg-transparent"
      }`}
      aria-label={
        cell
          ? `Dia ${cell.date.getDate()}${
              hasGames ? `, ${cell.games.length} jogos` : ""
            }`
          : undefined
      }
    >
      {cell ? (
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-2">
            <div
              className={`font-semibold text-sm sm:text-base ${
                hasGames ? "text-primary" : "text-primary"
              }`}
            >
              {cell.date.getDate()}
            </div>
            <div className="flex items-center gap-2">
              {hasGames && (
                <div className="text-xs text-secondary">
                  {cell.games.length} jogos
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            {hasGames ? (
              cell.games
                .filter((g) =>
                  selectedTypes.length
                    ? selectedTypes.includes(g.gameType)
                    : true
                )
                .slice(0, 2)
                .map((g) => (
                  <div
                    key={g.id}
                    className="text-xs sm:text-sm text-primary truncate"
                    title={g.gameName || g.championship || "Partida"}
                  >
                    {new Date(g.gameDate).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    — {g.gameName || g.championship || "Partida"}
                  </div>
                ))
            ) : (
              <div className="text-xs sm:text-sm text-tertiary">—</div>
            )}

            {hasGames && cell.games.length > 2 && (
              <div className="text-xs text-secondary mt-1">
                +{cell.games.length - 2} mais
              </div>
            )}
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
