"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import TeamInviteCard from "@/app/components/cards/TeamInviteCard";
import { useAuth } from "@/app/context/AuthContext";

export default function TeamInviteList() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvites = async () => {
    if (!isAuthenticated || !user || user.userType !== "PLAYER") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.teams.getMyPendingInvites();
      const invitesData =
        response?.content ?? response?.invites ?? response ?? [];
      
      setInvites(Array.isArray(invitesData) ? invitesData : []);
    } catch (err) {
      console.error("Erro ao buscar convites:", err);
      setError(err.message || "Falha ao carregar convites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchInvites();
    }
  }, [isAuthenticated, authLoading]);

  if (loading) {
    return <p>Carregando convites...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  if (invites.length === 0) {
    return <p>Nenhum convite pendente.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Meus Convites de Time
      </h2>
      {invites.map((invite) => (
        <TeamInviteCard
          key={invite.id}
          invite={invite}
          onUpdate={fetchInvites}
        />
      ))}
    </div>
  );
}
