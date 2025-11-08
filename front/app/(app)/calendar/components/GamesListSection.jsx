"use client";
import GameCard from "@/app/components/cards/GameCard";

export default function GamesListSection({
  title,
  items,
  emptyMessage,
  selectedTypes,
  fetchUserGames,
  showHeader = true,
}) {
  const visible = selectedTypes.length
    ? items.filter((g) => selectedTypes.includes(g.gameType))
    : items;
  return (
    <section className="mb-12">
      {showHeader && (
        <div className="bg-brand-gradient rounded-xl p-6 mb-6 shadow-elevated">
          <h2 className="text-2xl font-bold text-on-brand">{title}</h2>
        </div>
      )}

      {visible.length > 0 ? (
        <div className="flex flex-col gap-6">
          {visible.map((game) => (
            <GameCard key={game.id} game={game} onGameUpdate={fetchUserGames} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-muted border-2 border-dashed border-default rounded-xl p-8 text-center">
          <p className="text-secondary text-lg">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}
