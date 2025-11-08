"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/app/components/ui/Modal";
import Input from "@/app/components/ui/Input";
import InviteResultsList from "./InviteResultsList";
import InviteSelectedFooter from "./InviteSelectedFooter";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/context/ToastContext";

export default function InviteMemberModal({
  isOpen,
  onClose,
  teamId,
  onInviteSuccess,
}) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [mutualFollows, setMutualFollows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllPages = async (fn, size = 50) => {
    let page = 0;
    const all = [];
    while (true) {
      const res = await fn({ page, size });
      const content = res?.content || [];
      all.push(...content);
      const totalPages =
        res?.totalPages ?? (content.length < size ? page + 1 : page + 1);
      if (page + 1 >= totalPages) break;
      page += 1;
    }
    return all;
  };

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
      setSelectedPlayers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    // load existing invites for the team to avoid re-inviting
    let mounted = true;
    const loadInvites = async () => {
      if (!isOpen || !teamId) return;
      try {
        const res = await api.teams.getTeamInvites(teamId);
        const list = Array.isArray(res) ? res : res?.content || [];
        const ids = new Set(
          list.map(
            (it) =>
              it?.invitedPlayer?.id ??
              it?.invitedPlayerId ??
              it?.playerId ??
              it?.id
          )
        );
        if (mounted) setInvitedIds(ids);
      } catch (err) {
        console.warn("Falha ao carregar convites do time:", err);
      }
    };
    loadInvites();
    return () => {
      mounted = false;
    };
  }, [isOpen, teamId]);

  useEffect(() => {
    let mounted = true;
    const loadMutualFollows = async () => {
      if (!isOpen) return;
      try {
        const [myFollowers, myFollowing] = await Promise.all([
          fetchAllPages(api.follow.getMyFollowers),
          fetchAllPages(api.follow.getMyFollowing),
        ]);

        const mutual = myFollowers.filter((follower) =>
          myFollowing.some((f) => f.targetUserId === follower.followerId)
        );

        const normalize = (p) => {
          const id =
            p?.followerId ??
            p?.id ??
            p?.targetUserId ??
            p?.follower?.id ??
            null;
          const username =
            p?.followerUsername ??
            p?.username ??
            p?.targetUsername ??
            p?.follower?.username ??
            null;
          const profilePhoto =
            p?.profilePhoto ??
            p?.follower?.profilePhotoUrl ??
            p?.profilePhotoUrl ??
            null;
          const name = p?.followerName ?? p?.name ?? p?.follower?.name ?? null;
          const email = p?.followerEmail ?? p?.email ?? null;
          return { id, username, profilePhoto, name, email };
        };

        const normalized = mutual.map(normalize);
        const unique = normalized.filter((player, idx, self) => {
          if (!player.id || !player.username) return false;
          return idx === self.findIndex((p) => p.id === player.id);
        });

        if (mounted) setMutualFollows(unique);
      } catch (err) {
        console.error("Erro ao carregar mutual follows:", err);
      }
    };

    loadMutualFollows();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    // filter mutualFollows client-side with debounce
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        const q = query.trim().toLowerCase();
        const filtered = mutualFollows.filter((p) => {
          const username = String(p.username || "").toLowerCase();
          const name = String(p.name || "").toLowerCase();
          const email = String(p.email || "").toLowerCase();
          return username.includes(q) || name.includes(q) || email.includes(q);
        });
        // exclude already invited players from results (they'll be shown as invited elsewhere)
        const final = filtered.map((p) => ({ ...p })).slice(0, 50);
        setResults(final);
      } catch (err) {
        console.error("Erro ao filtrar mutual follows:", err);
        setError(err?.message || "Erro ao buscar jogadoras");
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, mutualFollows]);

  useEffect(() => {
    // whenever invitedIds changes, remove those players from selectedPlayers
    if (!invitedIds || invitedIds.size === 0) return;
    setSelectedPlayers((prev) => prev.filter((p) => !invitedIds.has(p.id)));
  }, [invitedIds]);

  const handleInvite = async (player) => {
    if (!teamId) return;
    setActionLoading(true);
    setError(null);
    try {
      const playerId = player?.id ?? player?.playerId ?? player?.player_id;
      if (invitedIds.has(playerId)) {
        showToast("Jogadora já foi convidada.", "info");
        setActionLoading(false);
        return;
      }
      await api.teams.sendInvite(teamId, playerId);
      // mark as invited locally
      setInvitedIds((prev) => {
        const s = new Set(prev);
        s.add(playerId);
        return s;
      });
      if (onInviteSuccess) onInviteSuccess();
      showToast(
        "Convite enviado com sucesso (se o usuário existir).",
        "success"
      );
      onClose();
    } catch (err) {
      console.error("Falha ao enviar convite:", err);
      setError(err?.message || "Falha ao enviar convite");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (player) => {
    const playerId = player?.id ?? player?.playerId ?? player?.player_id;
    if (invitedIds.has(playerId)) {
      showToast("Esta jogadora já foi convidada.", "info");
      return;
    }
    setSelectedPlayers((prev) => {
      const exists = prev.some((p) => String(p.id) === String(playerId));
      if (exists) return prev.filter((p) => String(p.id) !== String(playerId));
      return [...prev, { id: playerId, username: player.username }];
    });
  };

  const sendSelectedInvites = async () => {
    if (!teamId || selectedPlayers.length === 0) {
      setError("Selecione ao menos uma jogadora para convidar.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const toInvite = selectedPlayers.filter((p) => !invitedIds.has(p.id));
      if (toInvite.length === 0) {
        showToast("Nenhuma jogadora selecionada precisa de convite.", "info");
        setSelectedPlayers([]);
        setActionLoading(false);
        return;
      }
      for (const p of toInvite) {
        await api.teams.sendInvite(teamId, p.id);
        setInvitedIds((prev) => {
          const s = new Set(prev);
          s.add(p.id);
          return s;
        });
      }
      if (onInviteSuccess) onInviteSuccess();
      showToast("Convites enviados com sucesso.", "success");
      setSelectedPlayers([]);
      onClose();
    } catch (err) {
      console.error("Falha ao enviar convites:", err);
      setError(err?.message || "Falha ao enviar convites");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Convidar jogadora"}>
      <div className="space-y-4">
        <Input
          label="Buscar jogadora"
          placeholder="Nome ou username (mínimo 2 caracteres)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <InviteResultsList
          results={results}
          loading={loading}
          invitedIds={invitedIds}
          selectedPlayers={selectedPlayers}
          toggleSelect={toggleSelect}
          handleInvite={handleInvite}
          actionLoading={actionLoading}
          query={query}
          error={error}
        />

        <InviteSelectedFooter
          selectedPlayers={selectedPlayers}
          clearSelected={() => setSelectedPlayers([])}
          sendSelectedInvites={sendSelectedInvites}
          actionLoading={actionLoading}
        />
      </div>
    </Modal>
  );
}
