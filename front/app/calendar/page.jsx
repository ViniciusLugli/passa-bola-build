"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import { api } from "@/app/lib/api";
import GameCard from "@/app/components/GameCard";
import { useAuth } from "@/app/context/AuthContext";

function Calendar() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [gamesThisWeek, setGamesThisWeek] = useState([]);
  const [gamesThisMonth, setGamesThisMonth] = useState([]);
  const [gamesFuture, setGamesFuture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterGamesByDate = (games) => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const week = [];
    const month = [];
    const future = [];

    games.forEach((game) => {
      const gameDate = new Date(game.gameDate);

      if (gameDate <= endOfWeek) {
        week.push(game);
      } else if (gameDate <= endOfMonth) {
        month.push(game);
      } else {
        future.push(game);
      }
    });

    return { week, month, future };
  };

  const fetchUserGames = async () => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setError("Você precisa estar logado para ver o calendário de jogos.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await api.gameParticipants.getMyParticipations({
        page: 0,
        size: 100,
      });
      let fetchedParticipations = response.content || [];

      const gameIds = fetchedParticipations
        .map((p) => p.gameId)
        .filter(Boolean);

      if (gameIds.length === 0) {
        setGamesThisWeek([]);
        setGamesThisMonth([]);
        setGamesFuture([]);
        setLoading(false);
        return;
      }

      const allGamesResponse = await api.games.getAll({ page: 0, size: 1000 });
      const allGames = allGamesResponse.content || [];

      const fetchedGames = allGames
        .filter((game) => gameIds.includes(game.id))
        .map((game) => ({
          ...game,
          isJoined: true,
        }));

      fetchedGames.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

      const { week, month, future } = filterGamesByDate(fetchedGames);

      setGamesThisWeek(week);
      setGamesThisMonth(month);
      setGamesFuture(future);
    } catch (err) {
      console.error("Erro ao carregar calendário:", err);
      setError(err.message || "Falha ao carregar os jogos inscritos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGames();
  }, [isAuthenticated, user, authLoading]);

  const renderSection = (title, games, emptyMessage) => (
    <section className="mb-12">
      <div
        className="
          bg-gradient-to-r 
          from-purple-700 
          to-purple-900
          rounded-xl
          p-6
          mb-6
          shadow-lg
        "
      >
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      {games.length > 0 ? (
        <div className="flex flex-col gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onGameUpdate={() => {
                fetchUserGames();
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="
            bg-gray-50
            border-2
            border-dashed
            border-gray-300
            rounded-xl
            p-8
            text-center
          "
        >
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      )}
    </section>
  );

  return (
    <div className="transparent min-h-screen">
      <Header />
      <main
        className="
        container 
        mx-auto 
        p-4 md:p-8 lg:p-12 
        max-w-4xl
      "
      >
        <h1
          className="
          text-4xl 
          font-extrabold 
          text-gray-900 
          leading-tight
          mb-8
          text-center
        "
        >
          Meu Calendário de Jogos
        </h1>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando seus jogos...</p>
          </div>
        )}

        {error && (
          <div
            className="
              bg-red-50
              border-2
              border-red-300
              rounded-xl
              p-6
              text-center
            "
          >
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {renderSection(
              "Jogos nos Próximos 7 Dias",
              gamesThisWeek,
              "Nenhum jogo programado para esta semana"
            )}

            {renderSection(
              "Jogos Neste Mês",
              gamesThisMonth,
              "Nenhum jogo adicional este mês"
            )}

            {renderSection(
              "Jogos Futuros",
              gamesFuture,
              "Nenhum jogo distante agendado"
            )}

            {gamesThisWeek.length === 0 &&
              gamesThisMonth.length === 0 &&
              gamesFuture.length === 0 && (
                <div
                  className="
                    bg-gradient-to-br
                    from-purple-50
                    to-blue-50
                    border-2
                    border-purple-200
                    rounded-xl
                    p-12
                    text-center
                  "
                >
                  <span className="text-6xl mb-4 block">⚽</span>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Seu calendário está vazio
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Inscreva-se em jogos para vê-los aparecer aqui!
                  </p>
                  <a
                    href="/games"
                    className="
                      inline-block
                      bg-purple-600
                      hover:bg-purple-700
                      text-white
                      font-bold
                      py-3
                      px-8
                      rounded-xl
                      transition-all
                      duration-300
                      shadow-lg
                      hover:scale-105
                    "
                  >
                    Ver Jogos Disponíveis
                  </a>
                </div>
              )}
          </>
        )}
      </main>
    </div>
  );
}

export default function CalendarPage() {
  return <Calendar />;
}
