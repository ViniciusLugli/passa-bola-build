import PlayerStats from "@/app/components/profile/PlayerStats";

/**
 * Componente de conteúdo da tab Ranking
 * Exibe estatísticas e ranking da jogadora
 *
 * @param {Object} profileUser - Dados do usuário do perfil
 * @param {Object} playerStats - Estatísticas do jogador
 */
export default function RankingTabContent({ profileUser, playerStats }) {
  if (profileUser?.userType !== "PLAYER") {
    return (
      <div
        role="tabpanel"
        id="ranking-panel"
        aria-labelledby="ranking-tab"
        tabIndex={0}
        className="bg-surface-muted border border-default rounded-xl p-8 text-center"
      >
        <p className="text-secondary">
          Ranking disponível apenas para jogadoras.
        </p>
      </div>
    );
  }

  return (
    <section
      role="tabpanel"
      id="ranking-panel"
      aria-labelledby="ranking-tab"
      tabIndex={0}
    >
      <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">
        Estatísticas e Ranking
      </h3>
      <PlayerStats stats={playerStats} />
    </section>
  );
}
