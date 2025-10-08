"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import GameCard from "@/app/components/GameCard";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: loggedInUser, isAuthenticated } = useAuth();

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.games.getAll();
      let fetchedGames = response.content || [];

      // Se o usuário está logado e for PLAYER ou ORGANIZATION, verificar em quais jogos ele está inscrito
      if (isAuthenticated && loggedInUser) {
        const role = String(loggedInUser.userType || "").toUpperCase();
        if (role === "PLAYER" || role === "ORGANIZATION") {
          try {
            const participationsResponse =
              await api.gameParticipants.getMyParticipations({
                page: 0,
                size: 100,
              });
            const myParticipations = participationsResponse.content || [];

            // Criar um Set com os IDs dos jogos em que estou inscrito
            const joinedGameIds = new Set(
              myParticipations
                .map((p) => p.gameId || p.game?.id)
                .filter(Boolean)
            );

            // Marcar cada jogo com isJoined
            fetchedGames = fetchedGames.map((game) => {
              const isJoined = joinedGameIds.has(game.id);
              return {
                ...game,
                isJoined,
              };
            });
          } catch (participationError) {
            console.error("Erro ao buscar participações:", participationError);
            // Continua sem marcar jogos como joined
          }
        } else {
          // Usuários SPECTATOR não possuem participações via this endpoint; skip para evitar 403 no servidor
        }
      }

      setGames(fetchedGames);
    } catch (err) {
      console.error("Erro ao buscar jogos:", err);
      setError(err.message || "Falha ao carregar os jogos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated]);

  const handleGameUpdate = () => {
    fetchGames();
  };

  return (
    <div className="transparent min-h-screen pb-24 sm:pb-20">
      <Header />
      <main
        className="
        container 
        mx-auto 
        px-3 sm:px-4 md:px-6 lg:px-8
        py-4 sm:py-6 md:py-8 lg:py-12 
        max-w-7xl
      "
      >
        <div className="bg-white border border-zinc-300 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-10">
          <h1
            className="
            text-2xl sm:text-3xl md:text-4xl lg:text-5xl
            font-extrabold 
            text-gray-900 
            leading-tight
            mb-6 sm:mb-8 md:mb-10
            text-center
          "
          >
            Jogos Disponíveis
          </h1>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <p className="text-center text-gray-600 font-medium">
                Carregando jogos...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <span className="text-4xl mb-3 block">⚠️</span>
              <p className="text-red-700 font-semibold text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <section className="space-y-4 sm:space-y-5 md:space-y-6">
              {games.length > 0 ? (
                games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onGameUpdate={handleGameUpdate}
                  />
                ))
              ) : (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 sm:p-12 text-center">
                  <span className="text-5xl sm:text-6xl mb-4 block">🎮</span>
                  <p className="text-gray-700 font-semibold text-lg sm:text-xl mb-2">
                    Nenhum jogo encontrado
                  </p>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Seja o primeiro a criar um jogo!
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {(!isAuthenticated ||
        (loggedInUser &&
          String(loggedInUser.userType || "").toUpperCase() !==
            "SPECTATOR")) && (
        <Link
          href="/games/newGame"
          className="
          fixed 
          bottom-4 sm:bottom-6 md:bottom-8
          right-4 sm:right-6 md:right-8
          p-3 sm:p-4
          rounded-full 
          bg-gradient-to-br from-purple-600 to-indigo-700
          text-white 
          shadow-2xl
          hover:shadow-purple-500/50
          hover:from-purple-700
          hover:to-indigo-800
          active:scale-95
          transition-all
          duration-300
          z-50
          group
        "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-7 h-7 sm:w-8 sm:h-8 group-hover:rotate-90 transition-transform duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default function GamesPage() {
  return <Games />;
}
