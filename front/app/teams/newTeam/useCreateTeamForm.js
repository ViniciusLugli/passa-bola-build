"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export const useCreateTeamForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [mutualFollows, setMutualFollows] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const fetchFollowData = useCallback(async () => {
    if (!user) return;

    try {
      const [myFollowersResponse, myFollowingResponse] = await Promise.all([
        api.follow.getMyFollowers(),
        api.follow.getMyFollowing(),
      ]);

      const myFollowers = myFollowersResponse.content || [];
      const myFollowing = myFollowingResponse.content || [];

      setFollowers(myFollowers);
      setFollowing(myFollowing);

      const mutual = myFollowers.filter((follower) =>
        myFollowing.some((f) => f.targetUserId === follower.followerId)
      );

      const normalize = (p) => {
        const id =
          p?.followerId ??
          p?.id ??
          p?.targetUserId ??
          p?.follower?.id ??
          p?.targetId ??
          null;
        const username =
          p?.followerUsername ??
          p?.username ??
          p?.targetUsername ??
          p?.follower?.username ??
          p?.targetUserUsername ??
          null;
        const profilePhoto =
          p?.profilePhoto ??
          p?.follower?.profilePhotoUrl ??
          p?.profilePhotoUrl ??
          null;
        return { id, username, profilePhoto };
      };

      const normalizedMutual = mutual.map(normalize);

      const uniqueMutual = normalizedMutual.filter((player, index, self) => {
        if (!player.id || !player.username) return false;
        return index === self.findIndex((p) => p.id === player.id);
      });

      console.log("Seguidores mútuos encontrados:", uniqueMutual.length);
      setMutualFollows(uniqueMutual);
    } catch (err) {
      console.error("Erro ao buscar dados de seguidores:", err);
      setError("Falha ao carregar seguidores e seguidos.");
    }
  }, [user]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  const handleSelectPlayer = (player) => {
    setSelectedPlayers((prevSelected) => {
      if (prevSelected.some((p) => p.id === player.id)) {
        return prevSelected.filter((p) => p.id !== player.id);
      } else {
        return [
          ...prevSelected,
          { id: player.id, username: player.username, status: "pending" },
        ];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!user || user.userType !== "PLAYER") {
      setError("Apenas jogadores podem criar times.");
      setLoading(false);
      return;
    }

    if (!teamName.trim()) {
      setError("O nome do time não pode ser vazio.");
      setLoading(false);
      return;
    }

    if (selectedPlayers.length === 0) {
      setError(
        "Você precisa convidar pelo menos 1 jogadora para criar um time."
      );
      setLoading(false);
      return;
    }

    try {
      const teamResponse = await api.teams.create({ nameTeam: teamName });
      const teamId = teamResponse?.id ?? teamResponse?.content?.id;
      if (!teamId) {
        console.warn("Resposta inesperada ao criar time:", teamResponse);
        throw new Error("Id do time não encontrado na resposta do servidor.");
      }

      for (const player of selectedPlayers) {
        await api.teams.sendInvite(teamId, player.id);
      }

      setSuccess(true);
      setTeamName("");
      setSelectedPlayers([]);
      router.push("/teams");
    } catch (err) {
      console.error("Erro ao criar time ou enviar convites:", err);
      setError(
        err.message ||
          "Falha ao criar time ou enviar convites. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    teamName,
    setTeamName,
    loading,
    error,
    success,
    handleSubmit,
    mutualFollows,
    selectedPlayers,
    handleSelectPlayer,
  };
};
