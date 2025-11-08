import { Trophy, TrendingUp, Target, Award, Zap, Calendar } from "lucide-react";

export default function PlayerStats({ stats }) {
  // Exibir mensagem quando não há ranking
  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 rounded-2xl border border-purple-500/30 p-8 text-center">
        <Trophy className="h-16 w-16 text-purple-500 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2">
          Sem Ranking
        </h3>
        <p className="text-secondary text-sm">
          Participe de jogos competitivos (Campeonatos e Copas) para obter seu
          ranking e estatísticas!
        </p>
      </div>
    );
  }

  const getDivisionColor = (division) => {
    const colors = {
      BRONZE: "from-amber-700 to-amber-900",
      PRATA: "from-gray-400 to-gray-600",
      OURO: "from-yellow-400 to-yellow-600",
      PLATINA: "from-cyan-400 to-cyan-600",
      DIAMANTE: "from-purple-400 to-purple-600",
      MESTRE: "from-red-400 to-red-600",
      GRANDMASTER: "from-orange-400 to-orange-600",
      CHALLENGER: "from-blue-400 to-blue-600",
    };
    return colors[division] || "from-gray-400 to-gray-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Divisão e Pontos */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getDivisionColor(
          stats.division
        )} p-6 text-white shadow-lg`}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Divisão Atual</p>
              <h3 className="text-3xl font-bold">{stats.divisionName}</h3>
            </div>
            <Trophy className="h-16 w-16 opacity-20" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pontos Totais</p>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
            </div>
            {stats.pointsToNextDivision && (
              <div className="text-right">
                <p className="text-sm opacity-90">Para Próxima Divisão</p>
                <p className="text-xl font-semibold">
                  {stats.pointsToNextDivision} pts
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-white opacity-5" />
      </div>

      {/* Ranking */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-700/10 border border-purple-500/30 p-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-secondary">Posição Global</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            #{stats.globalPosition}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-700/10 border border-purple-500/30 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-secondary">Posição na Divisão</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            #{stats.divisionPosition}
          </p>
        </div>
      </div>

      {/* Estatísticas de Jogos */}
      <div className="rounded-xl bg-surface border border-default p-6">
        <h4 className="mb-4 text-lg font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-500" />
          Estatísticas de Jogos
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {stats.gamesWon}
            </p>
            <p className="text-sm text-secondary">Vitórias</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {stats.gamesDrawn}
            </p>
            <p className="text-sm text-secondary">Empates</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{stats.gamesLost}</p>
            <p className="text-sm text-secondary">Derrotas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.totalGames}
            </p>
            <p className="text-sm text-secondary">Total</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-secondary">Taxa de Vitória</span>
            </div>
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {stats.winRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Sequências */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-surface border border-default p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <p className="text-sm text-secondary">Sequência Atual</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            {stats.currentStreak > 0 ? "+" : ""}
            {stats.currentStreak}
          </p>
        </div>
        <div className="rounded-xl bg-surface border border-default p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            <p className="text-sm text-secondary">Melhor Sequência</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            {stats.bestStreak}
          </p>
        </div>
      </div>

      {/* Último Jogo */}
      {stats.lastGameDate && (
        <div className="rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-700/5 border border-purple-500/20 p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-secondary">Último Jogo</p>
          </div>
          <p className="mt-2 text-lg font-semibold text-purple-600 dark:text-purple-400">
            {formatDate(stats.lastGameDate)}
          </p>
        </div>
      )}
    </div>
  );
}
