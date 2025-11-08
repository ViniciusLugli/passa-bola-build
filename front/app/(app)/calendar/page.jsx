"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import GameCard from "@/app/components/cards/GameCard";
import { getGameTypeLabel } from "@/app/lib/gameUtils";
import { useAuth } from "@/app/context/AuthContext";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";
import EmptyState from "@/app/components/ui/EmptyState";
import ErrorState from "@/app/components/ui/ErrorState";
import { Calendar as CalendarIcon } from "lucide-react";

import CalendarHeader from "./components/CalendarHeader";
import Filters from "./components/Filters";
import MonthGrid from "./components/MonthGrid";
import GamesListSection from "./components/GamesListSection";

function Calendar() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => setSelectedTypes([]);

  const groupGamesByDay = (games) => {
    const map = {};
    games.forEach((g) => {
      const d = new Date(g.gameDate);
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(g);
    });
    return map;
  };

  const getGamesForMonth = (year, month) => {
    return allGames.filter((g) => {
      const d = new Date(g.gameDate);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  };

  const fetchUserGames = async () => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      setError("Você precisa estar logado para ver o calendário de jogos.");
      setLoading(false);
      return;
    }

    const role = String(user.userType || "").toUpperCase();
    if (role === "SPECTATOR") {
      setAllGames([]);
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
        setAllGames([]);
        setLoading(false);
        return;
      }

      const allGamesResponse = await api.games.getAll({ page: 0, size: 1000 });
      const allGamesResp = allGamesResponse.content || [];

      const fetchedGames = allGamesResp
        .filter((game) => gameIds.includes(game.id))
        .map((game) => ({ ...game, isJoined: true }));

      fetchedGames.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

      const types = Array.from(
        new Set(fetchedGames.map((g) => g.gameType).filter(Boolean))
      );
      setAvailableTypes(types);
      setAllGames(fetchedGames);
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

  const prevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  // build grid cells
  const buildCellsForMonth = () => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const startDay = firstOfMonth.getDay();
    const daysInMonth = lastOfMonth.getDate();

    const monthGames = getGamesForMonth(viewYear, viewMonth);
    const grouped = groupGamesByDay(monthGames);

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const key = date.toISOString().slice(0, 10);
      const games = grouped[key] || [];
      cells.push({ date, games });
    }

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const cells = buildCellsForMonth();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-primary leading-tight mb-8 text-center">
          Meu Calendário de Jogos
        </h1>

        <Filters
          availableTypes={availableTypes}
          selectedTypes={selectedTypes}
          toggleType={toggleType}
        />

        <div className="mb-6">
          <CalendarHeader
            viewYear={viewYear}
            viewMonth={viewMonth}
            onPrev={prevMonth}
            onNext={nextMonth}
            onClear={clearFilters}
            hasFilters={availableTypes.length > 0}
          />

          <MonthGrid
            viewYear={viewYear}
            viewMonth={viewMonth}
            cells={cells}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTypes={selectedTypes}
          />
        </div>

        {loading && (
          <LoadingSkeleton count={3} variant="card" className="mt-8" />
        )}

        {error && (
          <div className="mt-8">
            <ErrorState
              title="Erro ao carregar calendário"
              message={error}
              onRetry={fetchUserGames}
              variant="error"
            />
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8">
              <div className="bg-brand-gradient rounded-xl p-6 mb-6 shadow-elevated">
                <h2 className="text-2xl font-bold text-on-brand">
                  {selectedDate
                    ? `Jogos em ${new Date(selectedDate).toLocaleDateString(
                        "pt-BR",
                        { day: "2-digit", month: "long", year: "numeric" }
                      )}`
                    : `Jogos em ${new Date(
                        viewYear,
                        viewMonth,
                        1
                      ).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}`}
                </h2>
              </div>

              {selectedDate
                ? (() => {
                    const games =
                      groupGamesByDay(getGamesForMonth(viewYear, viewMonth))[
                        selectedDate
                      ] || [];
                    return (
                      <GamesListSection
                        title="Jogos do dia"
                        items={games}
                        emptyMessage="Nenhum jogo neste dia."
                        selectedTypes={selectedTypes}
                        fetchUserGames={fetchUserGames}
                        showHeader={false}
                      />
                    );
                  })()
                : (() => {
                    const monthGames = getGamesForMonth(
                      viewYear,
                      viewMonth
                    ).filter((g) =>
                      selectedTypes.length
                        ? selectedTypes.includes(g.gameType)
                        : true
                    );
                    return monthGames.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {monthGames.map((g) => (
                          <GameCard
                            key={g.id}
                            game={g}
                            onGameUpdate={fetchUserGames}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-surface-muted border-2 border-dashed border-default rounded-xl p-8 text-center">
                        <p className="text-secondary text-lg">
                          Nenhum jogo agendado para este mês.
                        </p>
                        <a
                          href="/games"
                          className="inline-block mt-4 bg-accent hover:bg-accent-strong text-on-brand font-bold py-2 px-4 rounded-md"
                        >
                          Ver Jogos Disponíveis
                        </a>
                      </div>
                    );
                  })()}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function CalendarPage() {
  return <Calendar />;
}
