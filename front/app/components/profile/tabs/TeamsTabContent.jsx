import TeamList from "@/app/components/profile/TeamList";

/**
 * Componente de conteúdo da tab Teams
 * Exibe lista de times do jogador
 *
 * @param {Array} teams - Lista de times
 * @param {boolean} isLoading - Estado de carregamento
 */
export default function TeamsTabContent({ teams, isLoading }) {
  return (
    <section
      role="tabpanel"
      id="teams-panel"
      aria-labelledby="teams-tab"
      tabIndex={0}
    >
      <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">
        Times
      </h3>
      <TeamList teams={teams} isLoading={isLoading} />
    </section>
  );
}
