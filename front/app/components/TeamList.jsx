"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import TeamCard from "@/app/components/TeamCard"; // Assumindo que você tem um componente TeamCard

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.teams.getAll();
        setTeams(response.teams || []);
      } catch (err) {
        console.error("Erro ao buscar times:", err);
        setError(err.message || "Falha ao carregar times.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return <p>Carregando times...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  if (teams.length === 0) {
    return <p>Nenhum time encontrado.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
