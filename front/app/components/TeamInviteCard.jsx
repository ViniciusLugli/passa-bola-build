"use client";

import { useState } from "react";
import { api } from "@/app/lib/api";
import Button from "@/app/components/Button";

export default function TeamInviteCard({ invite, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.teams.acceptInvite(invite.id);
      onUpdate(); // Notifica o componente pai para recarregar os convites
    } catch (err) {
      setError(err.message || "Falha ao aceitar convite.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.teams.rejectInvite(invite.id);
      onUpdate();
    } catch (err) {
      setError(err.message || "Falha ao rejeitar convite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Convite para o Time: {invite.teamName}
      </h3>
      <p className="text-gray-600">
        Enviado por: {invite.senderUsername} em{" "}
        {new Date(invite.createdAt).toLocaleDateString()}
      </p>
      <p className="text-gray-600">Status: {invite.status}</p>

      {invite.status === "PENDING" && (
        <div className="mt-4 flex space-x-4">
          <Button onClick={handleAccept} disabled={loading}>
            {loading ? "Aceitando..." : "Aceitar"}
          </Button>
          <Button onClick={handleReject} disabled={loading} variant="secondary">
            {loading ? "Rejeitando..." : "Rejeitar"}
          </Button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
