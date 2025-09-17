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
  const [selectedPlayers, setSelectedPlayers] = useState([]); // { id, username, status: 'pending' | 'accepted' | 'rejected' }

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
      setMutualFollows(mutual);
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

    try {
      const teamResponse = await api.teams.create({ nameTeam: teamName });
      const teamId = teamResponse.id;

      // Enviar convites para os jogadores selecionados
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
