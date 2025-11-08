import GameList from "@/app/components/profile/GameList";

/**
 * Componente de conteúdo da tab Games
 * Exibe lista de jogos do usuário
 *
 * @param {Array} games - Lista de jogos
 * @param {boolean} isLoading - Estado de carregamento
 * @param {Function} onGameUpdate - Callback quando um jogo é atualizado
 */
export default function GamesTabContent({ games, isLoading, onGameUpdate }) {
  return (
    <section
      role="tabpanel"
      id="games-panel"
      aria-labelledby="games-tab"
      tabIndex={0}
    >
      <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">
        Jogos
      </h3>
      <GameList
        games={games}
        isLoading={isLoading}
        onGameUpdate={onGameUpdate}
      />
    </section>
  );
}
