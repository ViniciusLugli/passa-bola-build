"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";
import { api } from "@/app/lib/api";
import GameCard from "@/app/components/GameCard";
import { useAuth } from "@/app/context/AuthContext";

function Calendar() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserGames = async () => {
      if (authLoading) return; // Espera o carregamento do usuário

      if (!isAuthenticated || !user) {
        setError("Você precisa estar logado para ver o calendário de jogos.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Buscar jogos em que o usuário logado se inscreveu
        const response = await api.gameParticipants.getMyParticipations();
        let fetchedParticipations = response.content || [];

        // Extrair os objetos de jogo das participações
        const fetchedGames = fetchedParticipations
          .map((p) => p.game)
          .filter(Boolean); // Filtrar participações sem jogo (se houver)

        // Ordenar os jogos por data, do mais próximo para o mais distante
        fetchedGames.sort(
          (a, b) => new Date(a.gameDate) - new Date(b.gameDate)
        );

        setGames(fetchedGames);
      } catch (err) {
        setError(err.message || "Falha ao carregar os jogos inscritos.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserGames();
  }, [isAuthenticated, user, authLoading]);

  return (
    <div className="bg-gray-100 min-h-screen">
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
          Calendário de Jogos
        </h1>

        {loading && <p className="text-center">Carregando jogos...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <section className="flex flex-col gap-6">
            {games.length > 0 ? (
              games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onGameUpdate={fetchUserGames} // Passar a função de re-fetch
                />
              ))
            ) : (
              <p className="text-center text-gray-500">
                Nenhum jogo encontrado no calendário.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default function CalendarPage() {
  return <Calendar />;
}
