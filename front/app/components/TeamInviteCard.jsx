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
      const inviteId = invite?.id ?? invite?.inviteId ?? invite?.invite?.id;
      if (!inviteId) throw new Error("Invite id ausente na requisição.");
      await api.teams.acceptInvite(inviteId);
      onUpdate();
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("teams:changed"));
        }
      } catch (e) {}
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
      const inviteId = invite?.id ?? invite?.inviteId ?? invite?.invite?.id;
      if (!inviteId) throw new Error("Invite id ausente na requisição.");
      await api.teams.rejectInvite(inviteId);
      onUpdate();
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("teams:changed"));
        }
      } catch (e) {}
    } catch (err) {
      setError(err.message || "Falha ao rejeitar convite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Convite para o Time:{" "}
        {invite?.teamName ?? invite?.team?.name ?? "(time)"}
      </h3>
      <p className="text-gray-600">
        Enviado por:{" "}
        {invite?.senderUsername ?? invite?.sender?.username ?? "(remetente)"} em{" "}
        {invite?.createdAt
          ? new Date(invite.createdAt).toLocaleDateString()
          : "(data)"}
      </p>
      <p className="text-gray-600">
        Status: {invite?.status ?? invite?.inviteStatus ?? "(status)"}
      </p>

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
